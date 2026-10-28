/** Episodes 11–13, Season 1 V4. Spatial rests and projection behavior are
 * interpretive staging; the arrests, warning scrolls and passage are canonical.
 * No countdown, fighting, or alternate prevention of the escalation. */
export const arc1113Scenes=[
 {episode:11,id:'escalation',roomId:'warehouse',title:'Escalation',place:'Warehouse water-vision',
  objective:'Witness the consequences and consider what the water reveals.',start:{x:4.4,y:6.3,angle:-Math.PI/2},source:'Season 1 V4 · episode 11',adaptationNote:'The three observation stations stage canonical consequences; none is a prerequisite for continuing.',
  intro:[{speaker:'Narrator',text:'The crystal trade has grown too successful to hide. Merchants are being arrested, and harbor patrols have increased their inspections.'},{speaker:'Narrator',text:'Unfamiliar energy spreads through Atlantis. The city’s dormant channels begin to glow.'}],
  outro:[{speaker:'Narrator',text:'Through the warehouse water, they see Lord Thalor descend into a hidden vault and consult warning scrolls.'}],
  objects:[
   {id:'channel',label:'Awakening channel',x:2,y:2.2,description:'Look into the water running through the warehouse.',choices:[{id:'observe',label:'Watch the channel'}]},
   {id:'news',label:'Harbor news',x:6.8,y:3,description:'Reports arrive from the people who helped the crystal trade.',choices:[{id:'read',label:'Read the report'}]},
   {id:'vision',label:'Water-vision',x:4.5,y:3.7,description:'The moving water carries an uncertain image.',choices:[{id:'observe',label:'Watch the image'}]},
   {id:'continue',label:'Warehouse work',x:2,y:5.4,description:'The consequences cannot be undone here. Continue the investigation.',choices:[{id:'continue',label:'Continue the story'}]}
  ],hints:['There is no puzzle to hold you here. Take time with the consequences, then continue.']},
 {episode:12,id:'warehouse-escape',roomId:'warehouse',title:'Discovery',place:'Warehouse',
  objective:'Use the array and the old markings to find where the passage converges.',start:{x:4.4,y:6.3,angle:-Math.PI/2},source:'Season 1 V4 · episode 12',adaptationNote:'Three physical rests and projected lines interpret the source’s converging geometry. The player cannot prevent the patrol or fail a timer.',
  intro:[{speaker:'Narrator',text:'Lord Thalor leads a patrol toward the warehouse. The old markings begin to form a map toward chambers beneath the temple district.'},{speaker:'Narrator',text:'As guards approach, the water channels pulse. The crystals hover, and the ancient geometry offers one chance at escape.'}],
  outro:[{speaker:'Narrator',text:'The markings converge and the old wall begins to shift. A hidden passage opens beneath the temple district.'}],
  objects:[
   {id:'wall',label:'Ancient markings',x:2,y:1.8,description:'Follow the carved lines across the wall and toward the water channels.',choices:[{id:'observe',label:'Study the markings'}]},
   {id:'array',label:'Crystal array',x:3.6,y:5.1,description:'The same array can be carried to a rest to project its light.',choices:[{id:'take',label:'Take the array'},{id:'inspect',label:'Observe the array'}]},
   {id:'west',label:'Western rest',x:1.8,y:3.6,description:'A rest overlooks the older wall.',choices:[{id:'place',label:'Place the array here'},{id:'take',label:'Take the array from this rest'}]},
   {id:'center',label:'Channel junction rest',x:4.5,y:2.8,description:'A rest sits where two carved channels meet.',choices:[{id:'place',label:'Place the array here'},{id:'take',label:'Take the array from this rest'}]},
   {id:'east',label:'Eastern rest',x:7,y:3.6,description:'A rest faces the other side of the old wall.',choices:[{id:'place',label:'Place the array here'},{id:'take',label:'Take the array from this rest'}]},
   {id:'junction',label:'Converging lines',x:6.5,y:1.8,description:'Compare the projected lines with the carved channels.',choices:[{id:'trace',label:'Trace the projected lines'},{id:'leave',label:'Look again later'}]}
  ],hints:['The carved lines and the water channels describe the same structure.','Move the same array between rests and compare where its light falls.','Try the rest at the channel junction; trace where its projection converges with the markings.']},
 {episode:13,id:'passage',roomId:'passage',title:'The Chamber',place:'Hidden doorway and passage',
  objective:'Follow the newly opened passage with the others.',start:{x:4.4,y:6.2,angle:-Math.PI/2},source:'Season 1 V4 · episode 13',adaptationNote:'The passage is the continuation of the same escape. Gathering and following are narrative actions, not another lock.',
  intro:[{speaker:'Mira',text:'There.'},{speaker:'Narrator',text:'The wall shifts as the array aligns with its geometry. Water follows channels hidden within the stone, and a doorway opens.'},{speaker:'Narrator',text:'Kai gathers his charts while Mira secures the array. Kaelan leads them down as the warehouse door begins to splinter.'}],
  outro:[{speaker:'Narrator',text:'The passage seals behind them. In the crystal light, the pristine markings are older than Atlantis itself.'}],
  objects:[
   {id:'doorway',label:'Open passage',x:4.5,y:2,description:'The newly revealed doorway descends beneath the temple district.',choices:[{id:'follow',label:'Follow the others into the passage'}]},
   {id:'stone',label:'Passage markings',x:2,y:3.5,description:'The same geometry appears here, untouched by time.',choices:[{id:'observe',label:'Look at the markings'}]},
   {id:'companions',label:'Charts and array',x:6.8,y:4,description:'Kai gathers the charts; Mira secures the array.',choices:[{id:'observe',label:'See that the evidence is secure'}]}
  ],hints:['The doorway is already open. Follow the others; no second mechanism is required.']}
];
const validFlags=['e11_done','channel','news','vision','wall','matched','opened','stone','companions','descended'];
const validPlacement=['none','carried','west','center','east'];
export function freshArc1113(){return {version:1,episode:11,flags:{},placement:'none',journal:[],hints:{}};}
export function restoreArc1113(raw){
 try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1||![11,12,13,14].includes(s.episode)||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||!validPlacement.includes(s.placement)||!Array.isArray(s.journal)||!s.hints||typeof s.hints!=='object'||Array.isArray(s.hints))return freshArc1113();
  if(Object.entries(s.flags).some(([k,v])=>!validFlags.includes(k)||v!==true)||s.journal.some(x=>typeof x!=='string')||s.journal.length>12||Object.entries(s.hints).some(([k,v])=>!['11','12','13'].includes(k)||!Number.isInteger(v)||v<1||v>3))return freshArc1113();
  const f={...s.flags};if(s.episode===11&&(f.e11_done||f.matched||f.opened||s.placement!=='none')||s.episode>=12&&!f.e11_done||f.opened&&!f.matched||f.matched&&!f.opened||s.episode>=13&&!f.opened||(f.stone||f.companions||f.descended)&&s.episode<13||s.episode===14&&!f.descended)return freshArc1113();
  return {version:1,episode:s.episode,flags:f,placement:s.placement,journal:[...s.journal],hints:{...s.hints}};
 }catch{return freshArc1113();}
}
/** Reject malformed or forward-version state before a caller rewrites a save. */
export function canResumeArc1113(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['version','episode','flags','placement','journal','hints'].includes(k)))return false;
 if(raw.version!==1||![11,12,13,14].includes(raw.episode)||!raw.flags||typeof raw.flags!=='object'||Array.isArray(raw.flags)||!validPlacement.includes(raw.placement)||!Array.isArray(raw.journal)||raw.journal.length>12||raw.journal.some(x=>typeof x!=='string')||!raw.hints||typeof raw.hints!=='object'||Array.isArray(raw.hints))return false;
 if(Object.entries(raw.flags).some(([k,v])=>!validFlags.includes(k)||v!==true)||Object.entries(raw.hints).some(([k,v])=>!['11','12','13'].includes(k)||!Number.isInteger(v)||v<1||v>3))return false;
 const normalized=restoreArc1113(raw),entries=o=>Object.entries(o).sort(([a],[b])=>a.localeCompare(b));
 return normalized.episode===raw.episode&&normalized.placement===raw.placement&&JSON.stringify(entries(normalized.flags))===JSON.stringify(entries(raw.flags))&&JSON.stringify(normalized.journal)===JSON.stringify(raw.journal)&&JSON.stringify(entries(normalized.hints))===JSON.stringify(entries(raw.hints));
}
const add=(s,key,entry)=>{if(s.flags[key])return false;s.flags[key]=true;if(entry&&!s.journal.includes(entry))s.journal.push(entry);return true;};
const complete=s=>s.episode===11?true:s.episode===12?!!s.flags.opened:s.episode===13?!!s.flags.descended:s.episode===14;
/** Returns {state,message,changed,complete}; invalid actions cannot skip progress. */
export function arc1113Act(previous,action){
 const s=restoreArc1113(previous),scene=arc1113Scenes.find(v=>v.episode===s.episode);let changed=false,message='';
 if(!action||typeof action!=='object'||!scene)return {state:s,message,changed,complete:complete(s)};
 if(action.type==='hint'){const n=Math.min((s.hints[s.episode]||0)+1,scene.hints.length);changed=n!==(s.hints[s.episode]||0);s.hints[s.episode]=n;return {state:s,message:scene.hints[n-1],changed,complete:complete(s)};}
 if(action.type==='advance'){if(!complete(s))return {state:s,message:'The passage has not yet been found.',changed:false,complete:false};if(s.episode===11)add(s,'e11_done');s.episode++;return {state:s,message:'',changed:true,complete:true};}
 if(action.type!=='interact'||!scene.objects.some(o=>o.id===action.id&&o.choices.some(c=>c.id===action.choice)))return {state:s,message:'',changed:false,complete:complete(s)};
 const {id,choice}=action,f=s.flags;
 if(s.episode===11){
  if(id==='channel'){changed=add(s,'channel','Dormant water channels begin to glow as new energy spreads.');message='The dormant channel glows with an unfamiliar pulse.';}
  if(id==='news'){changed=add(s,'news','Merchants are being arrested; harbor inspections have increased.');message='Merchants caught with condemned crystals are being arrested, and harbor patrols have increased inspections.';}
  if(id==='vision'){changed=add(s,'vision','Thalor consults warnings in a hidden vault.');message='Through the water, Thalor descends into a hidden vault and studies warning scrolls marked with familiar patterns.';}
  if(id==='continue')message='There is no way to undo these events here. The work in the warehouse continues.';
 }else if(s.episode===12){
  if(id==='wall'){changed=add(s,'wall','Ancient lines and water channels describe a converging geometry.');message='Several carved lines approach the same part of the wall; the water channels follow their paths.';}
  if(id==='array'&&choice==='inspect')message='The recovered array throws lines of light onto the marked wall; its location changes where those lines land.';
  if(id==='array'&&choice==='take'){if(s.placement==='none'){s.placement='carried';changed=true;message='Kaelan takes the array. Carry it to a rest.';}else if(s.placement==='carried')message='The array is already in hand.';else message='The array is on a rest. Take it from that rest to move it.';}
  if(['west','center','east'].includes(id)){
   if(choice==='take'){if(s.placement===id){s.placement='carried';changed=true;message='Kaelan lifts the same array from the rest.';}else message='The array is not on this rest.';}
   else if(s.placement!=='carried')message='Bring the array here before placing it.';else{s.placement=id;changed=true;message=id==='center'?'The projected lines meet the carved channels near the same point.':'The projected lines separate from the channels; compare another position.';}
  }
  if(id==='junction'&&choice==='leave')message='The markings remain available; there is no countdown.';
  if(id==='junction'&&choice==='trace'){
   if(s.placement==='none'||s.placement==='carried')message='A projection is needed before its relationship to the markings can be traced.';
   else if(s.placement!=='center')message='These lines do not converge with the carved channels. Try moving the same array; no progress is lost.';
   else{changed=add(s,'matched','The array projection and carved channels converge at a hidden passage.');changed=add(s,'opened')||changed;message='The projection and carved channels converge. The old wall shifts, opening the hidden doorway.';}
  }
 }else if(s.episode===13){
  if(id==='stone'){changed=add(s,'stone','Pristine passage markings repeat the warehouse geometry.');message='The same markings continue into the passage, clean and untouched by time.';}
  if(id==='companions'){changed=add(s,'companions');message='Kai gathers his charts while Mira secures the array. They are ready to descend.';}
  if(id==='doorway'){changed=add(s,'descended','The trio followed the hidden passage beneath the temple district.');message='Kaelan leads the others into the passage. It seals behind them.';}
 }
 return {state:s,message,changed,complete:complete(s)};
}
