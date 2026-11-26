import {ShopView} from './view.mjs';
import {stations} from './walk.mjs';
import {fresh,restore,hasStone,expose,projection,sunsetAngle} from './investigation.mjs';
import {illustration,loadBenchArt,propAt,dragLamp} from './optics.mjs';
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
audio.setEmitter('water',7.85,3.4);
let soundWanted=journey.shopSound??true;
let voice=Boolean(journey.narration),view,film,pulseFrame,memoryFrame,pausedByPlayer=false;
function save(){
  const current=loadSave(storage);
  if(view)state.pose=view.pose();
  current.shopOpening=state;current.shopSound=soundWanted;current.sound=soundWanted;current.narration=voice;
  if(!current.arc&&!current.nextArc&&!current.finalArc)current.scene='room';
  $('storage-error').hidden=writeSave(storage,current);
}
function button(text,action,group=content){
  const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;group.append(b);return b;
}
function paragraph(text,group=content,cls=''){
  const p=document.createElement('p');p.textContent=text;p.className=cls;group.append(p);return p;
}
function begin(){
  loadBenchArt();
  for(const name of filmArt){const image=new Image();image.src='../../assets/generated/'+name+'.webp';}
  cancelAnimationFrame(memoryFrame);$('arrival').hidden=true;
  if(state.phase==='film'){playFilm(Math.max(2,state.shot));return;}
  if(state.phase==='dock'){dock();return;}
  $('room').hidden=false;$('guide').textContent='';
  try{view=new ShopView($('world'),$('markers'),inspect,text=>$('guide').textContent=text,audio);view.start(journey.shopOpening?.pose);}
  catch{$('destinations').hidden=false;$('move-pad').hidden=$('look-pad').hidden=true;$('guide').textContent='Use the destination buttons to investigate the shop.';view=null;}
  save();if(state.active)inspect(state.active);
}
function close(){
  dialog.close();state.active=null;save();$('guide').textContent='';
}
function inspect(id){
  if(state.phase!=='shop')return;
  view?.pause();state.active=id;save();$('heading').textContent=({drawer:'Grading drawer',bench:'Light bench',notebook:'Temple notebook',shelf:'Specimen shelf',journal:'Evidence journal'})[id];
  $('panel-label').textContent=id==='journal'?'Kaelan’s notes':'Outer ring · Crystal shop';
  content.className='';content.replaceChildren();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  if(id==='bench'){bench();return;}
  if(id==='notebook'){
    content.append(illustration(state,'sketch',1));
    paragraph('I traced the stand’s long shadow before the surge. The little circle marks where its light fell.');
    button(state.sketch?'Return to shop':'Bring the sketch',()=>{audio.cue('paper');state.sketch=true;close();});
  }else if(id==='drawer'){
    audio.cue('wood',7.03,4.52);
    paragraph('A folded return slip reads “Outer ring, lot VII. Rejected for feathering.” In the fold lies a sliver of quartz. A fine white plume runs through it.');
    button(hasStone(state)?'File the return slip':'Take the rejected sliver',()=>{
      state.drawerStone=true;audio.cue('paper');close();
    });
  }else if(id==='shelf'){
    paragraph('A milky wisp hangs inside the rejected stone. A second specimen from the same shipment is clear. The merchant house graded it premium.');
    button(state.tray?'Return to shop':state.drawerStone?'Bring the comparison samples':'Bring the specimens',()=>{state.tray=true;audio.cue('stone-seat');close();});
  }else{
    if(state.sketch)content.append(illustration(state,'sketch',1));
    if(state.clearSeen)paragraph('Approved specimen · The light spreads into a broad patch.');
    if(state.drawerStone)paragraph('Lot VII · The return slip identifies feathering as the reason for rejection.');
    if(state.tray)paragraph('Shipment samples · The rejected quartz has a white plume. The premium sample is clear.');
    if(!state.sketch&&!hasStone(state))paragraph('At the temple, the light settled on brass just before the crystal broke.');
    const narration=button('Read dialogue aloud',()=>{voice=!voice;if(!voice)stopVoice();narration.setAttribute('aria-pressed',String(voice));save();});
    narration.setAttribute('aria-pressed',String(voice));
  }
}
function bench(){
  const loaded=hasStone(state);
  const evidence=document.createElement('div'),tools=document.createElement('div');
  content.className='workbench';tools.className='bench-tools';content.append(evidence,tools);
  const picture=document.createElement('div'),surface=document.createElement('canvas');
  picture.append(surface);evidence.append(picture);
  const feedback=paragraph('',evidence,'feedback');feedback.setAttribute('role','status');
  const stones=document.createElement('div');stones.className='controls specimens';tools.append(stones);
  const samples=state.tray?['condemned','approved']:loaded?['condemned']:[];
  const buttons=samples.map(key=>button(key==='approved'?'Approved':'Condemned',()=>{
    state.specimen=key;audio.cue('stone-seat');refresh();
  },stones));
  const hints=['Look at the long shadow Kaelan drew on the page.','Drag the brass lamp until the real shadow covers the pencil hatching.','Hold the lamp there. Roll the condemned stone until both streaks land inside the circle.'];
  const hint=paragraph('',evidence,'hint');hint.setAttribute('role','status');
  button('Hint',()=>{if(!loaded)hint.textContent='The rest has a notch for a specimen.';
    else if(!state.sketch)hint.textContent='Kaelan drew the shadow he saw at the temple.';
    else{state.hints=Math.min(3,state.hints+1);hint.textContent=hints[state.hints-1];save();}},tools);
  const fine=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Fine controls';fine.append(summary);tools.append(fine);
  const adjustments=document.createElement('div');adjustments.className='adjustments';fine.append(adjustments);
  const inputs={};
  function adjust(key,value){
    const low=key==='lamp'?-45:-60;
    const next=Math.round(Math.max(low,Math.min(-low,value)));
    if(next===state[key])return;
    state[key]=next;inputs[key].value=next;
    if(!projection(state).aligned)audio.cue(key==='lamp'?'brass-slide':'stone-seat');
    refresh();
  }
  for(const [key,label,limit] of [['lamp','Slide lamp',45],['turn','Tilt stone',60]]){
    if(key==='turn'&&!loaded)continue;
    const row=document.createElement('div'),name=document.createElement('label'),input=document.createElement('input');
    row.className='adjust-row';input.type='range';input.min=-limit;input.max=limit;input.value=state[key];inputs[key]=input;
    name.textContent=label;name.append(input);
    const minus=button('−',()=>adjust(key,state[key]-4),row);minus.setAttribute('aria-label',label+' backward');
    row.append(name);const plus=button('+',()=>adjust(key,state[key]+4),row);plus.setAttribute('aria-label',label+' forward');
    input.oninput=()=>adjust(key,Number(input.value));adjustments.append(row);
  }
  let drag=null;
  surface.onpointerdown=e=>{
    if(drag||state.phase!=='shop')return;
    const r=surface.getBoundingClientRect();
    const key=propAt((e.clientX-r.left)/r.width*900,(e.clientY-r.top)/r.height*450,state);
    if(!key)return;
    drag={id:e.pointerId,key,x:e.clientX,y:e.clientY,start:state[key],width:r.width,height:r.height};
    surface.setPointerCapture(e.pointerId);e.preventDefault();
  };
  surface.onpointermove=e=>{
    if(drag?.id!==e.pointerId)return;
    const value=drag.key==='lamp'?dragLamp(drag.start,(e.clientY-drag.y)*450/drag.height):drag.start+(e.clientX-drag.x)*215/drag.width;
    adjust(drag.key,value);
  };
  surface.onpointerup=surface.onpointercancel=surface.onlostpointercapture=()=>{drag=null;};
  loadBenchArt().then(()=>{if(surface.isConnected&&state.phase==='shop')illustration(state,'bench',0,surface);});
  function refresh(){
    if(state.phase!=='shop')return;
    const solved=expose(state);save();
    if(solved){playFilm(0);return;}
    illustration(state,'bench',0,surface);
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Number(state.specimen==='approved'))));
    const optics=projection(state);
    feedback.textContent=!loaded?'The lamp casts a long shadow from the empty rest.':
      optics.diffuse?'The clear stone throws a broad patch of light.':
      !optics.visible?'A pale feather hangs inside the quartz.':
      !state.sketch?'Two fine streaks fall across the bare bench.':
      Math.abs(state.lamp-sunsetAngle)>5?'Two fine streaks cross the page.':
      'The stand’s shadow lies over the pencil marks.';
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
  if(!audio.enabled||!voice||!window.speechSynthesis||document.hidden)return;
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
      audio.cue('crystal-pulse');
      const surface=document.createElement('canvas');table.append(surface);
      let progress=0,last=performance.now();
      const pulse=now=>{
        if(!film||film.index!==0)return;
        if(!film.paused)progress+=Math.min(120,now-last);last=now;
        illustration(state,'bench',Math.min(1,progress/850),surface);
        if(progress<1100)pulseFrame=requestAnimationFrame(pulse);
      };pulse(last);
    }else if(i===1){
      audio.setRoomLevel(.12);speak(shot.line);
    }else if(i===2){
      audio.setRoomLevel(.12);audio.cue('knock',4.5,6.82);
    }else speak(shot.line);
  },onComplete:dock});
  film.show(index);if(document.hidden)film.pause();
}
function dock(){
  film?.dispose();film=null;cancelAnimationFrame(pulseFrame);stopVoice();
  audio.setScene('canal');audio.setRoomLevel(1);
  state.phase='dock';state.active=null;save();
  $('sequence').hidden=false;$('sequence').dataset.shot='dock';$('shot-art').style.backgroundImage=shotImage('disposal-barge');
  $('shot-table').hidden=true;$('speaker').textContent='Outer-ring dock · Nightfall';
  $('line').textContent='A disposal barge slips past. A pale streak travels across the water, then pulses again.';
  $('pause-film').hidden=true;$('dock-action').hidden=false;$('revisit').hidden=false;$('dock-action').focus({preventScroll:true});
}
$('revisit').onclick=()=>{
  state=fresh();view=null;save();location.reload();
};
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
window.addEventListener('pagehide',()=>{if(state.phase==='shop'&&view)save();film?.pause();stopVoice();audio.mute();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
const soundButton=$('voice');
function soundLabel(){
  soundButton.textContent=audio.enabled?'Sound on':'Sound off';
  soundButton.setAttribute('aria-pressed',String(audio.enabled));
}
async function unlockSound(){
  if(soundWanted&&!audio.enabled){await audio.enable();soundLabel();}
}
// Returning players can resume directly in the room. Unlock on their first
// interaction just as entering the shop unlocks sound for a new player.
for(const event of ['pointerup','keydown'])document.addEventListener(event,e=>{
  if(e.target!==soundButton && e.target!==$('enter'))unlockSound();
},true);
soundLabel();
soundButton.onclick=async()=>{
  soundButton.disabled=true;
  if(audio.enabled){soundWanted=false;audio.mute();stopVoice();}
  else{soundWanted=true;await unlockSound();}
  soundLabel();soundButton.disabled=false;save();
};
for(const [id,s] of Object.entries(stations))button(s.label,()=>view?view.go(s.approach,id):inspect(id),$('destinations'));
$('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
$('journal').onclick=()=>inspect('journal');
$('enter').disabled=false;$('enter').onclick=()=>{unlockSound();begin();};
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
