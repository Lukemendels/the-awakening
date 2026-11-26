import {ShopView} from './view.mjs';
import {stations} from './walk.mjs';
import {restore,expose,projection,sunsetAngle} from './investigation.mjs';
import {illustration} from './optics.mjs';
import {loadSave,writeSave} from '../save.mjs';
import {CinematicClock} from '../cinematic.mjs';
import {ImmersiveAudio} from '../audio.mjs';

const $=id=>document.getElementById(id);
const dialog=$('panel'),content=$('content');
const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
const journey=loadSave(storage);
let state=restore(journey.shopOpening,journey.flags);
if(!journey.shopOpening && !journey.flags.solved){
  // The camera trial used independent saves. Carry any collected first-person props forward.
  try{
    const old=JSON.parse(storage.getItem('awakening-shop-trial-v1-first'))?.state;
    state.sketch ||= old?.sketch===true;state.tray ||= old?.tray===true;
  }catch{}
}
const audio=new ImmersiveAudio();
let voice=Boolean(journey.narration),view,film,pulseFrame,memoryFrame,pausedByPlayer=false;
function save(){
  const current=loadSave(storage);
  current.shopOpening=state;
  if(!current.arc&&!current.nextArc&&!current.finalArc)current.scene='room';
  $('storage-error').hidden=writeSave(storage,current);
}
function task(){
  if(!state.sketch)return 'Find Kaelan’s temple sketch in his notebook.';
  if(!state.tray)return 'Bring the shipment samples to the light bench.';
  return 'Can the dismissed stone put light on the spot Kaelan sketched?';
}
function button(text,action,group=content){
  const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;group.append(b);return b;
}
function paragraph(text,group=content,cls=''){
  const p=document.createElement('p');p.textContent=text;p.className=cls;group.append(p);return p;
}
function begin(){
  for(const name of filmArt){const image=new Image();image.src='../../assets/generated/'+name+'.webp';}
  cancelAnimationFrame(memoryFrame);$('arrival').hidden=true;
  if(state.phase==='film'){playFilm(Math.max(2,state.shot));return;}
  if(state.phase==='dock'){dock();return;}
  $('room').hidden=false;$('guide').textContent=task();
  try{view=new ShopView($('world'),$('markers'),inspect,text=>$('guide').textContent=text);view.start();}
  catch{$('guide').textContent='Use the destination buttons to investigate the shop.';view=null;}
  save();if(state.active)inspect(state.active);
}
function close(){
  dialog.close();state.active=null;save();$('guide').textContent=task();
}
function inspect(id){
  if(state.phase!=='shop')return;
  state.active=id;save();$('heading').textContent=({bench:'Light bench',notebook:'Temple notebook',shelf:'Specimen shelf',journal:'Evidence journal'})[id];
  $('panel-label').textContent=id==='journal'?'Kaelan’s notes':'Outer ring · Crystal shop';
  content.className='';content.replaceChildren();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  if(id==='bench'){bench();return;}
  if(id==='notebook'){
    content.append(illustration(state,'sketch',1));
    paragraph('The stand, the last ray of sunlight, the brass inlay. I marked where the light fell just before the surge.');
    button(state.sketch?'Return to shop':'Bring the sketch',()=>{state.sketch=true;close();});
  }else if(id==='shelf'){
    paragraph('A milky wisp hangs inside the rejected stone. A second specimen from the same shipment is clear. The merchant house graded it premium.');
    button(state.tray?'Return to shop':'Bring the specimens',()=>{state.tray=true;close();});
  }else{
    if(state.sketch)content.append(illustration(state,'sketch',1));
    if(state.clearSeen)paragraph('Approved specimen · The light spreads into a broad patch.');
    paragraph(task());
  }
}
function bench(){
  if(!state.tray){paragraph('A sliding lamp and an empty brass rest. Both specimens are still on the shelf.');return;}
  const evidence=document.createElement('div'),tools=document.createElement('div');
  content.className='workbench';content.append(evidence,tools);
  const picture=document.createElement('div'),surface=document.createElement('canvas');
  picture.append(surface);evidence.append(picture);
  const feedback=paragraph('',evidence,'feedback');feedback.setAttribute('role','status');
  const stones=document.createElement('div');stones.className='controls';tools.append(stones);
  const buttons=['condemned','approved'].map(key=>button(key==='approved'?'Approved':'Condemned',()=>{state.specimen=key;refresh();},stones));
  function slider(label,key,min,max){
    const wrap=document.createElement('div'),name=document.createElement('label'),input=document.createElement('input');
    wrap.className='control-group';name.textContent=label;input.type='range';input.min=min;input.max=max;input.value=state[key];
    name.append(input);wrap.append(name);tools.append(wrap);
    input.oninput=()=>{state[key]=Number(input.value);refresh();};return input;
  }
  slider('Slide lamp','lamp',-45,45);
  const tilt=slider('Tilt stone','turn',-60,60);
  let drag=null;
  picture.onpointerdown=e=>{if(drag)return;drag={id:e.pointerId,x:e.clientX,start:state.turn};picture.setPointerCapture(e.pointerId);};
  picture.onpointermove=e=>{
    if(e.pointerId!==drag?.id)return;
    state.turn=Math.max(-60,Math.min(60,Math.round(drag.start+(e.clientX-drag.x)*120/picture.clientWidth)));
    tilt.value=state.turn;refresh();
  };
  picture.onlostpointercapture=()=>{drag=null;};
  const hints=['Look at the direction of sunset in the sketch.','Slide the lamp until its ray follows the pencilled line toward the stand.','Use the condemned stone. When you see two streaks, tilt it until both land on the brass inlay.'];
  const hint=paragraph(state.hints?hints[state.hints-1]:'',evidence,'hint');hint.setAttribute('role','status');
  button('Hint',()=>{state.hints=Math.min(3,state.hints+1);hint.textContent=hints[state.hints-1];save();},tools);
  function refresh(){
    if(state.phase!=='shop')return;
    const solved=expose(state);save();
    if(solved){playFilm(0);return;}
    illustration(state,'bench',0,surface);
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Number(state.specimen==='approved'))));
    const optics=projection(state);
    feedback.textContent=!state.sketch?'Get the notebook to place the temple sketch beneath the stone.':
      optics.diffuse?'The clear stone throws a broad patch of light.':
      !optics.visible?'A cloudy feather catches the light. The paper stays dim.':
      Math.abs(state.lamp-sunsetAngle)>5?'Two streaks fall wide of the inlay. Follow the sunset line with the lamp.':
      'Two fine streaks cross the sketch. Tilt the stone and watch them travel.';
  }
  refresh();
}

