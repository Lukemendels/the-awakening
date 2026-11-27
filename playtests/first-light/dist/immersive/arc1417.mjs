/** Episodes 14–17, adapted from Season 1 V4. The instruction grammar,
 * detection-grid observation and staged ascent are playable interpretations,
 * not claims that the player prevents the canonical arrests or controls patrols. */
export const arc1417Scenes=[
 {episode:14,id:'ancient-resonance',roomId:'chamber',title:'Ancient Resonance',place:'Hidden chamber',source:'Season 1 V4 · episode 14',start:{x:4.4,y:6.2,angle:-Math.PI/2},
  objective:'Read the chamber and discover what the crystal array can reveal.',adaptationNote:'A simple visual instruction grammar stages Kai’s reading and Mira’s alignment; the water memory and their connection are canonical.',
  intro:[{speaker:'Narrator',text:'In the hidden chamber, water channels pulse with living memory. The walls carry patterns older than Atlantis.'},{speaker:'Kai',text:'These markings are not just equations. They are instructions.'}],
  outro:[{speaker:'Narrator',text:'Mira aligns the crystal array with the chamber. The water brightens, revealing temples, stars, and channels carrying power through the city.'},{speaker:'Kaelan',text:'The merchant houses did not just suppress this knowledge. They corrupted it into something they could control.'},{speaker:'Narrator',text:'Kaelan and Mira meet each other’s eyes, then look away.'}],
  objects:[{id:'grammar',label:'Chamber markings',x:2,y:2,description:'Kai traces a sequence of carved signs beside a flowing channel.',choices:[{id:'read',label:'Read with Kai'},{id:'place',label:'Place the array'},{id:'turn-a',label:'Try orientation A'},{id:'turn-b',label:'Try orientation B'},{id:'take',label:'Take the array'}]},
   {id:'water',label:'Water memory',x:6.8,y:2.5,description:'Water moves in the carved paths. Its light changes near the crystals.',choices:[{id:'observe',label:'Observe the flow'}]},
   {id:'array',label:'Crystal array',x:4.5,y:4,description:'Mira holds the array beside the carved pattern.',choices:[{id:'take',label:'Take the array'}]}],
  hints:['Kai’s reading describes a relationship between the crystal and the water path.','Compare the carved direction with the moving water. Mira can place the array to follow the same geometry.']},
 {episode:15,id:'the-hunt',roomId:'chamber',title:'The Hunt',place:'Hidden chamber water-vision',source:'Season 1 V4 · episode 15',start:{x:4.4,y:6.2,angle:-Math.PI/2},
  objective:'Understand the search above without exposing the chamber.',adaptationNote:'The grid view and route interpretation stage observation of the detection network. The search continues and the unexplained help remains unnamed.',
  intro:[{speaker:'Narrator',text:'In his private vault, Thalor orders his guards to find them. The spreading resonance matches the warnings in his secret scrolls.'},{speaker:'Kai',text:'They are using the temple’s ceremonial crystals as a detection grid. They will find us soon.'}],
  outro:[{speaker:'Narrator',text:'Patrols unexpectedly turn away from promising leads, and detection crystals fail. Someone unseen is working against the search.'},{speaker:'Mira',text:'We will find a way.'},{speaker:'Narrator',text:'Mira takes Kaelan’s hand as they watch his father’s shop being searched. The array brightens at their touch.'}],
  objects:[{id:'grid',label:'Detection reflections',x:2,y:2,description:'Ceremonial crystals pulse across the water-vision as the patrol searches.',choices:[{id:'observe',label:'Watch the grid'}]},
   {id:'patrol',label:'Patrol water-vision',x:6.8,y:2.5,description:'Figures and crystal reflections move across the district.',choices:[{id:'observe',label:'Watch the search'}]},
   {id:'route',label:'Chamber route',x:4.5,y:4,description:'Consider the safest moment to move while the search continues.',choices:[{id:'wait',label:'Watch and wait'},{id:'move',label:'Move with the others'}]}],
  hints:['Watch how the bright sweep moves relative to the passage.','A gap between sweeps is temporary; it does not switch off the search.']},
 {episode:16,id:'ascending-powers',roomId:'chamber',title:'Ascending Powers',place:'Ascending water channels',source:'Season 1 V4 · episode 16',start:{x:4.4,y:6.2,angle:-Math.PI/2},
  objective:'Follow the continuity of the rising water to understand the route.',adaptationNote:'The three staged landings represent the upward spiral; this is a staged ascent, not simulated platforming.',
  intro:[{speaker:'Narrator',text:'Their array’s resonance spreads upward through the water channels. In the temple district, ceremonial crystals pulse with ancient harmonics.'},{speaker:'Kai',text:'The whole temple is a machine, and we are powering it up.'}],
  outro:[{speaker:'Mira',text:'These are not just control points. They are telling us where to go.'},{speaker:'Narrator',text:'Kai’s calculations, Mira’s intuition, and Kaelan’s knowledge of the channels reveal a spiral path upward through the temple.'}],
  objects:[{id:'lower',label:'Lower channel',x:2,y:2,description:'A lit channel rises from the chamber floor and turns toward the next landing.',choices:[{id:'observe',label:'Trace the lower turn'},{id:'follow',label:'Follow this channel'}]},
   {id:'upper',label:'Far landing',x:6.8,y:2.5,description:'The same stream reappears higher up and turns around the central space.',choices:[{id:'observe',label:'Trace the upper turn'},{id:'follow',label:'Follow this channel'}]},
   {id:'ascent',label:'Inner landing',x:4.5,y:4,description:'Choose the interpretation that preserves the path of the water.',choices:[{id:'follow',label:'Follow this channel'}]}],
  hints:['Compare the channel’s turning direction with the marked landings on Kai’s sketch.','Start at the lower channel, follow the water to the far landing, then the inner landing.']},
 {episode:17,id:'the-price',roomId:'chamber',title:'The Price',place:'Chamber water-vision',source:'Season 1 V4 · episode 17',start:{x:4.4,y:6.2,angle:-Math.PI/2},
  objective:'Witness the consequences; continue when you are ready.',adaptationNote:'Attention choices are optional; arrests happen in the story and no player action can prevent them.',
  intro:[{speaker:'Narrator',text:'Through the water-vision, Thalor’s forces drag Kaelan’s father toward the central holding cells.'},{speaker:'Mira',text:'You cannot help him by getting caught.'}],
  outro:[{speaker:'Kai',text:'Anyone who ever helped us...'}, {speaker:'Narrator',text:'Some allies vanish just before arrest. Others are led to safety by hooded figures through hidden passages.'}],
  objects:[{id:'father',label:'Father’s arrest',x:2,y:2,description:'The water carries an image of the central holding cells.',choices:[{id:'observe',label:'Watch the water'}]},
   {id:'allies',label:'Canal network',x:6.8,y:2.5,description:'The search reaches shop owners, dock workers, and the archive keeper.',choices:[{id:'observe',label:'Look for their allies'}]},
   {id:'continue',label:'The way onward',x:4.5,y:4,description:'Mira holds Kaelan back. Continue when ready.',choices:[{id:'continue',label:'Continue the story'}]}],
  hints:['There is no puzzle here and no way to prevent these fixed events. Continue when ready.']}
];
const flagNames=['reading','flow','aligned','grid','patrol','route','lower','upper','spiral','father','allies','finished17'];
export const freshArc1417=()=>({version:1,episode:14,flags:{},journal:[],hints:{},placement:'bench',sweep:'unseen',ascent:0});
export function canResumeArc1417(s){
 if(!s||typeof s!=='object'||Array.isArray(s)||s.version!==1||![14,15,16,17,18].includes(s.episode)||Object.keys(s).some(k=>!['version','episode','flags','journal','hints','placement','sweep','ascent'].includes(k))||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||!Array.isArray(s.journal)||s.journal.length>15||s.journal.some(v=>typeof v!=='string')||!s.hints||typeof s.hints!=='object'||Array.isArray(s.hints))return false;
 if(Object.entries(s.flags).some(([k,v])=>!flagNames.includes(k)||v!==true)||Object.entries(s.hints).some(([k,v])=>!['14','15','16','17'].includes(k)||!Number.isInteger(v)||v<1||v>(k==='17'?1:2)||Number(k)>s.episode))return false;
 if(!['bench','carried','channel'].includes(s.placement)||!['unseen','crossing','gap'].includes(s.sweep)||![0,1,2,3].includes(s.ascent))return false;const f=s.flags;if(f.aligned&&s.placement!=='channel'||f.route&&s.sweep!=='gap'||f.spiral&&s.ascent!==3||s.ascent===3&&!f.spiral||s.episode===14&&(s.sweep!=='unseen'||s.ascent!==0)||s.episode===15&&s.ascent!==0||s.episode>=16&&s.sweep!=='gap'||s.episode>=17&&s.ascent!==3)return false;if(s.episode>=15&&!f.aligned||s.episode>=16&&!f.route||s.episode>=17&&!f.spiral||s.episode===18&&!f.finished17)return false;
 const min={reading:14,flow:14,aligned:14,grid:15,patrol:15,route:15,lower:16,upper:16,spiral:16,father:17,allies:17,finished17:17};return !Object.keys(f).some(k=>min[k]>s.episode);
}
export function restoreArc1417(raw){if(!canResumeArc1417(raw))return freshArc1417();return {version:1,episode:raw.episode,flags:{...raw.flags},journal:[...raw.journal],hints:{...raw.hints},placement:raw.placement,sweep:raw.sweep,ascent:raw.ascent};}
const complete=s=>s.episode===14?!!s.flags.aligned:s.episode===15?!!s.flags.route:s.episode===16?!!s.flags.spiral:s.episode>=17;
function add(s,key,note){if(s.flags[key])return false;s.flags[key]=true;if(note&&!s.journal.includes(note))s.journal.push(note);return true;}
export function arc1417Act(previous,action){
 const s=restoreArc1417(previous),scene=arc1417Scenes.find(v=>v.episode===s.episode);let changed=false,message='';
 if(!action||typeof action!=='object'||!scene)return {state:s,message,changed,complete:complete(s)};
 if(action.type==='hint'){const n=Math.min((s.hints[s.episode]||0)+1,scene.hints.length);changed=n!==(s.hints[s.episode]||0);s.hints[s.episode]=n;return {state:s,message:scene.hints[n-1],changed,complete:complete(s)};}
 if(action.type==='advance'){if(!complete(s))return {state:s,message:'There is more to understand here.',changed:false,complete:false};if(s.episode===17)add(s,'finished17');s.episode++;return {state:s,message:'',changed:true,complete:true};}
 if(action.type!=='interact'||!scene.objects.some(o=>o.id===action.id&&o.choices.some(c=>c.id===action.choice)))return {state:s,message,changed,complete:complete(s)};
 const {id,choice}=action;
 if(s.episode===14){
  if(id==='grammar'&&choice==='read'){changed=add(s,'reading','Kai reads the chamber markings as instructions rather than equations alone.');message='Kai traces the crystal and water signs: their curves share a direction.';}
  if(id==='water'){changed=add(s,'flow');message='The water follows the carved path; its curve is visible beside the stone.';}
  if(id==='array'&&choice==='take'){if(s.placement==='bench'){s.placement='carried';changed=true;message='Kaelan lifts the array. Bring it to a place where the markings and channel meet.';}else message=s.placement==='carried'?'The array is already in hand.':'The array is at the chamber markings.';}
  if(id==='grammar'&&choice==='place'){if(s.placement==='carried'){s.placement='channel';changed=true;message='Mira places the array beside the channel. Its orientation can be changed.';}else message=s.placement==='channel'?'The array is already beside the channel.':'Bring the array here first.';}
  if(id==='grammar'&&choice==='take'){if(s.placement==='channel'&&!s.flags.aligned){s.placement='carried';changed=true;message='Kaelan takes the array again.';}else message=s.flags.aligned?'The array is aligned and the memory is visible.':'The array is not here.';}
  if(id==='grammar'&&['turn-a','turn-b'].includes(choice)){if(s.placement!=='channel')message='Place the array here before changing its orientation.';else if(choice==='turn-b')message='The light weakens and the water’s image breaks apart. The array can be turned again.';else{changed=add(s,'aligned','The array aligned with chamber geometry reveals water memories of Atlantis.');message='Mira follows the chamber geometry. Water brightens into memories of temples, stars and power.';}}
 }
 if(s.episode===15){
  if(id==='grid'){changed=add(s,'grid','Ceremonial crystals form a detection grid searching the district.');if(s.sweep==='unseen'){s.sweep='crossing';changed=true;}message='A bright sweep crosses the passage; another follows it after a short interval.';}
  if(id==='patrol'){changed=add(s,'patrol','Some patrols turn away and some detection crystals fail for reasons still unknown.');message='The patrol continues, but one promising lead is abandoned without explanation.';}
  if(id==='route'&&choice==='wait'){if(s.sweep==='unseen')message='The sweep’s movement is difficult to judge from here. Study its reflection at the grid first.';else if(s.sweep==='gap')message='For this moment, the sweep has moved beyond the passage.';else{s.sweep='gap';changed=true;message='The light passes the passage. A temporary gap opens before the next sweep.';}}
  if(id==='route'&&choice==='move'){if(s.sweep!=='gap')message='The bright sweep still crosses the passage. Watch its movement before continuing.';else{changed=add(s,'route','A temporary gap between detection sweeps offers a moment to move; the search continues.');message='They move between sweeps. The grid and patrols remain active.';}}
 }
 if(s.episode===16){
  if(id==='lower'&&choice==='observe'){changed=add(s,'lower');message='The lower channel turns around the centre toward the far landing.';}
  if(id==='upper'&&choice==='observe'){changed=add(s,'upper');message='Higher up, water reappears and continues toward the inner landing.';}
  if(choice==='follow'){
   const expected=['lower','upper','ascent'][s.ascent];
   if(id!==expected)message='This landing is not connected from the group’s current position. Compare it with the turning channel; nothing is lost.';
   else{s.ascent++;changed=true;message=s.ascent===1?'They follow the lower turn toward the far landing.':s.ascent===2?'The water continues upward and inward.':'The turns connect into one rising spiral through the temple.';if(s.ascent===3)add(s,'spiral','The rising water traces a continuous spiral through the temple.');}
  }
 }
 if(s.episode===17){
  if(id==='father'){changed=add(s,'father','Kaelan’s father is taken toward the central holding cells.');message='Mira grips Kaelan’s arm. He cannot help his father by being caught.';}
  if(id==='allies'){changed=add(s,'allies','Their allies face arrest; some are secretly warned or guided to safety.');message='The search reaches the people who helped them. Some vanish or are guided away by hooded figures.';}
  if(id==='continue')message='Mira stays beside Kaelan as they look for a way onward.';
 }
 return {state:s,message,changed,complete:complete(s)};
}
