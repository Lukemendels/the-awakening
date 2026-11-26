import {ShopView} from '../shop/view.mjs';
import {quay} from './quay.mjs';
import {sights,sheetPose,registered,drawSight,drawBoard,drawMatch,loadPlates} from './tracings.mjs';
import {arcAction,freshArc,canResumeArc,restoreArc,beginOutro,advanceArc} from '../arc-progress.mjs';
import {loadSave,writeSave,journeyUrl} from '../save.mjs';
import {ImmersiveAudio} from '../audio.mjs';

const $=id=>document.getElementById(id),panel=$('panel'),content=$('content');
const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
const journey=loadSave(storage);
// A direct playtest also works for players who already reached later episodes.
// Their later checkpoint stays available when the replay finishes.
const replay=Boolean(journey.nextArc||journey.finalArc||(journey.arc&&(!canResumeArc(journey.arc)||journey.arc.episode!==3)));
let arc=!replay&&journey.arc?restoreArc(journey.arc):freshArc();
const visit=(!replay&&journey.canalVisit)||{};
let sheet=sheetPose(visit.sheet),active=null,view,entered=false,leaving=false;
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
  const caption=text('Which glint travels with the cargo? Touch it to make a tracing.');
  function recorded(){
    const other=id==='near_view'?'far_view':'near_view';
    if(flags()[other]){
      caption.textContent='Both angles are on paper. Lay the tracings together to see whether the fork kept its shape.';
      button('Compare the tracings',()=>inspect('chart'));
    }else{
      caption.textContent=id==='near_view'?'Lower steps traced. Would that nick look the same from the gate overlook?':
        'Overlook traced. Would that nick look the same from the steps below?';
    }
  }
  caption.setAttribute('role','status');
  if(flags()[id]){recorded();return;}
  const spots=[];
  function trace(wake){
    if(!wake){caption.textContent='Amber flickers in separate patches under the lamps. The marks break apart.';return;}
    act(id,'observe');audio.cue('paper');draw();
    recorded();
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
    const [x,y]=coords(c,e);
    if(Math.hypot(x-sight.x,y-sight.y)<96)trace(true);
    else if(Math.hypot(x-amber[0],y-amber[1])<72)trace(false);
    else caption.textContent='The ripples break apart here. Is there a shape in the light that holds together?';
  };
}
function notes(){
  const f=flags();
  text('Does the fork of light beneath the discarded quartz keep its shape from a different angle?');
  if(!f.near_view&&!f.far_view)text('I can trace the same cargo from the lower steps and the gate overlook.');
  if(f.near_view)text('Lower steps · Two streaks in the wake, one with a nick.');
  if(f.far_view)text('Gate overlook · The streaks turn across the water as the barge passes.');
  if(f.chart)text('Survey board · A pencil ring marks the inlay on Kaelan’s sketch.');
  if(f.near_view||f.far_view)button(f.near_view&&f.far_view?'Compare the tracings':'Unfold the survey board',()=>inspect('chart'));
}
function board(){
  act('chart','inspect');
  const f=flags(),both=f.near_view&&f.far_view;
  const {c,draw}=canvas('Survey board. A graphite tracing from the steps stays fixed. The teal overlook tracing can slide and turn.',ctx=>drawBoard(ctx,f,sheet));
  text(both?'Slide and turn the overlook tracing over the pencil marks from the steps. Can you make the fork and its nick coincide?':
    f.far_view?'I have the overlook tracing. A drawing from the lower steps would give me a second angle.':
    f.near_view?'I have the tracing from the steps. I can see the same cargo from the overlook.':
    'This circle marks the inlay I lit at the bench. I’ll trace the fork in the wake from two angles and compare them here.');
  const bar=document.createElement('div');bar.className='quay-tools';content.append(bar);
  const hint=document.createElement('p');hint.className='hint';hint.setAttribute('role','status');content.append(hint);
  if(f.far_view){
    const label=document.createElement('label');label.textContent='Turn tracing';
    const turn=document.createElement('input');turn.type='range';turn.min=-60;turn.max=60;turn.value=sheet.angle;label.append(turn);bar.append(label);
    let drag;
    function adjust(change){
      if(arc.phase!=='room')return;
      sheet=sheetPose({...sheet,...change});draw();save();
      if(!drag&&both&&registered(sheet))solve();
    }
    turn.oninput=()=>adjust({angle:Number(turn.value)});
    c.onpointerdown=e=>{
      if(drag||arc.phase!=='room')return;
      const [x,y]=coords(c,e);drag={id:e.pointerId,dx:sheet.x-x,dy:sheet.y-y};c.setPointerCapture(e.pointerId);
    };
    c.onpointermove=e=>{if(drag?.id===e.pointerId){const [x,y]=coords(c,e);adjust({x:x+drag.dx,y:y+drag.dy});}};
    c.onlostpointercapture=c.onpointerup=c.onpointercancel=e=>{
      if(drag?.id!==e.pointerId)return;
      drag=null;
      if(arc.phase==='room'&&both&&registered(sheet))solve();
    };
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
  {speaker:'Survey board · Finding recorded',title:'The tracings match',line:'“Even the tiny nick lines up. The water shifted between the two drawings, but the light beneath the cargo kept its shape. I saw that fork in the rejected crystal at my bench.”'},
  {speaker:'Before dawn · Kaelan’s workshop',title:'A test at the canal window',line:'“The merchant house is throwing away crystals that still respond to light. If I hold mine at the workshop window, will it pulse in time with the canal?”'}
];
function continueStory(){
  if(leaving)return;
  arc=advanceArc(arc);save();leaving=true;location.assign(journeyUrl('../index.html#continue-journey'));
}
function reveal(){
  if(panel.open)panel.close();view?.stop();$('room').hidden=true;$('sequence').hidden=false;audio.setRoomLevel(.28);
  // The solve starts the reveal immediately. Each beat belongs to the player,
  // including when they return to an older checkpoint midway through the outro.
  const matched=arc.clip===0,shot=ending[matched?0:1];
  $('sequence').dataset.beat=matched?'match':'workshop';
  $('match-art').hidden=!matched;$('shot-art').hidden=matched;
  if(matched){
    const ctx=$('matched-board').getContext('2d');ctx.setTransform(1.5,0,0,1.5,0,0);
    drawMatch(ctx);plates.then(()=>drawMatch(ctx));
  }else{
    $('shot-art').style.backgroundImage='url("../../assets/generated/disposal-barge.webp")';
  }
  $('speaker').textContent=shot.speaker;$('discovery').textContent=shot.title;$('line').textContent=shot.line;
  const savedEpisode=journey.finalArc?.episode??journey.nextArc?.episode??journey.arc?.episode;
  const onward=replay&&Number.isInteger(savedEpisode)&&savedEpisode>4?'Resume Episode '+savedEpisode:'Take the tracings to the workshop';
  $('next').textContent=matched?'Look back at the barge':onward;
  $('next').onclick=matched?()=>{arc.clip=1;save();reveal();}:continueStory;
  $('discovery').focus({preventScroll:true});
  if(journey.narration&&audio.enabled&&!document.hidden&&window.speechSynthesis){
    window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(shot.title+'. '+shot.line));
  }
}
// A touch browser can suppress its emulated click immediately after a canvas
// drag. Handle a tap on this handoff explicitly; keyboard activation uses click.
const nextButton=$('next');
let tapStart=null;
nextButton.addEventListener('touchstart',e=>{
  tapStart=e.touches.length===1?e.changedTouches[0]:null;
},{passive:true});
nextButton.addEventListener('touchcancel',()=>{tapStart=null;});
nextButton.addEventListener('touchend',e=>{
  const start=tapStart,end=e.changedTouches[0];tapStart=null;
  if(!start||start.identifier!==end.identifier||!e.cancelable)return;
  e.preventDefault();
  if(Math.hypot(end.clientX-start.clientX,end.clientY-start.clientY)<16&&
     document.elementFromPoint(end.clientX,end.clientY)===nextButton)nextButton.click();
},{passive:false});
$('enter').onclick=enter;$('enter').disabled=false;$('journal').onclick=()=>inspect('journal');$('close').onclick=close;
panel.addEventListener('cancel',e=>{e.preventDefault();close();});
document.addEventListener('visibilitychange',()=>{
  audio.setHidden(document.hidden);
  if(document.hidden){view?.pause();window.speechSynthesis?.pause();save();}
  else window.speechSynthesis?.resume();
});
window.addEventListener('pagehide',()=>{save();audio.mute();window.speechSynthesis?.cancel();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
