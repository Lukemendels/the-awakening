import {ShopView} from './view.mjs';
import {stations} from './walk.mjs';
import {fresh,restore,observe,compare,angles} from './investigation.mjs';
import {illustration} from './optics.mjs';

const $=id=>document.getElementById(id);
const dialog=$('panel'),content=$('content');
const modes={first:'Guided first person',third:'Three-quarter view'};
let view,mode,state,active=null,restart=false;
const key=()=>'awakening-shop-trial-v1-'+mode;
const button=(text,fn,group=content)=>{
  const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;group.append(b);return b;
};
function paragraph(text,cls=''){
  const p=document.createElement('p');p.textContent=text;p.className=cls;content.append(p);return p;
}
function save(){
  try{localStorage.setItem(key(),JSON.stringify({state,active}));}
  catch{$('storage-error').hidden=false;}
}
function task(){
  if(state.solved)return 'Evidence recorded. The water gate is next.';
  if(!state.tray)return 'Find the two specimens and compare them with the temple sketch.';
  if(!state.sketch)return 'Find the temple sketch in Kaelan’s notebook.';
  return 'Test both specimens at the light bench.';
}
function setCameraURL(camera){
  const url=new URL(location.href);
  if(camera)url.searchParams.set('view',camera);else url.searchParams.delete('view');
  history.replaceState(null,'',url);
}
function start(camera){
  setCameraURL(camera);
  mode=camera;let stored;
  try{stored=JSON.parse(localStorage.getItem(key()));}catch{}
  state=restore(stored?.state);active=null;restart=false;
  $('arrival').hidden=true;$('room').hidden=false;$('mode').textContent=modes[mode];
  $('guide').textContent=task();
  try{view??=new ShopView($('world'),$('markers'),inspect,text=>$('guide').textContent=text);view.start(mode);}
  catch{view=null;$('guide').textContent='3D view unavailable. Use the destination buttons to investigate.';}
  if(['bench','notebook','shelf','journal','complete'].includes(stored?.active)) inspect(stored.active);
}
function leaveRoom(){
  setCameraURL(null);if(dialog.open)dialog.close();view?.stop();$('room').hidden=true;$('arrival').hidden=false;
  document.querySelector('[data-view="'+mode+'"]').focus();
}
function close(){
  dialog.close();active=null;save();$('guide').textContent=task();
}
function inspect(id){
  active=id;save();restart=false;
  const title={bench:'Light bench',notebook:'Temple notebook',shelf:'Specimen shelf',journal:'Evidence journal',complete:'The same geometry'};
  $('heading').textContent=title[id];$('panel-label').textContent=id==='journal'?'Kaelan’s notes':'Outer ring · Crystal shop';
  content.replaceChildren();content.classList.remove('workbench');
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  if(id==='bench'){bench();return;}
  if(id==='notebook'){
    content.append(illustration(state,'sketch'));
    paragraph('A broken ring, open at the upper right. Kaelan traced the mark before the guards cleared the temple floor.');
    button(state.sketch?'Return to the shop':'Bring the sketch',()=>{state.sketch=true;close();});return;
  }
  if(id==='shelf'){
    paragraph('Two tags hang from the same shipment. The merchant house stamped one crystal approved and the other condemned. Both fit the loupe on the light bench.');
    button(state.tray?'Return to the shop':'Bring both specimens to the bench',()=>{state.tray=true;close();});return;
  }
  if(id==='complete'){
    content.append(illustration({...state,specimen:'condemned',lamp:2,turn:0},'journal'));
    paragraph('The rejected stone holds the temple’s branching mark. The approved stone stays clear under the same light. From the canal comes the clink of another condemned shipment.');
    button('Try the other camera',()=>{save();dialog.close();view?.stop();start(mode==='first'?'third':'first');});
    button('Open journal',()=>inspect('journal'));return;
  }
  if(state.solved)content.append(illustration({...state,specimen:'condemned',lamp:2,turn:0},'journal'));
  for(const [seen,note] of [[state.sketch,'Temple floor · A broken ring encloses three branches.'],[state.clearSeen,'Approved crystal · Clear when lit from behind.'],[state.veinsSeen,'Condemned crystal · Backlighting reveals internal veins.']]){
    if(seen)paragraph(note);
  }
  paragraph(state.solved?'Open question · Why are the merchants discarding crystals that carry the temple mark?':task());
  if(state.solved)button('See discovery',()=>inspect('complete'));
  button('Replay this view',()=>{
    if(restart){state=fresh();active=null;save();dialog.close();view?.stop();start(mode);return;}
    restart=true;paragraph('Replay from the entrance and clear this camera’s notes? Your other camera and Season One saves stay available.');
    content.lastElementChild.before(document.createElement('hr'));
    content.querySelector('button:last-of-type').textContent='Confirm replay';
  });
}
function bench(){
  if(!state.tray){
    content.append(illustration(state,'bench'));paragraph('A lamp and loupe stand over two empty rests. Fetch the tray from the specimen shelf.');return;
  }
  content.classList.add('workbench');
  const evidence=document.createElement('div'),tools=document.createElement('div');
  tools.className='bench-tools';content.append(evidence,tools);
  let picture=illustration(state,'bench');content.append(picture);
  const feedback=paragraph('','feedback');feedback.setAttribute('role','status');evidence.append(picture,feedback);
  const groups=[];
  function row(label,items,apply,selected){
    const box=document.createElement('div');box.className='controls control-group';
    const name=document.createElement('span');name.textContent=label;box.append(name);tools.append(box);
    const buttons=items.map(([text,val])=>[button(text,()=>{apply(val);refresh();},box),val]);
    if(selected)groups.push(()=>buttons.forEach(([b,val])=>b.setAttribute('aria-pressed',String(selected()===val))));
  }
  function refresh(){
    observe(state);save();
    const next=illustration(state,'bench');picture.replaceWith(next);picture=next;
    feedback.textContent=state.lamp===0?'The polished surface catches the glare.':state.lamp===1?'A bright edge traces the cut faces.':state.specimen==='approved'?'Light passes through. The interior is clear.':'Three branching veins meet inside a broken ring.';
    if(state.lamp===2&&state.specimen==='condemned'&&state.sketch)feedback.textContent+=state.turn===0?' The gaps coincide.':' The gaps face different directions.';
    groups.forEach(update=>update());
  }
  let drag=null;
  evidence.addEventListener('pointerdown',event=>{
    if(event.target!==picture || drag)return;
    drag={id:event.pointerId,x:event.clientX};
    evidence.setPointerCapture(event.pointerId);
  });
  evidence.addEventListener('pointermove',event=>{
    if(drag?.id!==event.pointerId)return;
    const steps=Math.trunc((event.clientX-drag.x)/18);
    if(!steps)return;
    drag.x+=steps*18;
    state.turn=((state.turn+steps)%angles+angles)%angles;
    refresh();
  });
  evidence.addEventListener('lostpointercapture',()=>{drag=null;});
  row('Stone',[['Approved','approved'],['Condemned','condemned']],v=>state.specimen=v,()=>state.specimen);
  row('Lamp',[['Front',0],['Side',1],['Behind',2]],v=>state.lamp=v,()=>state.lamp);
  row('Turn',[['↶ Left',-1],['Right ↷',1]],v=>state.turn=(state.turn+v+angles)%angles);
  const actions=document.createElement('div');actions.className='actions';tools.append(actions);
  button('Compare evidence',()=>{
    const message=compare(state);save();
    if(state.solved && state.lamp===2 && state.specimen==='condemned' && state.turn===0){inspect('complete');return;}
    feedback.textContent=message;
  },actions).className='primary';
  const hints=['Look for a change inside the stone, beyond the bright surface.','Try both specimens without moving the lamp between them.','Light both stones from behind. Turn the condemned one until the two gaps line up with the notebook sketch.'];
  const hint=paragraph(state.hints?hints[state.hints-1]:'','hint');hint.setAttribute('role','status');evidence.append(hint);
  button('Hint',()=>{state.hints=Math.min(3,state.hints+1);hint.textContent=hints[state.hints-1];save();},actions);refresh();
}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>start(b.dataset.view);
for(const [id,s] of Object.entries(stations))button(s.label,()=>view?view.go(s.approach,id):inspect(id),$('destinations'));
$('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
$('switch').onclick=leaveRoom;$('journal').onclick=()=>inspect('journal');

const initialView=new URL(location.href).searchParams.get('view');
if(Object.hasOwn(modes,initialView))start(initialView);
