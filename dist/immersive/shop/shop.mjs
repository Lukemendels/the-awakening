import {ShopView} from './view.mjs';
import {stations} from './walk.mjs';
import {fresh,restore,hasStone,testSpecimen,keepSpecimen} from './investigation.mjs';
import {illustration,loadBenchArt} from './optics.mjs';
import {loadSave,writeSave,journeyUrl,playtestRun} from '../save.mjs';
import {CinematicClock} from '../cinematic.mjs';
import {ImmersiveAudio} from '../audio.mjs';

const $=id=>document.getElementById(id);
const dialog=$('panel'),content=$('content');
const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
const journey=loadSave(storage);
let state=restore(journey.shopOpening,journey.flags);
if(!playtestRun&&!journey.shopOpening && !journey.flags.solved){
  // The camera trial used independent saves. Carry any collected first-person props forward.
  try{
    const old=JSON.parse(storage.getItem('awakening-shop-trial-v1-first'))?.state;
    state.sketch ||= old?.sketch===true;state.tray ||= old?.tray===true;
  }catch{}
}
const audio=new ImmersiveAudio();
audio.setEmitter('water',7.85,3.4);
let soundWanted=journey.shopSound??true;
let voice=Boolean(journey.narration),view,film,pulseFrame,memoryFrame;
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
  if(state.phase==='film'){playFilm(state.shot);return;}
  if(state.phase==='dock'){dock();return;}
  $('room').hidden=false;$('guide').textContent='';
  try{view=new ShopView($('world'),$('markers'),inspect,text=>$('guide').textContent=text,audio);view.start(journey.shopOpening?.pose);}
  catch{$('destinations').hidden=false;$('move-pad').hidden=$('look-pad').hidden=true;$('guide').textContent='Use the destination buttons to investigate the shop.';view=null;}
  save();if(state.active)inspect(state.active);
}
function close(message=''){
  dialog.close();state.active=null;save();$('guide').textContent=typeof message==='string'?message:'';
}
function inspect(id){
  if(state.phase!=='shop')return;
  view?.pause();state.active=id;save();$('heading').textContent=({drawer:'Grading drawer',bench:'Light bench',notebook:'Temple notebook',shelf:'Specimen shelf',journal:'Evidence journal'})[id];
  $('panel-label').textContent=id==='journal'?'Kaelan’s notes':'Outer ring · Crystal shop';
  content.className='';content.replaceChildren();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  if(id==='bench'){bench();return;}
  if(id==='notebook'){
    content.append(illustration(state,'sketch',1));
    paragraph('I circled the brass tile where the two threads met. The lamp at our bench can sit at this same angle.');
    button(state.sketch?'Return to shop':'Bring the sketch',()=>{audio.cue('paper');state.sketch=true;close(hasStone(state)?'Both samples and the sketch. The light bench is by the window.':'Father left the shipment in the grading drawer.');});
  }else if(id==='drawer'){
    audio.cue('wood',7.03,4.52);
    paragraph('Lot VII. Two slivers sit inside the folded return slip. The clear one is marked “premium.” The one with a white feather inside is marked “discard.” Father has left both here for you to test.');
    button(hasStone(state)?'File the return slip':'Take the sample pair',()=>{
      state.drawerStone=true;audio.cue('paper');close(state.sketch?'I can test both samples at the window bench.':'My drawing of the temple light is in the notebook.');
    });
  }else if(id==='shelf'){
    paragraph('A milky wisp hangs inside the rejected stone. A second specimen from the same shipment is clear. The merchant house graded it premium.');
    button(state.tray?'Return to shop':state.drawerStone?'Bring the comparison samples':'Bring the specimens',()=>{state.tray=true;audio.cue('stone-seat');close(state.sketch?'I can test both samples at the window bench.':'My drawing of the temple light is in the notebook.');});
  }else{
    paragraph('Father can keep one sample before the barge collects the returns. Which stone can make the light you saw at the temple?');
    if(state.sketch)content.append(illustration(state,'sketch',1));
    if(state.clearSeen)paragraph('Clear sample · A broad patch of light covers the paper.');
    if(state.featherSeen)paragraph('Feathered sample · Two threads meet on the circled brass tile.');
    if(state.drawerStone)paragraph('Lot VII · The return slip identifies feathering as the reason for rejection.');
    if(state.tray)paragraph('Shipment samples · The rejected quartz has a white plume. The premium sample is clear.');
    if(!state.sketch&&!hasStone(state))paragraph('At the temple, the light settled on brass just before the crystal broke.');
    const narration=button('Read dialogue aloud',()=>{voice=!voice;if(!voice)stopVoice();narration.setAttribute('aria-pressed',String(voice));save();});
    narration.setAttribute('aria-pressed',String(voice));
  }
}
function bench(){
  content.className='sample-bench';
  const surface=illustration(state,'bench',state.tested==='condemned' ? .7 : 0);
  content.append(surface);
  const controls=document.createElement('div');controls.className='sample-controls';content.append(controls);
  const feedback=paragraph('',controls,'feedback');feedback.setAttribute('role','status');
  const actions=document.createElement('div');actions.className='actions';controls.append(actions);
  function draw(){
    if(surface.isConnected)illustration(state,'bench',state.tested==='condemned' ? .7 : 0,surface);
  }
  loadBenchArt().then(draw);
  if(!state.sketch||!hasStone(state)){
    feedback.textContent=!hasStone(state)?'The sample rest is empty. Father keeps this shipment in the grading drawer, with a second pair on the shelf.':'The samples fit the rest. Your temple notebook has the position of the sun and the drawing to compare them with.';
    const id=!hasStone(state)?'drawer':'notebook';
    button(id==='drawer'?'Go to the grading drawer':'Go to the notebook',()=>{
      close();if(view)view.go(stations[id].approach,id);else inspect(id);
    },actions);
    return;
  }
  const observation={
    approved:'The clear stone spreads light across the paper. There are no threads on the circled tile.',
    condemned:'Two bright threads meet on the circled tile. The feathered stone repeats what you saw at the temple.'
  };
  const refreshObservation=()=>{feedback.textContent=observation[state.tested]||'Your sketch sits under the rest. Try both stones with the lamp fixed at the angle you drew.';};
  refreshObservation();
  const decision=document.createElement('div');decision.className='sample-decision';
  const labels=[['approved','clear'],['condemned','feathered']];
  const samples=[];
  function refresh(){
    labels.forEach(([id],i)=>samples[i].setAttribute('aria-pressed',String(state.tested===id)));
    decision.hidden=!(state.clearSeen&&state.featherSeen);
  }
  for(const [id,name] of labels){
    samples.push(button('Test '+name+' stone',()=>{
      if(testSpecimen(state,id)){
        audio.cue(id==='condemned'?'crystal-pulse':'stone-seat');draw();refreshObservation();refresh();save();
      }
    },actions));
  }
  controls.append(decision);paragraph('Father holds the return sack open. Which sample do you keep as evidence?',decision);
  const choices=document.createElement('div');choices.className='actions';decision.append(choices);
  for(const [id,name] of labels)button('Keep '+name+' stone',()=>{
    if(keepSpecimen(state,id)){save();playFilm(0);}
    else{feedback.textContent='Father holds the clear stone over the sketch. “Show me the two threads.” There is only a wash of light. He leaves the sack open.';testSpecimen(state,id);draw();refresh();save();}
  },choices);
  refresh();
}

