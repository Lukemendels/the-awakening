import {ShopView} from './view.mjs';
import {stations} from './walk.mjs';
import {fresh,restore,hasStone,assignment,sketchNote,packets,manifest,ticket,marks,reading,trace,holdCrate} from './investigation.mjs';
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
let voice=Boolean(journey.narration),view,film,pulseFrame;
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
  if(state.phase==='film'){playFilm(state.shot);return;}
  if(state.phase==='dock'){dock();return;}
  $('room').hidden=false;$('guide').textContent=assignment;
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
    paragraph('I drew the light twice, first with the temple stone at rest, then as the priest turned it one notch clockwise. Any number of stones might make the first drawing. Could one make both?');
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
function tracingLine(packet){
  const mask=state.tracings[packet]||0;
  const entry=notch=>mask&(1<<notch)?reading(state,packet,notch):'—';
  return 'Packet '+packet+' · I: '+entry(0)+' · II: '+entry(1);
}
function bench(){
  content.className='sample-bench';
  const evidence=document.createElement('div');evidence.className='assay-evidence';content.append(evidence);
  const surface=illustration(state);evidence.append(surface);
  const caption=paragraph('',evidence,'assay-caption');
  const controls=document.createElement('div');controls.className='sample-controls';content.append(controls);
  $('heading').textContent='Hold one crate';
  paragraph('Find the crate whose stone repeats both temple tracings.',controls,'assay-goal');
  if(!state.sketch||!hasStone(state)){
    paragraph(!hasStone(state)?'The rest is empty. Father left a packet from each crate in the grading drawer.':'The packets are here. Your temple notebook has the two drawings to test them against.',controls);
    const id=!hasStone(state)?'drawer':'notebook';
    button(id==='drawer'?'Go to the grading drawer':'Go to the notebook',()=>{
      close();if(view)view.go(stations[id].approach,id);else inspect(id);
    },controls);return;
  }
  paragraph('Temple sketch · I ○ Round  /  II □ Square',evidence,'sketch-key');
  const reference=document.createElement('details');controls.append(reference);
  const summary=document.createElement('summary');summary.textContent='My temple sketch';reference.append(summary,illustration(state,'sketch',1));
  paragraph(sketchNote,reference);
  const panel=document.createElement('div');controls.append(panel);
  const feedback=paragraph('',controls,'feedback');feedback.setAttribute('role','status');
  let book=state.book;
  function row(parent,legend){
    const field=document.createElement('fieldset'),title=document.createElement('legend'),items=document.createElement('div');
    title.textContent=legend;items.className='actions';field.append(title,items);parent.append(field);return items;
  }
  function render(focus){
    panel.replaceChildren();feedback.textContent='';
    illustration(state,'bench',0,surface);
    caption.textContent='Packet '+state.packet+' · '+marks(ticket(state.packet));
    const samples=row(panel,book?'Evidence packet for my claim':'Mount a packet in the rest');
    for(const id of packets){
      const el=button(id,()=>{state.packet=id;save();render('Packet '+id);},samples);
      el.setAttribute('aria-label','Packet '+id);el.setAttribute('aria-pressed',String(state.packet===id));
    }
    if(book){
      for(const id of packets){
        if(id===state.packet||state.tracings[id])paragraph(tracingLine(id),panel,'trace-line');
      }
      const items=row(panel,'Hold the crate with the matching ticket');
      for(const entry of [manifest[2],manifest[0],manifest[1]]){
        const b=button('Crate '+entry.crate+' · '+marks(entry),()=>{
          const result=holdCrate(state,entry.crate);
          if(result==='held'){audio.cue('paper');save();playFilm(0);return;}
          feedback.textContent={
            missing:'Father needs a tracing from both notches of this packet. The blank space on your slip is still unsigned.',
            first:'Father lays the first tracing over your notebook. The fork lands on different studs. The crate stays on the loading list.',
            turn:'The first tracing fits. After the turn, the fork on your slip stays put. In your temple drawing it moved.',
            ticket:'The light checks out. Father lays the packet ticket on this crate’s entry. The stamp and the edge cuts must both agree.'
          }[result];
          feedback.scrollIntoView({block:'nearest'});
        },items);b.className='manifest-entry';
      }
      button('Back to the light bench',()=>{book=false;state.book=book;save();render('Open shipping book');},panel);
    }else{
      const notches=row(panel,'Turn the stone under the fixed lamp');
      for(const [n,label] of ['I · At rest','II · One notch clockwise'].entries()){
        const el=button(label,()=>{state.notch=n;audio.cue('stone-seat');save();render(label);},notches);
        el.setAttribute('aria-pressed',String(state.notch===n));
      }
      paragraph(tracingLine(state.packet),panel,'trace-line');
      const actions=document.createElement('div');actions.className='actions';panel.append(actions);
      button('Trace this reading',()=>{
        trace(state);audio.cue('paper');save();render('Trace this reading');
        feedback.textContent='Traced the '+reading(state)+' stud on packet '+state.packet+'’s slip.';
      },actions);
      button('Open shipping book',()=>{book=true;state.book=book;save();render('Back to the light bench');},actions);
    }
    if(focus){
      const target=[...panel.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||b.textContent)===focus);
      target?.focus({preventScroll:true});
    }
  }
  render();loadBenchArt().then(()=>{if(surface.isConnected)illustration(state,'bench',0,surface);});
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
  $('line').textContent='The collector takes the remaining cargo down to the quay. As the barge pulls away, two pale threads gleam underneath it. How much working quartz has already left this shop?';
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
else $('memory').append(illustration(state,'sketch'));