const filmArt=['crystalshop-opening-v1','condemned-tag','inspector-at-the-door','disposal-barge'];
function shotImage(name){return 'url("../../assets/generated/'+name+'.webp")';}
const shots=[
  {duration:1600,speaker:'Light bench',line:'Two streaks meet. A single pulse lights the brass inlay.'},
  {duration:3300,speaker:'Kaelan',line:'Same place. Just like the temple.'},
  {duration:1600,speaker:'Shop door',line:'Three knocks. The door swings open.'},
  {duration:5100,speaker:'Merchant house inspector',line:'Final warning. Your next shipment must be premium grade or higher. No exceptions.'},
  {duration:4600,speaker:'Father',line:'We can’t afford premium grade. Not with these prices.'}
];
function stopVoice(){window.speechSynthesis?.cancel();}
function speak(text){
  if(!voice||!window.speechSynthesis||document.hidden)return;
  const u=new SpeechSynthesisUtterance(text);u.rate=.95;window.speechSynthesis.speak(u);
}
function playFilm(index){
  if(dialog.open)dialog.close();view?.stop();
  $('room').hidden=true;$('sequence').hidden=false;$('pause-film').hidden=false;
  const sequence=$('sequence'),art=$('shot-art'),table=$('shot-table');
  film=new CinematicClock({shots,canAdvance:()=>!voice||!window.speechSynthesis?.speaking,onShot(i,shot){
    state.shot=i;save();cancelAnimationFrame(pulseFrame);stopVoice();
    sequence.dataset.shot=i;$('speaker').textContent=shot.speaker;$('line').textContent=shot.line;
    art.style.backgroundImage=i===0?'linear-gradient(#111c1ab3,#111c1add),'+shotImage(filmArt[0]):shotImage(filmArt[i===1?1:2]);
    table.hidden=i!==0;table.replaceChildren();
    if(i===0){
      audio.cue('success');
      const surface=document.createElement('canvas');table.append(surface);
      let progress=0,last=performance.now();
      const pulse=now=>{
        if(!film||film.index!==0)return;
        if(!film.paused)progress+=Math.min(120,now-last);last=now;
        illustration(state,'bench',Math.min(1,progress/850),surface);
        if(progress<1100)pulseFrame=requestAnimationFrame(pulse);
      };pulse(last);
    }else if(i===1){
      speak(shot.line);
    }else if(i===2){
      audio.cue('knock');
    }else speak(shot.line);
  },onComplete:dock});
  film.show(index);if(document.hidden)film.pause();
}
function dock(){
  film?.dispose();film=null;cancelAnimationFrame(pulseFrame);stopVoice();
  state.phase='dock';state.active=null;save();
  $('sequence').hidden=false;$('sequence').dataset.shot='dock';$('shot-art').style.backgroundImage=shotImage('disposal-barge');
  $('shot-table').hidden=true;$('speaker').textContent='Outer-ring dock · Nightfall';
  $('line').textContent='A disposal barge slips past. A pale streak travels across the water, then pulses again.';
  $('pause-film').hidden=true;$('dock-action').hidden=false;$('dock-action').focus({preventScroll:true});
}
$('dock-action').onclick=()=>{location.assign('../index.html#barge-reflection');};
$('pause-film').onclick=()=>{
  if(!film)return;pausedByPlayer=!pausedByPlayer;
  if(pausedByPlayer){film.pause();window.speechSynthesis?.pause();}else{film.play();window.speechSynthesis?.resume();}
  $('pause-film').textContent=pausedByPlayer?'Play':'Pause';
};
document.addEventListener('visibilitychange',()=>{
  audio.setHidden(document.hidden);
  if(!film)return;
  if(document.hidden){film.pause();window.speechSynthesis?.pause();}
  else if(!pausedByPlayer){film.play();window.speechSynthesis?.resume();}
});
window.addEventListener('pagehide',()=>{film?.pause();stopVoice();audio.mute();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
const soundButton=$('voice');
function soundLabel(){
  soundButton.textContent=voice?'Sound & voice on':'Sound & voice off';
  soundButton.setAttribute('aria-pressed',String(voice));
}
soundLabel();
soundButton.onclick=async()=>{
  soundButton.disabled=true;
  if(voice){audio.mute();voice=false;stopVoice();}
  else{await audio.enable();voice=true;}
  soundLabel();soundButton.disabled=false;
};
for(const [id,s] of Object.entries(stations))button(s.label,()=>view?view.go(s.approach,id):inspect(id),$('destinations'));
$('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
$('journal').onclick=()=>inspect('journal');
$('enter').disabled=false;$('enter').onclick=()=>{if(voice)audio.enable();begin();};
if(state.phase!=='shop'||journey.shopOpening?.phase==='shop')begin();
else{
  const start=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const surface=document.createElement('canvas');$('memory').append(surface);
  const memory=now=>{
    const t=reduced?1:Math.min(1,(now-start)/2200);
    illustration(state,'sketch',t,surface);
    if(t<1)memoryFrame=requestAnimationFrame(memory);
  };memory(start);
}
