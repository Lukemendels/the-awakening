import {ShopView} from '../shop/view.mjs';
import {quay} from './quay.mjs';
import {sights,sheetPose,registered,drawSight,drawBoard,loadPlates} from './tracings.mjs';
import {arcAction,freshArc,canResumeArc,restoreArc,beginOutro,advanceArc} from '../arc-progress.mjs';
import {loadSave,writeSave} from '../save.mjs';
import {ImmersiveAudio} from '../audio.mjs';
import {CinematicClock} from '../cinematic.mjs';

const $=id=>document.getElementById(id),panel=$('panel'),content=$('content');
const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
const journey=loadSave(storage);
// A direct playtest also works for players who already reached later episodes.
// Their later checkpoint stays available when the replay finishes.
const replay=Boolean(journey.nextArc||journey.finalArc||(journey.arc&&(!canResumeArc(journey.arc)||journey.arc.episode!==3)));
let arc=!replay&&journey.arc?restoreArc(journey.arc):freshArc();
const visit=(!replay&&journey.canalVisit)||{};
let sheet=sheetPose(visit.sheet),active=null,view,film,entered=false,leaving=false,paused=false;
const audio=new ImmersiveAudio();audio.setScene('canal');audio.setEmitter('water',4.2,-2.4);audio.setEmitter('wood',2,1.08);
let soundWanted=journey.shopSound??true;
const plates=loadPlates();
const flags=()=>arc.story35.flags;
function save(){
  if(replay||!entered||leaving)return;
  const current=loadSave(storage);
  current.scene='complete';current.arc=arc;
  current.canalVisit={pose:view?.pose()??visit.pose,sheet,active};current.shopSound=soundWanted;
  $('storage-error').hidden=writeSave(storage,current);
}
function act(id,choice){
  arc=arcAction(arc,{type:'interact',id,choice}).arc;save();
}
function button(label,action,parent=content){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;parent.append(b);return b;
}
function text(value,cls='feedback'){
  const p=document.createElement('p');p.className=cls;p.textContent=value;content.append(p);return p;
}
function close(){if(panel.open)panel.close();active=null;$('guide').textContent='';save();}
function canvas(label,render){
  const wrap=document.createElement('div'),c=document.createElement('canvas');wrap.className='evidence';wrap.append(c);content.append(wrap);
  c.width=1200;c.height=675;c.setAttribute('role','img');c.setAttribute('aria-label',label);
  const ctx=c.getContext('2d');ctx.setTransform(1.5,0,0,1.5,0,0);
  const draw=()=>render(ctx);
  draw();plates.then(()=>{if(c.isConnected)draw();});
  return {c,draw};
}
function coords(c,e){const r=c.getBoundingClientRect();return [(e.clientX-r.left)*800/r.width,(e.clientY-r.top)*450/r.height];}
function inspect(id){
  if(arc.phase!=='room')return;
  active=id;view?.pause();content.replaceChildren();$('guide').textContent='';
  $('heading').textContent=quay.stations[id]?.label??'Field notes';
  if(!panel.open)panel.showModal();panel.scrollTop=0;
  if(sights[id])observe(id);
  else if(id==='chart')board();
  else notes();
  save();
}
function observe(id){
  const sight=sights[id];
  const {c,draw}=canvas('Two pale streaks meet in the water below the cargo. The longer streak has a small nick.',ctx=>drawSight(ctx,id,flags()[id]));
  const caption=text(flags()[id]?'The tracing is tucked into Kaelan’s field notes.':
    'Touch a reflection to trace it onto the page.');
  caption.setAttribute('role','status');
  if(flags()[id])return;
  const spots=[];
  function trace(wake){
    if(!wake){caption.textContent='Amber flickers in separate patches under the lamps. The marks break apart.';return;}
    act(id,'observe');audio.cue('paper');draw();
    caption.textContent='Two streaks, and a nick in the longer one. Kaelan folds the tracing into his notes.';
    for(const spot of spots)spot.remove();c.onclick=null;
  }
  function spot(x,y,label,wake){
    const el=button(label,()=>trace(wake),c.parentElement);el.className='water-spot';el.setAttribute('aria-label',label);
    el.style.left=x/8+'%';el.style.top=y/4.5+'%';spots.push(el);
  }
  spot(sight.x,sight.y,'Trace the pale streaks',true);
  const amber=id==='near_view'?[711,299]:[491,284];
  spot(...amber,'Trace the lantern glint',false);
  c.onclick=e=>{
    const [x,y]=coords(c,e);trace(Math.hypot(x-sight.x,y-sight.y)<96);
  };
}
function notes(){
  const f=flags();
  text('At the temple the last sunlight touched a brass inlay. At the bench the rejected stone lit the same spot.');
  if(f.near_view)text('Lower steps · Two streaks in the wake, one with a nick.');
  if(f.far_view)text('Gate overlook · The streaks turn across the water as the barge passes.');
  if(f.chart)text('Survey board · A pencil ring marks the inlay on Kaelan’s sketch.');
  if(f.near_view||f.far_view)button('Unfold the survey board',()=>inspect('chart'));
}
function board(){
  act('chart','inspect');
  const f=flags(),both=f.near_view&&f.far_view;
  const {c,draw}=canvas('Survey board. A graphite tracing from the steps stays fixed. The teal overlook tracing can slide and turn.',ctx=>drawBoard(ctx,f,sheet));
  text(both?'The graphite line is from the steps. The loose tracing is from the overlook.':
    f.far_view?'The overlook tracing rests over the temple page.':f.near_view?'The tracing from the steps fits on the temple page.':'A ring on the temple sketch marks where the light landed. The tracing sheets are blank.');
  const bar=document.createElement('div');bar.className='quay-tools';content.append(bar);
  const hint=document.createElement('p');hint.className='hint';hint.setAttribute('role','status');content.append(hint);
  if(f.far_view){
    const label=document.createElement('label');label.textContent='Turn tracing';
    const turn=document.createElement('input');turn.type='range';turn.min=-60;turn.max=60;turn.value=sheet.angle;label.append(turn);bar.append(label);
    function adjust(change){
      if(arc.phase!=='room')return;
      sheet=sheetPose({...sheet,...change});draw();save();
      if(both&&registered(sheet))solve();
    }
    turn.oninput=()=>adjust({angle:Number(turn.value)});
    let drag;
    c.onpointerdown=e=>{
      if(drag||arc.phase!=='room')return;
      const [x,y]=coords(c,e);drag={id:e.pointerId,dx:sheet.x-x,dy:sheet.y-y};c.setPointerCapture(e.pointerId);
    };
    c.onpointermove=e=>{if(drag?.id===e.pointerId){const [x,y]=coords(c,e);adjust({x:x+drag.dx,y:y+drag.dy});}};
    c.onpointerup=c.onpointercancel=c.onlostpointercapture=()=>{drag=null;};
    const details=document.createElement('details'),summary=document.createElement('summary'),nudges=document.createElement('div');
    summary.textContent='Fine controls';nudges.className='nudges';details.append(summary,nudges);bar.append(details);
    for(const [name,dx,dy] of [['Left',-6,0],['Right',6,0],['Up',0,-6],['Down',0,6]])button(name,()=>adjust({x:sheet.x+dx,y:sheet.y+dy}),nudges);
    if(both&&registered(sheet)){solve();return;}
  }
  button('Hint',()=>{hint.textContent=both?'Slide the loose tracing until the joints meet at the inlay. Turn it until the nick and both tips agree.':
    'The lower steps and the gate overlook see the same cargo from different angles.';},bar);
}
function solve(){
  act('reflection','corresponds');arc=beginOutro(arc);
  if(arc.phase!=='outro')return;
  active=null;save();audio.cue('crystal-pulse');reveal();
}
function soundLabel(){$('sound').textContent=audio.enabled?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(audio.enabled));}
async function unlock(){if(soundWanted&&!audio.enabled){await audio.enable();soundLabel();}}
$('sound').onclick=async()=>{
  if(audio.enabled){soundWanted=false;audio.mute();window.speechSynthesis?.cancel();}
  else{soundWanted=true;await unlock();}
  soundLabel();save();
};
function enter(){
  if(entered)return;
  entered=true;unlock();$('arrival').hidden=true;
  if(arc.phase==='outro'||flags().ep3_relation){if(arc.phase!=='outro')arc=beginOutro(arc);reveal();return;}
  arc.phase='room';arc.clip=0;$('room').hidden=false;
  try{
    view=new ShopView($('world'),$('markers'),inspect,msg=>$('guide').textContent=msg,audio,quay);view.start(visit.pose);
  }catch{
    $('move-pad').hidden=$('look-pad').hidden=true;$('world').hidden=true;$('destinations').hidden=false;
    for(const [id,s] of Object.entries(quay.stations))button(s.label,()=>inspect(id),$('destinations'));
  }
  if(Object.hasOwn(quay.stations,visit.active)||visit.active==='journal')inspect(visit.active);
  save();
}
const ending=[
  {image:'barge-overlook',duration:4400,line:'The wake breaks apart. The two streaks meet once more, right on the mark Kaelan drew.'},
  {image:'disposal-barge',duration:5100,line:'The merchant house threw these stones away. From both landings, their light still finds the same place. Kaelan gathers his drawings before dawn.'}
];
function continueStory(){
  if(leaving)return;
  arc=advanceArc(arc);save();leaving=true;location.assign('../index.html#continue-journey');
}
function reveal(){
  if(panel.open)panel.close();view?.stop();$('room').hidden=true;$('sequence').hidden=false;audio.setRoomLevel(.28);
  const hold=$('pause');hold.onclick=()=>{paused=!paused;hold.textContent=paused?'Play':'Pause';if(paused){film.pause();window.speechSynthesis?.pause();}else{film.play();window.speechSynthesis?.resume();}};
  film=new CinematicClock({shots:ending,canAdvance:()=>!window.speechSynthesis?.speaking,onShot(i,shot){
    arc.clip=i;save();
    $('shot-art').style.backgroundImage='url("../../assets/generated/'+shot.image+'.webp")';$('line').textContent=shot.line;
    $('next').textContent=i===0?'Continue':replay?'Resume the journey':'To the workshop';
    if(journey.narration&&audio.enabled&&!document.hidden&&window.speechSynthesis){
      window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(shot.line));
    }
  },onComplete:continueStory});
  $('next').onclick=()=>film.next();film.show(Math.min(arc.clip,ending.length-1));
  if(document.hidden)film.pause();
}
$('enter').onclick=enter;$('journal').onclick=()=>inspect('journal');$('close').onclick=close;
panel.addEventListener('cancel',e=>{e.preventDefault();close();});
document.addEventListener('visibilitychange',()=>{
  audio.setHidden(document.hidden);
  if(document.hidden){view?.pause();film?.pause();window.speechSynthesis?.pause();save();}
  else if(!paused){film?.play();window.speechSynthesis?.resume();}
});
window.addEventListener('pagehide',()=>{save();film?.dispose();audio.mute();window.speechSynthesis?.cancel();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
