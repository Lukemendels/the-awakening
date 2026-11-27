/** Authored episodes 8–10 of supplied Season 1 V4. Route signals, experimental
 * stations and overlays are reversible interactive staging, not extra canon. */
export const arc810Scenes=[
 {episode:8,id:'barge-route',roomId:'barge',title:'Night Navigation',place:'Outer-ring disposal barge',start:{x:4.5,y:6.3,angle:-Math.PI/2},source:'Season 1 V4, Episode 8',adaptationNote:'Two local routes and signal representations are playable staging; neither implies a new canonical route or a fight.',objective:'Use the dock signals to choose a supported route for the condemned cargo.',
  intro:[{speaker:'Narrator',text:'Kaelan takes work as a disposal barge navigator, recovering condemned crystals from the cargo.'},{speaker:'Narrator',text:'Dock workers and vendors quietly signal routes and warn of guard movements.'}],outro:[{speaker:'Narrator',text:'The saved crystals reveal patterns that respond to the city’s water channels.'},{speaker:'Narrator',text:'Inspection teams begin using crystal-tipped staffs. The three need a safer place to work.'}],
  objects:[
   {id:'dock-signal',label:'Dock-worker signal',x:2,y:2,description:'Observe the worker’s warning about the inner channel.',choices:[{id:'observe',label:'Watch the dock signal'}]},
   {id:'vendor-signal',label:'Vendor signal',x:6,y:2,description:'Observe the vendor’s indication about the canal passage.',choices:[{id:'observe',label:'Watch the vendor signal'}]},
   {id:'route-chart',label:'Barge route chart',x:4,y:4,description:'Choose a route supported by what you observed. Waiting and reconsidering is always possible.',choices:[{id:'inner',label:'Take the supported inner channel'},{id:'canal',label:'Take the supported canal passage'},{id:'wait',label:'Wait and reconsider'}]},
   {id:'condemned-cargo',label:'Condemned crystal cargo',x:2,y:5.25,description:'Examine the cargo without changing the route.',choices:[{id:'inspect',label:'Examine the condemned crystals'}]}
  ],hints:['Watch how a trusted person signals a route.','Either the dock worker or the vendor can support a route; you do not need both.','The dock signal supports the inner channel; the vendor signal supports the canal passage. Wait if you are unsure.']},
 {episode:9,id:'warehouse-experiment',roomId:'warehouse',title:'The Warehouse',place:'Warehouse by the water gate',start:{x:4,y:6.3,angle:-Math.PI/2},source:'Season 1 V4, Episode 9',adaptationNote:'The two test positions and single-stone control are interpretive staging for the source’s warehouse experiments.',objective:'Test whether the crystal response changes with position in the warehouse.',
  intro:[{speaker:'Narrator',text:'An abandoned warehouse near the water gate becomes their hidden workshop.'},{speaker:'Narrator',text:'Its thick walls shield crystal energy, and faint marks remain in the old stone.'}],outro:[{speaker:'Narrator',text:'The warehouse markings echo the temple’s geometry, while nearby water carries unusual harmonics.'},{speaker:'Narrator',text:'Some combinations of condemned crystals produce effects the three cannot yet explain.'}],
  objects:[
   {id:'specimen-setup',label:'Crystal experiment',x:4,y:4.3,description:'Choose one arrangement at the bench, then carry it between the two positions. A single crystal is an optional control.',choices:[{id:'paired',label:'Use the paired crystals'},{id:'single',label:'Use one crystal as a control'},{id:'take',label:'Take the apparatus'},{id:'place',label:'Place it on the bench'}]},
   {id:'marked-wall',label:'Marked wall position',x:2,y:2,description:'Observe the current arrangement near the old markings.',choices:[{id:'observe',label:'Observe at the marked wall'},{id:'place',label:'Place the apparatus here'},{id:'take',label:'Take the apparatus'}]},
   {id:'water-channel',label:'Water-channel position',x:6,y:2,description:'Observe the same arrangement near the channel.',choices:[{id:'observe',label:'Observe at the channel'},{id:'place',label:'Place the apparatus here'},{id:'take',label:'Take the apparatus'}]},
   {id:'experiment-notes',label:'Experiment notes',x:6.8,y:5.2,description:'Compare like with like before drawing a conclusion.',choices:[{id:'localized',label:'The paired response differs between the two positions'},{id:'same-everywhere',label:'Position has no effect on the paired response'},{id:'different-crystals',label:'The comparison proves the crystals were changed between tests'}]}
  ],hints:['Keep the crystal arrangement the same while changing where it is observed.','Try the paired crystals at both locations; one crystal is a useful optional control.','The paired response is stronger near the marked wall than at the other position.']},
 {episode:10,id:'city-synthesis',roomId:'warehouse',title:'Patterns of Power',place:'Warehouse city model',start:{x:7,y:6.2,angle:-Math.PI/2},source:'Season 1 V4, Episode 10',adaptationNote:'A hands-on layered city model stages the source’s synthesis of records; the visual overlays are illustrative, not canonical measurements.',objective:'Use known evidence to interpret the city’s rings.',
  intro:[{speaker:'Narrator',text:'Checkpoints multiply, and the searches seem targeted with disturbing precision.'},{speaker:'Narrator',text:'The three bring their observations and records to a model of the city.'}],outro:[{speaker:'Narrator',text:'The city’s concentric rings act as resonance channels, and the ceremonies maintain crucial astronomical alignments.'},{speaker:'Narrator',text:'Their experiments begin to ripple through the crystal network. Atlantis itself seems to be awakening.'}],
  objects:[
   {id:'architecture-record',label:'Temple geometry record',x:2,y:2,description:'Consider the temple’s geometry alongside the city model.',choices:[{id:'overlay',label:'Place the architectural evidence'}]},
   {id:'water-record',label:'Water-channel record',x:6,y:2,description:'Consider the channels alongside the city model.',choices:[{id:'overlay',label:'Place the water evidence'}]},
   {id:'astronomy-record',label:'Astronomical record',x:2,y:5,description:'Consider the documented celestial alignments alongside the model.',choices:[{id:'overlay',label:'Place the astronomical evidence'}]},
   {id:'city-model',label:'City ring model',x:4.5,y:4,description:'Compare the evidence you have placed. Two different strands are enough to form a supported interpretation; a third can strengthen it.',choices:[{id:'resonance',label:'The rings connect architecture, water and resonance'},{id:'trade-only',label:'The rings are only a trade layout'},{id:'unrelated',label:'The evidence has no common relationship'}]}
  ],hints:['Bring more than one kind of evidence to the city model.','Architecture, water and astronomical observations offer different perspectives; any two can support comparison.','The rings and channels form a connected resonance system, not merely a trade layout.']}
];
const flagKeys=['dock_signal','vendor_signal','cargo','route_selected','ep9_conclusion','architecture','water','astronomy','ep10_conclusion'];
const sampleKeys=['wall_single','channel_single','wall_paired','channel_paired'];
export function fresh810(){return {version:1,episode:8,flags:{},route:null,setup:null,apparatus:'bench',samples:{wall_single:false,channel_single:false,wall_paired:false,channel_paired:false},journal:[],hints:{}};}
export function canResume810(s){
 if(!s||typeof s!=='object'||Array.isArray(s)||s.version!==1||![8,9,10,11].includes(s.episode))return false;
 if(Object.keys(s).some(k=>!['version','episode','flags','route','setup','apparatus','samples','journal','hints'].includes(k)))return false;
 if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||Object.entries(s.flags).some(([k,v])=>!flagKeys.includes(k)||v!==true))return false;
 if(![null,'inner','canal'].includes(s.route)||![null,'single','paired'].includes(s.setup)||!(s.apparatus===undefined||['bench','carried','wall','channel'].includes(s.apparatus)))return false;
 if(!s.samples||typeof s.samples!=='object'||Array.isArray(s.samples)||Object.keys(s.samples).length!==sampleKeys.length||sampleKeys.some(k=>typeof s.samples[k]!=='boolean'))return false;
 if(!Array.isArray(s.journal)||s.journal.length>16||s.journal.some(x=>typeof x!=='string'||x.length>400))return false;
 if(!s.hints||typeof s.hints!=='object'||Array.isArray(s.hints)||Object.entries(s.hints).some(([k,v])=>!['8','9','10'].includes(k)||!Number.isInteger(v)||v<1||v>3))return false;
 const f=s.flags,overlayCount=['architecture','water','astronomy'].filter(k=>f[k]).length;
 if(!!f.route_selected!==!!s.route)return false;
 if(s.route==='inner'&&!f.dock_signal||s.route==='canal'&&!f.vendor_signal)return false;
 if(f.ep9_conclusion&&!(s.samples.wall_paired&&s.samples.channel_paired))return false;
 if(f.ep10_conclusion&&overlayCount<2)return false;
 if(s.episode===8&&(s.setup!==null||Object.values(s.samples).some(Boolean)||f.ep9_conclusion||overlayCount||f.ep10_conclusion))return false;
 if(s.episode===9&&(overlayCount||f.ep10_conclusion))return false;
 if(s.episode>=9&&!f.route_selected||s.episode>=10&&!f.ep9_conclusion||s.episode===11&&!f.ep10_conclusion)return false;
 return true;
}
export function restore810(raw){try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!canResume810(s))return fresh810();const copy=structuredClone(s);if(copy.apparatus===undefined)copy.apparatus='bench';return copy;}catch{return fresh810();}}
const complete=s=>s.episode===8?!!s.flags.route_selected:s.episode===9?!!s.flags.ep9_conclusion:s.episode===10?!!s.flags.ep10_conclusion:s.episode===11;
function add(s,key,note){if(s.flags[key])return false;s.flags[key]=true;if(note&&!s.journal.includes(note))s.journal.push(note);return true;}
function note(s,entry){if(!s.journal.includes(entry))s.journal.push(entry);}
export function arc810Act(previous,action){
 const s=restore810(previous),sc=arc810Scenes.find(x=>x.episode===s.episode);let message='',changed=false;
 if(!sc||!action||typeof action!=='object')return {state:s,message,changed,complete:complete(s)};
 if(action.type==='hint'){const n=Math.min((s.hints[s.episode]||0)+1,3);changed=n!==(s.hints[s.episode]||0);s.hints[s.episode]=n;return {state:s,message:sc.hints[n-1],changed,complete:complete(s)};}
 if(action.type==='advance'){if(!complete(s))return {state:s,message:'There is more to understand before moving on.',changed:false,complete:false};s.episode++;s.setup=null;return {state:s,message:'',changed:true,complete:true};}
 if(action.type!=='interact'||!sc.objects.some(o=>o.id===action.id&&o.choices.some(c=>c.id===action.choice)))return {state:s,message,changed,complete:complete(s)};
 const {id,choice}=action,f=s.flags;
 if(s.episode===8){
  if(id==='dock-signal'){changed=add(s,'dock_signal','The dock worker indicated a safe window on the inner channel.');message='The worker’s signal marks a clear window for the inner channel.';}
  if(id==='vendor-signal'){changed=add(s,'vendor_signal','The vendor indicated a safe window on the canal passage.');message='The vendor’s signal marks a clear window for the canal passage.';}
  if(id==='condemned-cargo'){changed=add(s,'cargo','The condemned cargo holds crystals with deliberate-looking patterns.');message='Condemned crystals glow in the cargo; their patterned interiors invite further study.';}
  if(id==='route-chart'){
   if(choice==='wait')message='Kaelan waits and can reconsider the available evidence. No cargo or progress is lost.';
   else if(choice==='inner'&&!f.dock_signal||choice==='canal'&&!f.vendor_signal)message='That route has not yet been supported by a signal. Wait, or observe a trusted warning before choosing.';
   else{const old=s.route;s.route=choice;changed=add(s,'route_selected','A trusted signal supported the barge’s chosen passage.')||old!==choice;message='Kaelan follows the supported passage and keeps the condemned crystals for study.';}
  }
 }
 if(s.episode===9){
  const station=id==='specimen-setup'?'bench':id==='marked-wall'?'wall':id==='water-channel'?'channel':null;
  if(station&&choice==='take'){
   if(s.apparatus===station){s.apparatus='carried';changed=true;message='Kaelan takes the same apparatus to carry it.';}
   else message=s.apparatus==='carried'?'The apparatus is already in hand.':'The apparatus is at another station.';
  }else if(station&&choice==='place'){
   if(s.apparatus==='carried'){s.apparatus=station;changed=true;message='The apparatus is placed at this station.';}
   else message=s.apparatus===station?'The apparatus is already here.':'Take the apparatus from its current station first.';
  }else if(id==='specimen-setup'){
   if(s.apparatus!=='bench')message='Return the apparatus to the bench before changing the arrangement.';
   else{changed=s.setup!==choice;s.setup=choice;message=choice==='paired'?'The two crystals remain together as a single test arrangement.':'One crystal is set as a control. Compare it at either position.';}
  }else if(id==='marked-wall'||id==='water-channel'){
   if(s.apparatus!==station)message='Carry and place the apparatus here before observing this position.';
   else if(!s.setup)message='Choose an arrangement at the bench so the two observations can be compared fairly.';
   else{const k=(id==='marked-wall'?'wall_':'channel_')+s.setup;changed=!s.samples[k];s.samples[k]=true;message=s.setup==='single'?'The single-crystal control gives a faint response at this position.':id==='marked-wall'?'The paired crystals respond strongly beside the marked wall.':'The same pair gives a weaker response at the channel position.';if(changed)note(s,`${s.setup==='paired'?'Paired crystals':'Single-crystal control'} observed at ${id==='marked-wall'?'the marked wall':'the water channel'}.`);}
  }
  if(id==='experiment-notes'){
   if(!(s.samples.wall_paired&&s.samples.channel_paired))message='The comparison needs the same paired arrangement observed in both places. The single-crystal control remains optional.';
   else if(choice==='localized'){changed=add(s,'ep9_conclusion','The paired crystal response differs between the marked wall and the channel position.');message='Keeping the pair fixed while changing position reveals a localized response near the marked wall.';}
   else message='That explanation does not fit the observations. The same pair responded differently in the two positions.';
  }
 }
 if(s.episode===10){
  const lookup={'architecture-record':['architecture','Architectural geometry was placed on the model.'],'water-record':['water','Water-channel evidence was placed on the model.'],'astronomy-record':['astronomy','Astronomical alignment evidence was placed on the model.']};
  if(lookup[id]){const [key,entry]=lookup[id];changed=add(s,key,entry);message=entry;}
  if(id==='city-model'){const count=['architecture','water','astronomy'].filter(k=>f[k]).length;
   if(count<2)message='Bring at least two different strands of evidence to the model before interpreting it. The third is optional.';
   else if(choice==='resonance'){changed=add(s,'ep10_conclusion','The city’s rings connect its architecture, channels and resonance.');message='The evidence supports a connected resonance system: the rings are more than a trade layout.';}
   else message='That interpretation leaves the observed relationships unexplained. The evidence remains on the model.';
  }
 }
 return {state:s,message,changed,complete:complete(s)};
}
