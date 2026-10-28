/** Season 1 V4 episodes 18–20. The instrument comparison is interpretive
 * staging; the ascent, trap, Order's arrival and memories are fixed canon. */
export const arc1820Scenes=[
 {episode:18,id:'high-temple',roomId:'high-temple',title:'The High Temple',place:'Original observation platform',start:{x:4.5,y:6.2,angle:-Math.PI/2},source:'Season 1 V4 · episode 18',adaptationNote:'The comparison of an original alignment and a modified instrument stages the source’s disturbed dust and attempted modifications. The guards still converge.',objective:'Explore the old observation platform and consider what has changed.',
 intro:[{speaker:'Mira',text:'There is another way. The water channels spiral up through the temple.'},{speaker:'Kai',text:'The upper levels are built on older foundations. If we could reach the original observation platform—'},{speaker:'Narrator',text:'Boots sound above them. They take what they can carry and follow the ascending water.'},{speaker:'Narrator',text:'Ceremonial crystals malfunction and passages redirect as the ancient structure helps them climb.'}],
 outro:[{speaker:'Mira',text:'Thalor has been here.'},{speaker:'Narrator',text:'Beyond the star-alignment shafts, patrols converge from every direction. At the highest point in Atlantis, the three are trapped.'}],
 objects:[
 {id:'original-markers',label:'Ancient star markers',x:2,y:2,description:'Read the original observation geometry in the stone.',choices:[{id:'observe',label:'Study the markers'}]},
 {id:'modified-instrument',label:'Observation instrument',x:6.7,y:2,description:'The instrument has been disturbed. Look closely at its relationship to the old marks.',choices:[{id:'observe',label:'Examine the instrument'}]},
 {id:'comparison',label:'Alignment comparison',x:4.5,y:3.8,description:'Compare the signs of recent handling with the original geometry.',choices:[{id:'altered',label:'The instrument was moved relative to the stone'},{id:'original',label:'The stone shifted while the instrument stayed fixed'},{id:'unknown',label:'Look again before deciding'}]},
 {id:'shaft',label:'Star-alignment shaft',x:2,y:5,description:'Look down toward the temple steps.',choices:[{id:'observe',label:'Look through the shaft'}]}
 ],hints:['Look for the difference between the old alignment and signs of recent handling.','Examine either the original markers or the instrument before comparing them.','Disturbed dust and an adjusted instrument show a recent intervention against the original marks.']},
 {episode:19,id:'ancient-guardians',roomId:'high-temple',title:'Ancient Guardians',place:'High temple',start:{x:4.5,y:6.2,angle:-Math.PI/2},source:'Season 1 V4 · episode 19',adaptationNote:'The player may observe or approach; no puzzle prevents the Order’s arrival.',objective:'Witness the arrival of the robed figures.',
 intro:[{speaker:'Narrator',text:'Guards reach the temple steps. Robed figures emerge from hidden doorways throughout the structure.'},{speaker:'Narrator',text:'Their geometric patterns match the temple designs and the patterns in the condemned crystals.'},{speaker:'Order leader',text:'We are the Order of Seraphim. We have waited centuries for the city’s true power to be rediscovered.'},{speaker:'Narrator',text:'The water channels pulse as members of the Order take positions throughout the temple.'}],
 outro:[{speaker:'Thalor',text:'The Order is nothing but legend—stories to frighten children!'},{speaker:'Narrator',text:'Yet fear carries in his voice.'}],
 objects:[{id:'robes',label:'Geometric robes',x:2,y:2,description:'Look at the patterns on the garments.',choices:[{id:'observe',label:'Observe the patterns'}]},{id:'resonance',label:'Order crystals',x:6.7,y:2,description:'Kai’s instruments respond to the newcomers.',choices:[{id:'observe',label:'Consider the resonance'}]},{id:'leader',label:'Order leader',x:4.5,y:3.6,description:'Approach the leader when ready.',choices:[{id:'continue',label:'Approach the leader'}]}],hints:['This is a revelation, not a locked mechanism. Approach the leader when ready.']},
 {episode:20,id:'catastrophe-memory',roomId:'high-temple',title:'Memories of Catastrophe',place:'High temple water-vision',start:{x:4.5,y:6.2,angle:-Math.PI/2},source:'Season 1 V4 · episode 20',adaptationNote:'The optional inspection stations stage water-memory correspondences; all core revelation is present without requiring a chronology quiz.',objective:'Follow the Order’s guided water-memory; pause at the visions if you wish.',
 intro:[{speaker:'Order leader',text:'Atlantis was founded by survivors who fled an older civilization’s disaster. The crystal technology was made for protection, not control.'},{speaker:'Narrator',text:'Ice advances, seas rise, and cities vanish beneath the waves in the water’s memory.'},{speaker:'Order leader',text:'The temple ceremonies preserve astronomical measurements crucial to our warning systems.'}],
 outro:[{speaker:'Mira',text:'Each flawed crystal we saved was engineered to respond to specific astronomical alignments.'},{speaker:'Narrator',text:'Kai’s charts reveal the city’s rings as a vast detection array. Mira’s mountings had recreated ancient configurations.'},{speaker:'Order leader',text:'The merchant houses corrupted these tools of protection, turning them into means of control.'}],
 objects:[{id:'founding-memory',label:'Founding memory',x:2,y:2,description:'Pause over the water’s image of an earlier civilization.',choices:[{id:'observe',label:'Watch the founding memory'}]},{id:'crystal-memory',label:'Crystal correspondence',x:6.7,y:2,description:'Consider the saved crystals and the sky together.',choices:[{id:'observe',label:'Watch the crystal memory'}]},{id:'rings-memory',label:'City-ring memory',x:2,y:5,description:'Look at Kai’s observations in the light of the Order’s explanation.',choices:[{id:'observe',label:'Watch the ring memory'}]},{id:'continue-memory',label:'Flowing water',x:4.5,y:3.6,description:'When ready, allow the memory to continue.',choices:[{id:'continue',label:'Continue the memory'}]}],hints:['You may pause at any vision, or continue. There is no test to pass.']}
];
const keys=['markers','instrument','comparison','shaft','robes','resonance','approached','founding','crystal','rings','continued'];
export function freshArc1820(){return {version:1,episode:18,flags:{},journal:[],hints:{}};}
export function canResumeArc1820(s){
 if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).some(k=>!['version','episode','flags','journal','hints'].includes(k))||s.version!==1||![18,19,20,21].includes(s.episode))return false;
 if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||Object.entries(s.flags).some(([k,v])=>!keys.includes(k)||v!==true))return false;
 if(!Array.isArray(s.journal)||s.journal.length>12||s.journal.some(x=>typeof x!=='string'||x.length>400)||!s.hints||typeof s.hints!=='object'||Array.isArray(s.hints)||Object.entries(s.hints).some(([k,v])=>!['18','19','20'].includes(k)||!Number.isInteger(v)||v<1||v>3))return false;
 const f=s.flags;if(f.comparison&&!(f.markers||f.instrument)||s.episode>=19&&!f.comparison||s.episode>=20&&!f.approached||s.episode===21&&!f.continued)return false;
 if(s.episode<19&&(f.robes||f.resonance||f.approached)||s.episode<20&&(f.founding||f.crystal||f.rings||f.continued))return false;
 return true;
}
export function restoreArc1820(raw){try{const s=typeof raw==='string'?JSON.parse(raw):raw;return canResumeArc1820(s)?structuredClone(s):freshArc1820();}catch{return freshArc1820();}}
const add=(s,key,entry)=>{if(s.flags[key])return false;s.flags[key]=true;if(entry&&!s.journal.includes(entry))s.journal.push(entry);return true;};
const complete=s=>s.episode===18?!!s.flags.comparison:s.episode===19?!!s.flags.approached:s.episode===20?!!s.flags.continued:s.episode===21;
export function arc1820Act(previous,action){
 const s=restoreArc1820(previous),scene=arc1820Scenes.find(v=>v.episode===s.episode);let changed=false,message='';
 if(!action||typeof action!=='object'||!scene)return {state:s,message,changed,complete:complete(s)};
 if(action.type==='hint'){const n=Math.min((s.hints[s.episode]||0)+1,scene.hints.length);changed=n!==(s.hints[s.episode]||0);s.hints[s.episode]=n;return {state:s,message:scene.hints[n-1],changed,complete:complete(s)};}
 if(action.type==='advance'){if(!complete(s))return {state:s,message:'There is more to consider before continuing.',changed:false,complete:false};s.episode++;return {state:s,message:'',changed:true,complete:true};}
 if(action.type!=='interact'||!scene.objects.some(o=>o.id===action.id&&o.choices.some(c=>c.id===action.choice)))return {state:s,message:'',changed:false,complete:complete(s)};
 const {id,choice}=action,f=s.flags;
 if(s.episode===18){
  if(id==='original-markers'){changed=add(s,'markers','The old star markers preserve the observation platform’s original geometry.');message='The engraved line meets a fixed notch in the stone. An older clean arc follows that line; the stone itself shows no displaced joint.';}
  if(id==='modified-instrument'){changed=add(s,'instrument','A high-temple instrument was recently adjusted against older alignment marks.');message='A crescent of dust lies inside the instrument’s ring. A clean arc ends at the stone notch; the pointer now crosses the ring elsewhere.';}
  if(id==='comparison'){
   if(choice==='unknown')message='There is time to look again; the guards’ convergence is not a countdown.';
   else if(!f.markers&&!f.instrument)message='Examine an alignment or an instrument before drawing a conclusion.';
   else if(choice==='original')message='The stone joints are intact, while the clean arc and displaced dust lie around the instrument’s ring. Consider which part moved.';
   else {changed=add(s,'comparison','The instrument was recently modified against the ancient star alignment.');message='The modified setting and disturbed dust contrast with the ancient alignment. Someone has been trying to change the mechanism.';}
  }
  if(id==='shaft'){changed=add(s,'shaft','Patrols converge on the temple while the trio is trapped above.');message='Through the shaft, patrols converge on the temple from every direction.';}
 }else if(s.episode===19){
  if(id==='robes'){changed=add(s,'robes','The Order’s robes repeat temple and condemned-crystal geometry.');message='The geometry on their robes matches the temple and the condemned crystals.';}
  if(id==='resonance'){changed=add(s,'resonance','Kai detects unfamiliar pure resonances from the Order’s crystals.');message='Kai’s instruments register pure resonances he has never recorded before.';}
  if(id==='leader'){changed=add(s,'approached');message='The Order’s leader looks at Kaelan, Mira and Kai in turn.';}
 }else if(s.episode===20){
  if(id==='founding-memory'){changed=add(s,'founding','Atlantis was founded by survivors of an older catastrophe.');message='The memory shows survivors of an older civilization seeking safety after catastrophe.';}
  if(id==='crystal-memory'){changed=add(s,'crystal','The saved crystals respond to astronomical alignments.');message='The saved crystals respond to specific celestial alignments; their patterns were engineered, not flawed.';}
  if(id==='rings-memory'){changed=add(s,'rings','Atlantis’s rings form a detection array.');message='The city rings and Kai’s charts resolve into a connected detection array.';}
  if(id==='continue-memory'){changed=add(s,'continued');message='The water-memory flows on; the Order explains what the technology was intended to protect.';}
 }
 return {state:s,message,changed,complete:complete(s)};
}
