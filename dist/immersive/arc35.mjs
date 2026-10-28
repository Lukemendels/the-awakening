/**
 * Episodes 3–5 — authored investigation, independent of rendering and storage.
 * Source: Season 1 V4 `episodes.mjs`, episodes 3–5.
 * Staging (two observation points, shutter and movable lamp) is interpretive,
 * not a claim about canonical machinery. All actions are reversible/untimed.
 */
export const arc35Scenes=[
 {episode:3,id:'canal',title:'Night’s Secrets',place:'Outer-ring water gate',
  premise:'At night, Kaelan watches barges carrying condemned crystals. Their reflections and harmonics invite comparison with the temple and his archive sketch.',
  objective:'Compare the passing reflections with Kaelan’s temple sketch.',start:{x:4,y:6.5,angle:-Math.PI/2},nextEpisode:4,completionFlag:'ep3_relation',intro:['Nightfall brings its own illumination to Atlantis.','Kaelan watches condemned crystals pass along the outer-ring water gate.'],outro:['The reflections and the temple share a geometry even as the viewpoint changes.','Kaelan carries the question into his workshop.'],source:'Season 1 V4, Episode 3',adaptationNote:'Two walkable viewing positions and a comparison surface stage the same observation; no new canon is implied.',
  objects:[
   {id:'near_view',label:'Canal steps',x:2,y:2,description:'Watch a barge pass from the lower steps.',choices:[{id:'observe',label:'Watch the reflection'}]},
   {id:'far_view',label:'Gate overlook',x:6,y:2,description:'View the same route from the gate overlook.',choices:[{id:'observe',label:'Watch from here'}]},
   {id:'chart',label:'Temple and star sketch',x:3.5,y:5,description:'Compare the archived drawing Kaelan carries.',choices:[{id:'inspect',label:'Study the sketch'}]},
   {id:'reflection',label:'Water reflection',x:5.5,y:5,description:'What remains related as the passing view changes?',choices:[{id:'corresponds',label:'The same geometry appears from both positions'}, {id:'moves_with_me',label:'The pattern only follows my viewpoint'}, {id:'unrelated',label:'The reflections have no relation to the temple'}]}
  ],hints:['Watch the barge from more than one position.','Compare the relationship, not the apparent position, with the sketch.','A changing viewpoint shifts the reflection, but its geometry still corresponds to the temple.']},
 {episode:4,id:'workshop',title:'Hidden Patterns',place:'Kaelan’s workshop',
  premise:'Before dawn, Kaelan gathers his drawings. A crystal begins to pulse with the nearby canal; a reflection catches the old wall as guards approach.',
  objective:'Follow the reflected light, then protect the research.',start:{x:4,y:6.5,angle:-Math.PI/2},nextEpisode:5,completionFlag:'concealed',intro:['Before dawn, Kaelan arranges his drawings and crystal evidence.','A knock warns him that guards are inspecting outer-ring properties.'],outro:['The old wall markings match the crystal and temple geometry.','Kaelan conceals his work as the guards approach.'],source:'Season 1 V4, Episode 4',adaptationNote:'A movable cover stages reflected-light discovery. Guards remain an untimed canonical pressure, not a failure clock.',
  objects:[
   {id:'canal_light',label:'Canal-facing window',x:6.4,y:2,description:'The water and the experimental crystal move together.',choices:[{id:'observe',label:'Watch the reflection'}]},
   {id:'old_wall',label:'Painted workshop wall',x:2,y:2,description:'Light falls across layers of paint and plaster.',choices:[{id:'inspect',label:'Inspect the surface'},{id:'expose',label:'Move the covering aside and follow the light'},{id:'ignore',label:'Turn away'}]},
   {id:'research',label:'Drawings and cover cloth',x:3.5,y:5,description:'The approaching guards make the evidence vulnerable.',choices:[{id:'conceal',label:'Cover the crystal and hide the drawings'},{id:'leave',label:'Leave the research exposed'}]}
  ],hints:['Notice where the canal’s changing light falls.','A covered surface is obscuring what the light might reveal.','Move the covering from the old wall, then protect the research.']},
 {episode:5,id:'archive',title:'Hidden Records',place:'Western archive',
  premise:'Guild records and a quiet warning from an archive keeper bring Kaelan to the western stacks. A lamp may reveal more than the visible ink.',
  objective:'Compare the records and investigate the western stacks.',start:{x:7.4,y:6.4,angle:-Math.PI/2},nextEpisode:6,completionFlags:['compared','crystal_ink'],intro:['Kaelan studies borrowed guild ledgers under a common crystal lamp.','The archive keeper appears with a warning.'],outro:['The records challenge the claim of scarcity and expose changes to crystal grading.','Merchant routes follow the ancient water channels.'],source:'Season 1 V4, Episode 5',adaptationNote:'A document comparison surface and a movable lamp stage Kaelan’s interpretation; the keeper’s key and oblique crystal ink are source events.',
  objects:[
   {id:'price',label:'Approved crystal prices',x:2,y:2,description:'Read the price record.',choices:[{id:'read',label:'Read the price record'}]},
   {id:'volume',label:'Condemned crystal volumes',x:6,y:2,description:'Read the condemnation record.',choices:[{id:'read',label:'Read the volume record'}]},
   {id:'comparison',label:'Compare the records',x:4,y:4,description:'Consider what both records support together.',choices:[{id:'manufactured',label:'Price rises while rejected volume rises: scarcity may be manufactured'}, {id:'scarcity',label:'Both records prove there are fewer crystals overall'}, {id:'no_relation',label:'The records cannot bear on the claim of scarcity'}]},
   {id:'keeper',label:'Archive keeper',x:2,y:5.5,description:'The keeper gives a discreet warning and a key.',choices:[{id:'speak',label:'Speak with the keeper'}]},
   {id:'western_stacks',label:'Western stacks · shelf 47',x:6,y:5.5,description:'A locked western stack holds hidden records.',choices:[{id:'open',label:'Use the keeper’s key'}]},
   {id:'lamp',label:'Archive lamp and ledger',x:4,y:6,description:'Try another way of illuminating the hidden ledger.',choices:[{id:'oblique',label:'Move the lamp to graze the page'}, {id:'direct',label:'Hold the lamp directly over the page'}, {id:'dark',label:'Move the lamp away'}]}
  ],hints:['Read both price and rejected-volume records before drawing a conclusion.','The keeper’s key opens the western stacks; surface ink is not the whole page.','Let light graze the hidden ledger at an oblique angle.']}
];
export function freshArc35(){return {version:1,episode:3,flags:{},journal:[],hints:{}};}
const validFlags=['near_view','far_view','chart','ep3_relation','canal_light','wall_seen','wall_revealed','concealed','price','volume','compared','key','stacks','crystal_ink'];
export function restoreArc35(raw){
 try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1||![3,4,5,6].includes(s.episode)||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags))return freshArc35();
  const flags={};for(const k of validFlags)if(s.flags[k]===true)flags[k]=true;
  // Reject impossible progress instead of letting a damaged save skip story beats.
  if(flags.ep3_relation&&!(flags.near_view&&flags.far_view&&flags.chart))return freshArc35();
  if(flags.wall_revealed&&!flags.canal_light||flags.concealed&&!flags.wall_revealed)return freshArc35();
  if(flags.compared&&!(flags.price&&flags.volume)||flags.stacks&&!flags.key||flags.crystal_ink&&!flags.stacks)return freshArc35();
  if(s.episode>=4&&!flags.ep3_relation||s.episode>=5&&!flags.concealed||s.episode===6&&!(flags.compared&&flags.crystal_ink))return freshArc35();
  const journal=Array.isArray(s.journal)?s.journal.filter(x=>typeof x==='string').slice(0,8):[];
  const hints={};for(const e of [3,4,5]){const n=s.hints?.[e];if(Number.isInteger(n)&&n>0)hints[e]=Math.min(3,n);}
  return {version:1,episode:s.episode,flags,journal,hints};
 }catch{return freshArc35();}
}
function add(s,flag,entry){if(s.flags[flag])return false;s.flags[flag]=true;if(entry&&!s.journal.includes(entry))s.journal.push(entry);return true;}
export function arc35Act(previous,action){
 const s=restoreArc35(previous),sc=arc35Scenes.find(x=>x.episode===s.episode),f=s.flags;let message='',changed=false;
 const finish=()=>s.episode===3?!!f.ep3_relation:s.episode===4?!!f.concealed:s.episode===5?!!(f.compared&&f.crystal_ink):s.episode===6;
 if(!action||typeof action!=='object'||!sc)return {state:s,message:'',changed:false,complete:finish()};
 if(action.type==='hint'){const n=Math.min((s.hints[s.episode]||0)+1,3);changed=n!==(s.hints[s.episode]||0);s.hints[s.episode]=n;return {state:s,message:sc.hints[n-1],changed,complete:finish()};}
 if(action.type==='advance'){if(finish()){s.episode++;return {state:s,message:'',changed:true,complete:true};}return {state:s,message:'There is more to understand here before moving on.',changed:false,complete:false};}
 if(action.type!=='interact'||!sc.objects.some(o=>o.id===action.id&&o.choices.some(c=>c.id===action.choice)))return {state:s,message:'',changed:false,complete:finish()};
 const {id,choice}=action;
 if(s.episode===3){
  if(id==='near_view'||id==='far_view'){changed=add(s,id);message=id==='near_view'?'From the steps the barge’s glow ripples across the water in a branching geometry.':'From the overlook the reflection shifts with the viewpoint, but its branching relationship persists.';}
  if(id==='chart'){changed=add(s,'chart');message='The archive sketch records the same branching relation in the temple’s arrangement.';}
  if(id==='reflection'){if(!(f.near_view&&f.far_view&&f.chart))message='The moving reflection is hard to judge from one place. Gather another view and compare the sketch.';else if(choice==='corresponds'){changed=add(s,'ep3_relation','The barge reflections preserve the temple geometry despite a change of viewpoint.');message='The geometry corresponds across both views. Condemned cargo, water and temple appear connected.';}else message='That interpretation does not account for the relation remaining visible after the view changes. Look again; no evidence is lost.';}
 }
 if(s.episode===4){
  if(id==='canal_light'){changed=add(s,'canal_light');message='The crystal pulses with canal movement, sending shifting light across the workshop wall.';}
  if(id==='old_wall'){if(choice==='inspect'){changed=add(s,'wall_seen');message='Paint and an old covering interrupt the reflected light. Something lies beneath.';}else if(choice==='ignore')message='The light fades behind the covering; the wall remains available to examine.';else if(!f.canal_light)message='The wall is dim. The changing reflection by the canal may make the surface easier to read.';else{changed=add(s,'wall_revealed','Reflected canal light reveals old markings under the workshop’s surface.');message='With the covering aside, the reflection reveals old markings matching the geometry in the crystal and temple.';}}
  if(id==='research'){if(choice==='leave')message='The drawings remain visible. The approaching guards give Kaelan reason to conceal them.';else if(!f.wall_revealed)message='Kaelan can protect the work, but the shifting wall still deserves attention.';else{changed=add(s,'concealed','Kaelan concealed his research as guards approached.');message='Kaelan covers the crystal and stows the drawings before the inspection. The discovery remains recorded.';}}
 }
 if(s.episode===5){
  if(id==='price'){changed=add(s,'price');message='The approved crystal price has tripled in the past year.';}
  if(id==='volume'){changed=add(s,'volume');message='The records show a tenfold increase in condemned crystal volume.';}
  if(id==='comparison'){if(!(f.price&&f.volume))message='Read both records before drawing a conclusion.';else if(choice==='manufactured'){changed=add(s,'compared','Higher approved prices and rising condemned volume undermine the claimed scarcity.');message='The two records together undermine the claim of simple scarcity: rejection has risen while approved prices climbed.';}else message='That reading leaves the rise in both price and condemned volume unexplained. The records remain open.';}
  if(id==='keeper'){changed=add(s,'key');message='“Western stacks, shelf 47. Be quick.” The keeper presses a small key into Kaelan’s hand.';}
  if(id==='western_stacks'){if(!f.key)message='The western stack is locked; the keeper may know how to open it.';else{changed=add(s,'stacks');message='The key opens the western stack. Hidden ledgers connect merchant routes with the ancient water channels.';}}
  if(id==='lamp'){if(!f.stacks)message='There is no hidden ledger on the table yet.';else if(choice==='oblique'){changed=add(s,'crystal_ink','Oblique lamplight exposes crystal-ink formulas and the altered grading history.');message='Light grazing the page reveals crystal ink: ancient formulas and a history of grading revisions.';}else if(choice==='direct')message='Direct light shows the ordinary writing but leaves the page’s faint marks unreadable.';else message='In darkness the ordinary writing and faint marks disappear; the lamp remains available.';}
 }
 return {state:s,message,changed,complete:finish()};
}
