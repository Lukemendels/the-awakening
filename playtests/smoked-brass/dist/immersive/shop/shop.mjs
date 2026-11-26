import {ShopView} from './view.mjs';
import {freightStations as stations,loadingLayout} from './freight.mjs';
import {fresh,restore,hasStone,assignment,sketchNote,packets,manifest,ticket,marks,profile,sweep,holdCrate} from './investigation.mjs';
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
let voice=Boolean(journey.narration),view,film,pulseFrame,ticketArmed=false;
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
  $('arrival').hidden=true;
  if(state.phase==='film'&&!state.inRoomHold){playFilm(state.shot);return;}
  if(state.phase==='dock'){dock();return;}
  $('room').hidden=false;$('guide').textContent=assignment;
  try{view=new ShopView($('world'),$('markers'),inspect,text=>$('guide').textContent=text,audio,loadingLayout);view.start(journey.shopOpening?.pose);}
  catch{$('destinations').hidden=false;$('move-pad').hidden=$('look-pad').hidden=true;$('guide').textContent='Use the destination buttons to investigate the shop.';view=null;}
  if(state.inRoomHold){showHold();return;}
  if(!state.carrying&&!state.active&&!journey.shopOpening)state.active='bench';
  state.sketch=true;state.tray=true;
  save();updateTicket();if(state.carrying)$('guide').textContent='Compare your ticket with the stamp and cuts on the crates.';
  if(state.active)inspect(state.active);
}
function updateTicket(){
  const el=$('ticket-in-hand');el.hidden=!state.carrying||state.phase!=='shop';
  el.textContent='HOLD  ·  '+marks(ticket(state.packet));
  el.setAttribute('aria-label','Hold ticket for '+marks(ticket(state.packet)));
  el.setAttribute('aria-pressed',String(ticketArmed));
}
function claim(crate){
  const result=holdCrate(state,crate);ticketArmed=false;
  if(result==='held'){
    state.inRoomHold=true;state.carrying=false;audio.cue('wood');
    if(dialog.open)dialog.close();showHold();audio.cue('knock',7.79,3.51);speak($('guide').textContent);return;
  }
  const reasons={missing:'“The tracing ends early.” Father hands the ticket back. Try the full turn at the bench.',
    path:'Father puts your tracing over the sketch. The tracks split around the broken rivet. He hands the ticket back.',
    turn:'“Look here.” Father points to the round stud. The temple light travelled farther. The ticket is still yours.',
    ticket:'The tally edges don’t match. Look at the stamp and the cuts on the other crates.'};
  if(dialog.open)close();updateTicket();$('guide').textContent=reasons[result];audio.cue('paper');
}
function showHold(){
  view?.room.hold?.(state.held);$('room').classList.add('shipment-held');state.active=null;updateTicket();save();
  $('guide').textContent='“This crate stays.” Father tightens the cord. From the open window comes the knock of an oar.';
  if(!view)$('destinations').hidden=false;
}
function atCrate(id){
  const item=manifest.find(m=>'crate-'+m.crate===id);
  content.className='freight-paper';
  paragraph('Merchant house · Disposal lot VII',content,'kicker');
  paragraph('Crate '+item.crate+'  /  '+marks(item),content,'crate-imprint');
  if(!state.carrying){
    paragraph('The collector’s cord is still loose. Father has set the three matching sample tickets beside the lamp.');
    button('Go to the lamp',()=>{close();if(view)view.go(stations.bench.approach,'bench');else inspect('bench');});return;
  }
  paragraph('In your hand · Packet '+state.packet+'  /  '+marks(ticket(state.packet)));
  button('Tie my hold ticket here',()=>claim(item.crate));
  button('Return to the bench',()=>{close();if(view)view.go(stations.bench.approach,'bench');else inspect('bench');});
}
function close(message=''){
  dialog.close();state.active=null;save();$('guide').textContent=typeof message==='string'?message:'';
}
function inspect(id){
  if(state.inRoomHold){
    if(id==='window'||id==='bench'){view?.stop();state.inRoomHold=false;dock();}
    else showHold();return;
  }
  if(state.phase!=='shop')return;
  if(ticketArmed&&id.startsWith('crate-')){claim(id.slice(6));return;}
  view?.pause();state.active=id;save();$('heading').textContent=({drawer:'Grading drawer',bench:'Light bench',notebook:'Temple notebook',shelf:'Specimen shelf',journal:'Evidence journal'})[id];
  $('panel-label').textContent=id==='journal'?'Kaelan’s notes':'Outer ring · Crystal shop';
  content.className='';content.replaceChildren();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  if(id.startsWith('crate-')){$('heading').textContent=stations[id].label;atCrate(id);return;}
  if(id==='window'){
    $('heading').textContent='The collector’s barge';paragraph('There are men at the ropes. There is still time to hold one crate.');
    button('Return to the lamp',()=>{close();if(view)view.go(stations.bench.approach,'bench');else inspect('bench');});return;
  }
  if(id==='bench'){bench();return;}
  if(id==='notebook'){
    content.append(illustration(state,'sketch',1));
    paragraph('I kept my pencil on the light as the priest turned the stone. The broken rivet caught the page. I can still feel the nick.');
    button(state.sketch?'Return to shop':'Bring the sketch',()=>{audio.cue('paper');state.sketch=true;close(hasStone(state)?'I can compare the samples at the light bench.':'Father keeps the crate samples in the grading drawer.');});
  }else if(id==='drawer'||id==='shelf'){
    if(id==='drawer')audio.cue('wood',7.03,4.52);
    paragraph('Three paper packets from Lot VII. Each contains a cloudy sliver cut from a different crate. Father marked them A, B and C for testing. Each paper ticket bears the stamp and edge cuts from its crate.');
    button(hasStone(state)?'Return to the shop':'Take the three packets',()=>{
      if(id==='drawer')state.drawerStone=true;else state.tray=true;
      audio.cue('paper');close(state.sketch?'The sample rest is on the light bench.':'My two drawings of the temple light are in the notebook.');
    });
  }else{
    paragraph(assignment);
    if(state.sketch){content.append(illustration(state,'sketch',1));paragraph(sketchNote);}
    if(hasStone(state))paragraph('I have the three packets from Lot VII. Each ticket identifies the crate its sliver came from.');
    for(const packet of packets)if(state.tracings[packet])paragraph(tracingLine(packet));
    const narration=button('Read dialogue aloud',()=>{voice=!voice;if(!voice)stopVoice();narration.setAttribute('aria-pressed',String(voice));save();});
    narration.setAttribute('aria-pressed',String(voice));
  }
}
function tracingLine(id){
  if(state.tracings[id]!==3)return 'Packet '+id+' · Partial impression.';
  return 'Packet '+id+' · '+['An arc over the rivet, ending on the square.','A short smudge beside the round stud.','An arc below the rivet, ending on the square.'][profile(state,id)];
}
function bench(){
  content.className='touch-bench';$('heading').textContent='Father’s light bench';
  const stage=document.createElement('div');stage.className='apparatus';content.append(stage);
  const surface=illustration(state);stage.append(surface);
  const stone=document.createElement('div');stone.className='stone-grip';stone.tabIndex=0;
  stone.setAttribute('role','slider');stone.setAttribute('aria-label','Turn the mounted crystal');
  stone.setAttribute('aria-valuemin','0');stone.setAttribute('aria-valuemax','100');stage.append(stone);
  const clue=document.createElement('details');clue.className='temple-fold';
  const tab=document.createElement('summary');tab.textContent='Temple sketch';clue.append(tab,illustration(state,'sketch'));stage.append(clue);
  let overlay=false;
  const lay=button('Lay tracing over brass',()=>{overlay=true;clue.open=false;tab.textContent='Lift tracing';paint();},clue);
  tab.onclick=e=>{if(overlay){e.preventDefault();overlay=false;tab.textContent='Temple sketch';paint();}};
  let paperDrag=null;
  const sketch=clue.querySelector('canvas');
  sketch.onpointerdown=e=>{if(!paperDrag){paperDrag={id:e.pointerId,x:e.clientX,y:e.clientY};sketch.setPointerCapture(e.pointerId);}};
  sketch.onpointermove=e=>{if(paperDrag?.id===e.pointerId)sketch.style.transform='translate('+(e.clientX-paperDrag.x)+'px,'+(e.clientY-paperDrag.y)+'px)';};
  sketch.onpointerup=e=>{
    if(paperDrag?.id!==e.pointerId)return;
    const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    const moved=Math.hypot(e.clientX-paperDrag.x,e.clientY-paperDrag.y)>12;
    paperDrag=null;sketch.style.transform='';
    if(moved&&x>.55&&x<.96&&y>.16&&y<.76)lay.click();
  };
  sketch.onpointercancel=()=>{paperDrag=null;sketch.style.transform='';};
  const footer=document.createElement('div');footer.className='bench-edge';content.append(footer);
  const packetRow=document.createElement('div');packetRow.className='packet-row';footer.append(packetRow);
  const status=paragraph('',footer,'bench-status');status.setAttribute('role','status');
  const carry=button('Carry this ticket to the crates',()=>{
    state.carrying=true;close('Compare the ticket with the crates beside the shelf.');
    ticketArmed=false;updateTicket();
    if(view)view.go([4.54,view.canvas.clientWidth<view.canvas.clientHeight?6.70:4.52],'crate-08',{lookAt:[4.54,.80,1.53],message:'Going to the loading crates…',
      arrived:()=>{save();$('guide').textContent='Drag the hold ticket onto its crate, or tap the ticket and then the crate.';}});

  },footer);carry.className='carry-ticket';
  const tabs=[];
  function paint(){
    if(!surface.isConnected)return;
    illustration(state,'bench',0,surface,overlay);
    stone.setAttribute('aria-valuenow',String(Math.round(state.rotation*100)));
    stone.setAttribute('aria-valuetext',surface.getAttribute('aria-label'));
  }
  function show(){
    paint();
    tabs.forEach((el,i)=>el.setAttribute('aria-pressed',String(packets[i]===state.packet)));
    status.textContent=state.tracings[state.packet]===3?'The smoked brass kept the path of the light.':'Drag the quartz sideways in its brass rest. Watch the light on the plate.';
  }
  for(const id of packets){
    const el=button('Packet '+id,()=>{state.packet=id;sweep(state,0);audio.cue('stone-seat');show();save();},packetRow);
    const tag=document.createElement('small');tag.textContent=marks(ticket(id));el.append(tag);
    el.className='packet';tabs.push(el);
  }
  function turn(value){
    const previous=state.notch;sweep(state,value);paint();
    if(previous!==state.notch){audio.cue('stone-seat');show();}
  }
  let drag=null;
  stone.onpointerdown=e=>{
    if(drag||e.button!==0)return;
    drag={id:e.pointerId,x:e.clientX,start:state.rotation};stone.setPointerCapture(e.pointerId);stone.classList.add('turning');e.preventDefault();
  };
  stone.onpointermove=e=>{
    if(drag?.id!==e.pointerId)return;
    turn(drag.start+(e.clientX-drag.x)/Math.max(52,stage.clientWidth*.18));
  };
  const release=e=>{if(drag?.id!==e.pointerId)return;drag=null;stone.classList.remove('turning');save();};
  stone.onpointerup=stone.onpointercancel=stone.onlostpointercapture=release;
  stone.onkeydown=e=>{
    const steps={ArrowLeft:-.10,ArrowDown:-.10,ArrowRight:.10,ArrowUp:.10};
    if(e.key in steps)turn(state.rotation+steps[e.key]);
    else if(e.key==='Home'||e.key==='End')turn(Number(e.key==='End'));
    else return;
    e.preventDefault();save();
  };
  sweep(state,state.rotation);updateTicket();show();save();loadBenchArt().then(paint);
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
    sequence.dataset.shot=i;$('speaker').textContent=shot.speaker;$('line').textContent=i===0&&state.held?'Father ties your two tracings to crate '+state.held+' and strikes it from tonight’s loading list. The other two crates go to the quay. He hands you the sliver.':shot.line;
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
      const receipt=document.createElement('p');receipt.className='held-slip';receipt.textContent=state.held?'Lot VII · Crate '+state.held+' · HOLD':'Lot VII · Feathered quartz · Held from collection';table.append(receipt);
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
  $('line').textContent=state.held?'The inspector calls back, “Premium grade next time.” Father pulls the red cord tight on crate '+state.held+'. Beneath the departing barge, two threads of light bend in the dark.': 'The collector takes the remaining cargo down to the quay. Two pale threads gleam beneath the departing barge.';
  $('room').hidden=true;
  $('revisit').textContent=state.held?'Stay with Father':'Revisit the shop';
  $('dock-action').hidden=false;$('revisit').hidden=false;$('dock-action').focus({preventScroll:true});
}
$('revisit').onclick=()=>{
  if(state.held){state.phase='film';state.inRoomHold=true;state.active=null;}else state=fresh();
  view=null;save();location.reload();
};
$('dock-action').onclick=()=>{location.assign(journeyUrl('../canal/index.html#from-window'));};
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
const hand=$('ticket-in-hand');let dragTicket=null,ignoreTap=false;
hand.onclick=()=>{if(ignoreTap){ignoreTap=false;return;}ticketArmed=!ticketArmed;updateTicket();$('guide').textContent=ticketArmed?'Touch the crate that bears this tally.':'The ticket is in your hand.';};
hand.onpointerdown=e=>{
  if(e.button!==0||dragTicket)return;ignoreTap=false;
  dragTicket={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};hand.setPointerCapture(e.pointerId);
};
hand.onpointermove=e=>{
  if(dragTicket?.id!==e.pointerId)return;
  const dx=e.clientX-dragTicket.x,dy=e.clientY-dragTicket.y;
  if(Math.hypot(dx,dy)>8)dragTicket.moved=true;
  if(dragTicket.moved)hand.style.transform='translate('+dx+'px,'+dy+'px) rotate(-4deg)';
};
function releaseTicket(e){
  if(dragTicket?.id!==e.pointerId)return;
  const moved=dragTicket.moved;dragTicket=null;hand.style.transform='';ignoreTap=moved;
  if(!moved||e.type!=='pointerup'||!view)return;
  const r=view.canvas.getBoundingClientRect();
  view.ray.setFromCamera({x:2*(e.clientX-r.left)/r.width-1,y:1-2*(e.clientY-r.top)/r.height},view.room.camera);
  const id=view.room.crateAt(view.ray);
  if(id)claim(id);else $('guide').textContent='The cord slips free. Drop the ticket on a wooden crate.';
}
hand.onpointerup=hand.onpointercancel=hand.onlostpointercapture=releaseTicket;
for(const [id,s] of Object.entries(stations))button(s.label,()=>view?view.go(s.approach,id):inspect(id),$('destinations'));
$('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
$('journal').onclick=()=>inspect('journal');
$('enter').disabled=false;$('enter').onclick=()=>{unlockSound();begin();};
if(state.phase!=='shop'||journey.shopOpening?.phase==='shop')begin();
else $('memory').append(illustration(state,'sketch'));