const filmArt=['crystalshop-opening-v1','condemned-tag','inspector-at-the-door','disposal-barge'];
function shotImage(name){return 'url("../../assets/generated/'+name+'.webp")';}
const shots=[
  {duration:3800,speaker:'Father · Lot VII',line:'Father folds the feathered sliver into your sketch and crosses it off the return slip.'},
  {duration:4100,speaker:'Kaelan',line:'“They marked this one for disposal. How many more like it have we sent away?”'},
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
  $('room').hidden=true;$('sequence').hidden=false;$('next-shot').hidden=false;
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
      const receipt=document.createElement('p');receipt.className='held-slip';receipt.textContent='Lot VII · Feathered quartz · Held from collection';table.append(receipt);
    }else if(i===1){
      audio.setRoomLevel(.12);speak(shot.line);
    }else if(i===2){
      audio.setRoomLevel(.12);audio.cue('knock',4.5,6.82);
    }else speak(shot.line);
  },onComplete:dock});
  film.setMode('read');film.show(index);if(document.hidden)film.pause();
}
function dock(){
  film?.dispose();film=null;$('next-shot').hidden=true;cancelAnimationFrame(pulseFrame);stopVoice();
  audio.setScene('canal');audio.setRoomLevel(1);
  state.phase='dock';state.active=null;save();
  $('sequence').hidden=false;$('sequence').dataset.shot='dock';$('shot-art').style.backgroundImage=shotImage('disposal-barge');
  $('shot-table').hidden=true;$('speaker').textContent='Outer-ring dock · Nightfall';
  $('line').textContent='You follow the collector to the quay with the sliver in your pocket. Two pale threads gleam beneath the departing cargo. Are more of those stones aboard?';
  $('dock-action').hidden=false;$('revisit').hidden=false;$('dock-action').focus({preventScroll:true});
}
$('revisit').onclick=()=>{
  state=fresh();view=null;save();location.reload();
};
$('dock-action').onclick=()=>{location.assign(journeyUrl('../canal/index.html'));};
$('next-shot').onclick=()=>{if(film)film.next();};
document.addEventListener('visibilitychange',()=>{
  audio.setHidden(document.hidden);
  if(!film)return;
  if(document.hidden){film.pause();window.speechSynthesis?.pause();}
  else{film.play();window.speechSynthesis?.resume();}
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
