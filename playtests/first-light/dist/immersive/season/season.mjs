import {earlyScenes} from '../early-scenes.mjs';
import {showStoryFilm} from '../story-film.mjs';
import {loadSave,writeSave,freshSave,journeyUrl} from '../save.mjs';
import {ShopView} from '../shop/view.mjs';
import {ImmersiveAudio} from '../audio.mjs';
import {view67} from '../arc67.mjs';
import {sequence,stage} from './reveals.mjs';
import {chapter,resultText} from './chapters.mjs';
import {currentBlock,advance,afterCanal,story} from './journey.mjs';
import {buildLayout} from './world.mjs';
import {instrument,stationPhoto,node,button} from './evidence.mjs';

const $=id=>document.getElementById(id);
const preview=new URLSearchParams(location.search).get('preview')==='4';
const storage={getItem:k=>localStorage.getItem(preview?k+'-season-playtest':k),setItem:(k,v)=>localStorage.setItem(preview?k+'-season-playtest':k,v)};
let save=loadSave(storage);
if(preview&&!save.arc){save={...freshSave(),shopSound:true,arc:afterCanal()};}
let block=currentBlock(save),p=save[block.key];
const audio=new ImmersiveAudio();
let sc,ch,visit,view,layout,visual,speech,guideTimer,active;
function persist(){if(!writeSave(storage,save))$('storage-error').hidden=false;}
function progress(value){p=value;save[block.key]=p;}
function say(text){$('guide').textContent=text;clearTimeout(guideTimer);if(text)guideTimer=setTimeout(()=>$('guide').textContent='',3600);}
function stopVoice(){if(speech){speech.onend=speech.onerror=null;window.speechSynthesis?.cancel();speech=null;}audio.setNarrating(false);}
function speak(text){
  stopVoice();if(!audio.enabled||!save.narration||!('speechSynthesis' in window)||document.hidden)return;
  speech=new SpeechSynthesisUtterance(text);speech.rate=.93;audio.setNarrating(true);
  speech.onend=speech.onerror=()=>{speech=null;audio.setNarrating(false);};window.speechSynthesis.speak(speech);
}
function soundUI(){$('sound').textContent=audio.enabled?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(audio.enabled));}
async function enable(){if(await audio.enable()){soundUI();return true;}say('Sound is unavailable on this device.');return false;}
function rememberPose(){if(view?.pos&&visit)visit.pose=view.pose();}
function screen(id){for(const name of ['arrival','room','sequence'])$(name).hidden=name!==id;}
function closePanel(){visual?.cancelInteraction?.();visual=null;active=null;if($('panel').open)$('panel').close();}
function paper(title,label){$('panel').classList.remove('station');view?.pause();$('guide').textContent='';$('heading').textContent=title;$('byline').textContent=label;$('content').replaceChildren();if(!$('panel').open)$('panel').showModal();return $('content');}
function paragraphs(clips){return clips.map(c=>typeof c==='string'?c:(c.speaker?c.speaker+' · ':'')+c.text);}
function transcript(parent,title,clips){if(!clips?.length)return;const d=node('details');d.append(node('summary',title),...paragraphs(clips).map(t=>node('p',t)));parent.append(d);}
function findings(parent,through){
  for(let e=4;e<=through;e++){
    const c=chapter(e),text=save.seasonFindings?.[e];
    parent.append(node('h3',c.finding),node('p',typeof text==='string'?text:c.meaning));
  }
}
function journal(){
  active=null;const c=paper('Kaelan’s field notes',sc.place);
  const prompt=visit.passageOpen?'The carved forks met. The warehouse wall has opened onto a stair. Walk through the opening.':ch.question;
  c.append(node('p',prompt));
  if(visit.active){visit.active=null;persist();}
  const notes=[...(visit.notes||[]),...(story(p)?.journal||[])];
  const oldFlags=p.story35?.flags||{};if(p.episode===5){if(oldFlags.price)notes.push('Approved prices tripled in a year.');if(oldFlags.volume)notes.push('The condemned volume grew tenfold.');}
  if(p.episode===6||p.episode===7)notes.push(...view67(p.story67).evidence.map(e=>e.text));
  if(notes.length){const list=node('ul');for(const line of new Set(notes))list.append(node('li',line));c.append(list);}
  if(p.episode>4){const d=node('details');d.append(node('summary','Earlier findings'));findings(d,p.episode-1);c.append(d);}
  const opening=earlyScenes[arrivals[p.episode]];
  transcript(c,'At the start of this episode',opening?opening.map(shot=>shot.line):sc.intro);
  const options=node('div','','actions');const narr=button(save.narration?'Voice on':'Voice off',()=>{save.narration=!save.narration;persist();journal();if(save.narration)speak(prompt);else stopVoice();});
  if('speechSynthesis' in window)options.append(narr);
  options.append(button('Return to title',()=>{rememberPose();persist();location.href=journeyUrl('../index.html');}));c.append(options);
}
function updateProps(){
  const s=story(p);let visible={};
  if(p.episode===4)visible={wallSeen:s.flags.wall_revealed,wallLit:s.flags.canal_light};
  if(p.episode===6)visible={mounting:p.mount==='isolated',channel:p.mount==='coupled'};
  if(p.episode===9)visible={'specimen-setup':s.apparatus==='bench','marked-wall':s.apparatus==='wall','water-channel':s.apparatus==='channel'};
  if(p.episode===12)visible={array:s.placement==='none',center:s.placement==='center',east:s.placement==='east',west:s.placement==='west'};
  if(p.episode===14)visible={array:s.placement==='bench',grammar:s.placement==='channel'};
  if(p.episode===23)visible={'central-channel':s.distribution==='center','outer-channel':s.distribution==='outer'};
  view?.room.setState(visible);
}
function dispatch(action){
  if(p.phase!=='room'||!active)return;
  const id=active;const result=block.act(p,action);const next=result.arc??result.progress;
  if(!next||!block.valid(next))return;
  progress(next);
  if(p.episode===23&&action.type==='interact'){
    const model=story(p);
    if(id==='distribution'&&action.choice==='observe'&&model.distribution==='outer')visit.pulse=model.route;
    else if(result.changed)visit.pulse=null;
  }
  if(result.changed&&action.type==='interact'&&result.message&&!visit.notes.includes(result.message))visit.notes.push(result.message);
  if(p.episode===22&&id==='evidence-table'&&result.changed)visit.evidence=action.choice;
  if(result.changed)audio.cue(({record:'paper',water:'glass',optics:'bell',cargo:'wood'})[layout.stations[id].type]||'glass',layout.stations[id].point[0],layout.stations[id].point[2]);
  updateProps();
  if(result.changed&&action.type==='interact'){
    const event=p.episode===4&&id==='old_wall'&&action.choice==='expose'?'patrol':
      p.episode===5&&id==='keeper'&&action.choice==='speak'?'key':null;
    if(event){visit.active=null;closePanel();roomFilm(event);return;}
  }
  persist();
  const witness=[11,17,21].includes(p.episode);
  if(action.type==='interact'&&block.solved(p)&&(!witness||id==='continue'&&action.choice==='continue')){reveal();return;}
  openStation(id,result.message);
}
function openStation(id,feedback=''){
  const o=sc.objects.find(o=>o.id===id);if(!o)return;
  visual?.cancelInteraction?.();visual=null;active=id;rememberPose();visit.active=id;persist();
  const c=paper(o.label,sc.place);c.append(node('p',o.description));
  $('panel').classList.add('station');
  const photo=node('img','','study');photo.alt=o.label;photo.src=stationPhoto(p.episode,id,story(p),ch.plate);c.prepend(photo);
  if(feedback){const f=node('p',feedback,'feedback');f.setAttribute('role','status');c.append(f);}
  const actions=node('div','','actions'),mount=p.episode===6&&['mounting','channel'].includes(id),loc=id==='mounting'?'isolated':'coupled';
  if(!mount||p.mount===loc){
    visual=instrument(sc,id,story(p),dispatch,visit.pulse);if(visual){visual.classList.add('instrument');c.append(visual);}
    const adjustment=visual?.querySelector('input[type=range]');
    if(adjustment && (p.episode===14||p.episode===18)){
      if(Number.isFinite(visit.adjustment)){
        adjustment.value=String(visit.adjustment);
        adjustment.dispatchEvent(new Event('input'));
      }
      adjustment.addEventListener('input',()=>{visit.adjustment=Number(adjustment.value);persist();});
    }
    if(!visual||p.episode<=5){
      for(const choice of o.choices){
        if((id==='old_wall'&&choice.id==='expose')||(id==='lamp'&&choice.id==='oblique'))continue;
        const b=button(choice.label,()=>dispatch({type:'interact',id,choice:choice.id}));b.dataset.choice=choice.id;actions.append(b);
      }
    }
    if(mount)actions.append(button('Take the mounting',()=>{p.mount='carried';updateProps();persist();closePanel();say('Carrying Mira’s mounting.');}));
  }else if(p.mount==='carried')actions.append(button('Place the mounting here',()=>{p.mount=loc;updateProps();persist();openStation(id,'The same mounting is now here.');}));
  else c.append(node('p','The mounting is at the other station.'));
  c.append(actions);
  if(sc.hints?.length){const help=node('details');help.append(node('summary','Ask for a hint'),button('Consult notes',()=>dispatch({type:'hint'})));c.append(help);}
}
let beatTimers=[];
function stopBeat(){
  for(const timer of beatTimers)clearTimeout(timer);
  beatTimers=[];audio.stopCues();stopVoice();
}
function score(beat){
  if(!audio.enabled||document.hidden)return;
  if(beat.cue==='ring-source'){
    for(const [i,name] of ['ring-source','ring-inner','ring-outer'].entries()){
      beatTimers.push(setTimeout(()=>audio.cue(name),i*510));
    }
  }else if(beat.cue==='distant-answer'){
    beatTimers.push(setTimeout(()=>audio.cue(beat.cue),920));
  }else if(beat.cue)audio.cue(beat.cue);
  else audio.cinematic(p.episode,'outro',0);
}
function reveal(){
  if(p.phase!=='outro')progress(block.outro(p));
  if(p.phase!=='outro')return;
  visit.active=null;rememberPose();closePanel();view?.stop();screen('sequence');
  const meaning=resultText(p.episode,story(p),visit.evidence);
  save.seasonFindings={...save.seasonFindings,[p.episode]:meaning};
  const beats=sequence(p.episode,ch,meaning);
  const index=Number.isInteger(visit.beat)&&visit.beat>=0&&visit.beat<beats.length?visit.beat:0;
  const beat=beats[index],last=index===beats.length-1;
  visit.beat=index;persist();stopBeat();audio.setRoomLevel(.13);
  stage($('shot-art'),beat);
  $('speaker').textContent='Episode '+p.episode+' · '+(beat.speaker||'Finding');
  $('discovery').textContent=beat.title;$('line').textContent=beat.line;$('lead').textContent=beat.lead||'';
  const dialogue=$('dialogue');dialogue.replaceChildren();if(last)transcript(dialogue,'Read the scene',sc.outro);
  $('back-beat').hidden=index===0;
  $('back-beat').onclick=()=>{visit.beat=index-1;reveal();};
  $('next').textContent=beat.next;
  $('next').onclick=()=>{
    if(!last){visit.beat=index+1;reveal();return;}
    if(p.episode===12){openPassage();return;}
    nextEpisode();
  };
  $('film-scroll').scrollTop=0;$('discovery').focus({preventScroll:true});
  score(beat);speak([beat.title,beat.line,beat.lead].filter(Boolean).join(' '));
}
function openPassage(){
  stopBeat();audio.setRoomLevel(.23);disposeRoom();
  visit.passageOpen=true;
  // Turn back towards the seam, then give the player both sticks.
  const wall=layout?.furnishings.wall?.point||buildLayout(sc,ch,true).furnishings.wall.point;
  if(visit.pose)visit.pose={...visit.pose,yaw:Math.atan2(wall[2]-visit.pose.z,wall[0]-visit.pose.x),pitch:-.13};
  persist();enter(true);
}
function disposeRoom(){
  if(view){view.stop();view.input?.dispose();view.room.dispose();view=null;}
  const canvas=$('world');canvas.replaceWith(canvas.cloneNode(false));
  $('markers').replaceChildren();$('destinations').replaceChildren();$('destinations').hidden=true;
  $('room').classList.remove('simple');$('guide').textContent='';$('dialogue').replaceChildren();
}
function nextEpisode(){
  if(p.phase!=='outro')return;
  const crossed=p.episode===12&&visit?.passageOpen;
  stopBeat();advance(save);delete save.seasonVisit;persist();disposeRoom();
  block=currentBlock(save);p=save[block.key];visit=null;active=null;
  if(crossed)p.phase='room';
  init();
  if(crossed)say('Behind you, a strip of warehouse light falls across the threshold.');
}
const arrivals={4:'night',5:'archive',6:'mira',7:'kai'};
function roomFilm(id){
  view?.pause();
  showStoryFilm(id,visit.film?.index,(index,shot)=>{
    visit.film={id,index};persist();stopBeat();audio.setRoomLevel(.13);
    if(shot.cue)audio.cue(shot.cue);
    speak(shot.line);
  },()=>{
    delete visit.film;stopBeat();audio.setRoomLevel(.23);
    if(p.phase==='intro')enter();
    else persist();
  });
}
function enter(passageOpen=false){
  if(p.phase==='intro'){p.phase='room';p.clip=0;}
  screen('room');$('mode').textContent=sc.place;$('world').setAttribute('aria-label','First-person view of '+sc.place);
  layout=buildLayout(sc,ch,passageOpen);
  const arrive=passageOpen?nextEpisode:openStation;
  if(passageOpen){
    const [cx,,cz]=layout.stations.passage.point;
    layout.crossed=(x,z)=>x<=cx+.09&&Math.abs(z-cz)<.43;
  }
  try{view=new ShopView($('world'),$('markers'),arrive,say,audio,layout);view.start(visit.pose);updateProps();}
  catch(error){console.warn('First-person renderer unavailable',error);view?.stop();view=null;$('room').classList.add('simple');$('markers').replaceChildren();$('destinations').hidden=false;
    for(const [id,station] of Object.entries(layout.stations))$('destinations').append(button(station.label,()=>arrive(id)));}
  if(passageOpen){say('The passage is open.');persist();return;}
  for(const o of sc.objects){const type=layout.stations[o.id].type;if(['water','optics','cargo'].includes(type))audio.setEmitter(({water:'water',optics:'array',cargo:'wood'})[type],o.x,o.y);}
  persist();if(block.solved(p)&&![11,17,21].includes(p.episode)){reveal();return;}
  if((p.episode===4&&visit.film?.id==='patrol')||(p.episode===5&&visit.film?.id==='key'))roomFilm(visit.film.id);
  else if(visit.active)openStation(visit.active);
}
function end(){
  $('back-beat').hidden=true;
  screen('sequence');stage($('shot-art'),{art:new URL('../../assets/generated/season/far-answer.webp',import.meta.url).href});$('speaker').textContent='The Awakening · Season One';
  $('discovery').textContent='Season complete';$('line').textContent='From a rejected stone in Kaelan’s shop to a signal heard beyond Atlantis.';$('lead').textContent='';
  const book=button('Read Kaelan’s field notes',()=>{
    const c=paper('Kaelan’s field notes','Season One');c.append(node('h3','The rejected crystal'),node('p','In the shop and on the canal, Kaelan traced the same fork back to a mark at the temple.'));findings(c,24);
  });
  $('dialogue').replaceChildren(book);$('next').textContent='Return to title';$('next').onclick=()=>location.href=journeyUrl('../index.html');
}
function init(){
  if(!block.valid(p)||p.episode<4){screen('arrival');$('title').textContent='The Awakening';$('premise').textContent='Begin in Kaelan’s shop or resume your journey from the title screen.';$('enter').textContent='Open the title screen';$('enter').onclick=()=>location.href=journeyUrl('../index.html');return;}
  if(p.phase==='done'&&p.episode<24){advance(save);block=currentBlock(save);p=save[block.key];persist();}
  if(p.phase==='done'){end();return;}
  sc=block.scene(p);ch=chapter(p.episode);visit=save.seasonVisit?.episode===p.episode?save.seasonVisit:{episode:p.episode,active:null,notes:[]};if(!Array.isArray(visit.notes))visit.notes=[];
  save.seasonVisit=visit;document.title='The Awakening · '+sc.title;
  document.documentElement.style.setProperty('--land','url("../../assets/generated/season/'+ch.world+'.webp")');
  audio.setScene('ep'+p.episode);audio.setRoomLevel(.23);audio.setVolume(Number.isFinite(save.soundVolume)?save.soundVolume:.7);
  if(p.phase==='outro'){if(p.episode===12&&visit.passageOpen)enter(true);else reveal();return;}
  if(p.phase==='room'){enter();return;}
  if(arrivals[p.episode]){roomFilm(arrivals[p.episode]);return;}
  screen('arrival');$('chapter-number').textContent='Episode '+p.episode+' · '+sc.place;$('title').textContent=sc.title;
  $('premise').textContent=ch.opening;$('question').textContent=ch.question;
  $('enter').textContent='Explore '+sc.place;$('enter').onclick=()=>{enter();speak(ch.question);};
}
$('close').onclick=closePanel;
$('panel').onclose=()=>{if(!$('panel').open&&visit){visit.active=null;visual?.cancelInteraction?.();visual=null;active=null;persist();}};
$('journal').onclick=journal;
$('sound').onclick=async()=>{if(audio.enabled){stopVoice();audio.mute();save.shopSound=false;}else{save.shopSound=await enable();}persist();soundUI();};
const audioGesture=new AbortController();
function unlockFromGesture(e){
  if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
  audioGesture.abort();
  if(e.target!==$('sound')&&(save.shopSound??true)&&!audio.enabled)enable();
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlockFromGesture,{signal:audioGesture.signal});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
document.addEventListener('visibilitychange',()=>{audio.setHidden(document.hidden);if(document.hidden){stopBeat();rememberPose();if(visit)persist();}});
window.addEventListener('pagehide',()=>{stopBeat();rememberPose();if(visit)persist();audio.dispose();});
init();
