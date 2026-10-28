import {hubs,missionHubs,exits} from './adventure.mjs';
// V4 chapter order is fixed. Physical puzzles below are reversible adaptations.
export const chapters = [
 ['Plaza after the surge','Recover and examine the shard. The ceremony has already failed.','light',['Merchant loupe','Crystal shard','Floor markers'],'Kaelan'],
 ['Family crystal shop','Compare condemned geometry with the revised grading notice.','light',['Condemned specimen','Grading notice','Price ledger'],'Kaelan'],
 ['Outer water gate','Connect the reflected canal pattern to the archive diagram.','flow',['Archive diagram','Recovered shard','Canal marks'],'Kaelan'],
 ['Workshop wall','Direct canal light onto the old wall, then conceal the experiment.','light',['Wall scratches','Canal reflection','Cover cloth'],'Kaelan'],
 ['Western stacks · shelf 47','Compare price and condemned volume, then reveal the grading history.','ledger',['Keeper key','Trade ledger','Crystal lamp'],'Kaelan'],
 ['Mira’s workbench','Couple the mounting to the miniature water channels.','flow',['Mounting frame','Patterned crystal','Water model'],'Mira'],
 ['Communication tower','Match the visible bell trace by tuning the three bands.','tune',['Bell trace','Star chart','Kai’s instrument'],'Kai'],
 ['Disposal barge','Open a continuous safe water route through the gates.','flow',['Dock signal','Gate chart','Condemned cargo'],'Kaelan'],
 ['Warehouse base','Feed the recovered array through the old wall channels.','flow',['Recovered array','Ancient grooves','Valve handle'],'Mira'],
 ['City ring model','Balance three ring loads without wasting the available supply.','balance',['Ring map','Load marks','Crystal supply'],'Kaelan'],
 ['Warehouse water-vision','Tune the view of Thalor’s vault from the channels.','tune',['Anomaly trace','Water lens','Warning silhouette'],'Kai'],
 ['Warehouse breach','Redirect the water, stabilize the array and tune the doorway.','escape',['Wall map','Mounting brace','Lock trace'],'Mira'],
 ['Hidden doorway','The doorway is open. Pack the charts and array, inspect the passage, then enter.','pack',['Kai’s charts','Mira’s array','Doorway marks'],'Mira'],
 ['Ancient chamber','Read the chamber’s harmonic instructions and restore the water memory.','tune',['Pristine equations','Water memory','Shielding trace'],'Kai'],
 ['Detection grid','Route resonance through the blind channel.','flow',['Grid diagram','Patrol gap','Hidden channel'],'Kaelan'],
 ['Ascending channels','Feed the upward path and calibrate the lift array.','escape',['Rising water','Spiral marks','Control trace'],'Mira'],
 ['Chamber overlook','Tune the water-vision to locate the arrested allies.','tune',['Holding-cell trace','Ally signals','Hidden passage trace'],'Kai'],
 ['Temple ascent','Open the rising route, isolate the unstable circuit and repair the observer.','escape',['Ascending map','Isolation brace','Observer trace'],'Mira'],
 ['High temple','Stabilize reception of the Order’s pure harmonic signal.','tune',['Robe geometry','Pure trace','Temple markers'],'Kai'],
 ['Memory chamber','Illuminate the records of catastrophe, founding and protection.','light',['Catastrophe record','Founding record','Warning array record'],'Kaelan'],
 ['Order passage network','Trace the rescue passages. The Order brings the captives to safety.','flow',['Order route','Father’s signal','Distant city link'],'Kaelan'],
 ['Exposed vault records','Reveal the suppressed layers beneath the grading revisions.','light',['Grading history','Trade control record','Vault document'],'Kaelan'],
 ['Restoration hub','Supply all three city rings and restore their shared network.','balance',['Outer-ring demand','Middle-ring demand','Inner-ring demand'],'Kaelan'],
 ['Repository chart','Link the distant sites on the shared chart before initiation.','flow',['Harbor routes','Distant site chart','Library proposal'],'Kaelan']
].map(([place,goal,type,objects,actor],i)=>({place,goal,type,objects,actor,
 target:[2+(i%2),3,4-(i%2)], loads:i===22?[4,3,2]:[2,3,4],
 exits:i===0?'Recover the evidence':i===3?'Cover the signature and stow research':i===12?'Carry charts and array into the passage':i===23?'Enter the initiation':'Continue the journey'}));
// Revelation and consequence chapters breathe between physical mechanisms.
// They require exploration, not an unrelated lock added to a canonical reveal.
for(const i of [10,16,18,19,20,23])chapters[i].type='pack';
chapters[10].goal='Inspect the spreading anomalies and witness the warning scrolls through the water-vision.';
chapters[16].goal='Locate the arrested allies and record the unexplained safe passages.';
chapters[18].goal='Observe the newcomers and recognize the Order of Seraphim.';
chapters[19].goal='Examine the memories of catastrophe, founding and protective science.';
chapters[20].goal='Follow the Order’s rescue evidence and confirm that Kaelan’s father is safe.';
chapters[23].goal='Gather the harbor routes, distant sites and open-library proposal before initiation.';

// Direction bits: north=1, east=2, south=4, west=8.
// A single winding route crosses every tile. Rotation changes connectivity.
export const basePipes=[12,6,12,5,3,9,3,10,10];
export const solvedPipes=[6,10,12,3,12,5,10,9,3];
// Fixed valid path: west -> 0 -> 1 -> 2 -> 5 -> 4 -> 3 -> 6 -> 7 -> 8 -> east.
export const routePipes=[10,10,12,6,10,9,3,10,10];
export function routeFor(chapter){
 return chapter%3===0?routePipes:chapter%3===1?[10,10,12,5,6,5,3,10,3]:[12,6,10,5,3,12,3,10,10];
}
export function rotate(mask){return ((mask<<1)&15)|(mask>>3);}
// Some segments are built into the architecture and cannot be rotated.
export function lockedTiles(chapter){return chapter>=7?[chapter%9,(chapter+4)%9]:[];}
export function newPuzzle(chapter){
 const pipes=routeFor(chapter).map((p,i)=>{if(lockedTiles(chapter).includes(i))return p;for(let r=0;r<(i*chapter+chapter)%3+1;r++)p=rotate(p);return p;});
 return {pipes,bands:[1,1,1],angles:[0,0],loads:[0,0,0],stage:0,secured:false};
}
export function fresh(){return {version:4,chapter:0,location:'plaza',room:'scene',actor:'Kaelan',seen:[],inventory:[],journal:[],ledgerEvidence:[],applied:null,puzzle:newPuzzle(0),solved:false,finished:false,pressure:false,moves:0,sound:false,history:[]};}
export function connected(pipes){
 const seen=new Set(),queue=[];
 if(pipes[0]&8){seen.add(0);queue.push(0);}
 const dirs=[[-3,1,4],[1,2,8],[3,4,1],[-1,8,2]];
 while(queue.length){const i=queue.shift();for(const [delta,out,inside] of dirs){const j=i+delta;if(j<0||j>8||delta===1&&i%3===2||delta===-1&&i%3===0)continue;if((pipes[i]&out)&&(pipes[j]&inside)&&!seen.has(j)){seen.add(j);queue.push(j);}}}
 return {wet:[...seen],open:seen.has(8)&&!!(pipes[8]&2)};
}
export function kind(s){const t=chapters[s.chapter].type;return t==='escape'?(s.puzzle.stage===0?'flow':s.puzzle.stage===1?'light':'tune'):t;}
export function specialist(s){return chapters[s.chapter].type==='escape'?['Kaelan','Mira','Kai'][s.puzzle.stage]:chapters[s.chapter].actor;}
export function requiredItem(s){
 const c=chapters[s.chapter];
 return c.objects[c.type==='escape'?s.puzzle.stage:c.type==='ledger'?0:c.type==='flow'?2:c.type==='tune'?2:c.type==='balance'?2:0];
}
// Current-state observations derived strictly from V4 milestones.
export function cityStatus(s,location){
 const n=s.chapter+(s.solved?1:0);
 if([0,1].includes(location))return n>=23?'Crystal distribution is being restored across the city.':n>=17?'The search and arrests have reached people who helped the investigation.':n>=2?'The grading warning and steep prices burden the outer-ring shop.':'The illumination has failed; guards control the plaza.';
 if([2,7,8,9,10].includes(location))return n>=23?'Reawakened channels support shared crystal distribution.':n>=10?'Checkpoints and awakened channel activity have changed the waterways.':n>=8?'Disposal barges and dock signals mark the water routes.':'Condemned crystals move along the water.';
 if(location===4)return n>=22?'Thalor’s documents have been exposed before the Order.':n>=5?'The keeper’s key opened the western stacks and revealed grading history.':'Public ledgers remain available for inspection.';
 if([11,12,13,14,15,16,17,18,19,20,21,22,23].includes(location))return n>=23?'The Order is restoring the city’s network and planning to share knowledge.':n>=21?'The Order’s network has brought Kaelan’s father and other captives to safety.':n>=19?'The Order of Seraphim has revealed itself at the high temple.':n>=17?'Captured allies are in danger; unknown helpers move through hidden passages.':'The old channels and temple mechanisms remain under investigation.';
 return n>=23?'The restored network is being shared across Atlantis.':n>=11?'Inspections and arrests have intensified.':'The investigation continues through the city.';
}
export function metrics(s){
 const c=chapters[s.chapter],p=s.puzzle,k=kind(s);
 if(k==='flow')return connected(p.pipes);
 if(k==='tune')return {error:p.bands.reduce((n,v,i)=>n+Math.abs(v-c.target[i]),0),open:p.bands.every((v,i)=>v===c.target[i])};
 if(k==='ledger')return {open:p.bands[0]===3&&p.bands[1]===4&&s.ledgerEvidence.includes('Price ledger')&&s.ledgerEvidence.includes('Trade ledger')};
 if(k==='balance')return {supply:9-p.loads.reduce((a,b)=>a+b,0),open:p.loads.every((v,i)=>v===c.loads[i])};
 const target=[(s.chapter+2)%8,(s.chapter+5)%8];
 return {target,open:p.angles.every((v,i)=>v===target[i])};
}
export function act(previous,a){
 const s=structuredClone(previous),c=chapters[s.chapter];
 if(a.type==='travel'&&exits(s).includes(a.to)){s.location=a.to;s.room='scene';return s;}
 if(s.finished&&a.type!=='setting')return s;
 if(!['setting','actor'].includes(a.type)&&s.location!==missionHubs[s.chapter])return s;
 if(a.type==='inspect'&&Number.isInteger(a.i)&&a.i>=0&&a.i<3){if(!s.seen.includes(a.i)){s.seen.push(a.i);s.inventory.push(c.objects[a.i]);s.journal.push({chapter:s.chapter,text:c.objects[a.i]});}if(c.type==='pack'&&s.seen.length===3)s.solved=true;return s;}
 if(a.type==='actor'&&['Kaelan',...(s.chapter>=5?['Mira']:[]),...(s.chapter>=6?['Kai']:[])].includes(a.name)){s.actor=a.name;return s;}
 if(a.type==='evidence'&&s.chapter===4&&['Price ledger','Trade ledger'].includes(a.name)&&s.inventory.includes(a.name)&&!s.ledgerEvidence.includes(a.name)){s.ledgerEvidence.push(a.name);return s;}
 if(a.type==='apply'&&a.name===requiredItem(s)&&s.inventory.includes(a.name)){s.applied=a.name;return s;}
 if(a.type==='setting'&&['sound','pressure'].includes(a.key)){s[a.key]=!s[a.key];return s;}
 if(a.type==='room'){s.room=a.room==='bench'?'bench':'scene';return s;}
 if(a.type==='undo'&&s.history.length){s.puzzle=s.history.pop();s.solved=false;return s;}
 if(a.type==='reset'){
  const initial=newPuzzle(s.chapter),k=kind(s);
  if(k==='flow')s.puzzle.pipes=initial.pipes;
  if(k==='light')s.puzzle.angles=initial.angles;
  if(k==='tune')s.puzzle.bands=initial.bands;
  if(k==='ledger')s.puzzle.bands=initial.bands;
  if(k==='balance')s.puzzle.loads=initial.loads;
  s.moves=0;s.solved=false;s.history=[];return s;
 }
 if(a.type==='advance'&&s.solved&&s.seen.length===3){
  if(s.chapter===23)s.finished=true;
  else {s.chapter++;s.location=missionHubs[s.chapter];s.seen=[];s.applied=null;s.puzzle=newPuzzle(s.chapter);s.solved=false;s.moves=0;s.history=[];s.room='scene';s.actor=chapters[s.chapter].actor;}
  return s;
 }
 if(a.type==='turn'&&!s.solved&&s.seen.length===3&&s.actor===specialist(s)&&s.applied===requiredItem(s)){
  const k=kind(s),i=a.i;
  if(!Number.isInteger(i)||i<0||i>(k==='flow'?8:k==='light'?1:2))return s;
  if(k==='flow'&&lockedTiles(s.chapter).includes(i))return s;
  s.history.push(structuredClone(s.puzzle));s.history=s.history.slice(-30);
  if(k==='flow')s.puzzle.pipes[i]=rotate(s.puzzle.pipes[i]);
  if(k==='light')s.puzzle.angles[i]=(s.puzzle.angles[i]+(a.delta===-1?7:1))%8;
  if(k==='tune')s.puzzle.bands[i]=Math.max(1,Math.min(8,s.puzzle.bands[i]+(a.delta===-1?-1:1)));
  if(k==='ledger'&&i<2)s.puzzle.bands[i]=Math.max(1,Math.min(4,s.puzzle.bands[i]+(a.delta===-1?-1:1)));
  if(k==='balance'){const total=s.puzzle.loads.reduce((x,y)=>x+y,0);s.puzzle.loads[i]=Math.max(0,Math.min(9,s.puzzle.loads[i]+(a.delta===-1?-1:total<9?1:0)));}
  s.moves++;
  return s;
 }
 if(a.type==='test'&&s.seen.length===3&&s.actor===specialist(s)&&s.applied===requiredItem(s)&&metrics(s).open){
  if(c.type==='escape'&&s.puzzle.stage<2){s.puzzle.stage++;s.applied=null;s.history=[];s.moves=0;}
  else s.solved=true;
 }
 return s;
}
export function restore(raw){
 try{const s=JSON.parse(raw),ints=(a,n,min,max)=>Array.isArray(a)&&a.length===n&&a.every(v=>Number.isInteger(v)&&v>=min&&v<=max);
 if(s.version!==4||!Number.isInteger(s.chapter)||s.chapter<0||s.chapter>23||!s.puzzle||
 !ints(s.puzzle.pipes,9,1,15)||!ints(s.puzzle.bands,3,1,8)||!ints(s.puzzle.angles,2,0,7)||!ints(s.puzzle.loads,3,0,9)||
 !Number.isInteger(s.puzzle.stage)||s.puzzle.stage<0||s.puzzle.stage>2||!Array.isArray(s.seen)||new Set(s.seen).size!==s.seen.length||s.seen.some(v=>![0,1,2].includes(v))||
 !Array.isArray(s.inventory)||!s.inventory.every(v=>typeof v==='string')||!Array.isArray(s.journal)||!s.journal.every(x=>x&&Number.isInteger(x.chapter)&&x.chapter>=0&&x.chapter<24&&typeof x.text==='string')||
 !['Kaelan','Mira','Kai'].includes(s.actor)||!['scene','bench'].includes(s.room)||
 !['solved','finished','pressure','sound'].every(k=>typeof s[k]==='boolean'))return fresh();
 const validPuzzle=p=>p&&ints(p.pipes,9,1,15)&&ints(p.bands,3,1,8)&&ints(p.angles,2,0,7)&&ints(p.loads,3,0,9)&&p.loads.reduce((a,b)=>a+b,0)<=9&&Number.isInteger(p.stage)&&p.stage>=0&&p.stage<=2;
 if(!validPuzzle(s.puzzle))return fresh();
 s.ledgerEvidence=Array.isArray(s.ledgerEvidence)?s.ledgerEvidence.filter(x=>['Price ledger','Trade ledger'].includes(x)&&s.inventory.includes(x)):[];
 s.applied=typeof s.applied==='string'&&s.inventory.includes(s.applied)?s.applied:null;
 s.location=hubs[s.location]&&hubs[s.location].opens<=s.chapter?s.location:missionHubs[s.chapter];
 s.history=Array.isArray(s.history)?s.history.filter(validPuzzle).slice(-30):[];
 // Migrate earlier v4 saves to fixed architectural segments without losing
 // the movable controls, chapter, inventory or current escape stage.
 for(const p of [s.puzzle,...s.history])for(const i of lockedTiles(s.chapter))p.pipes[i]=routeFor(s.chapter)[i];
 return s;}catch{return fresh();}
}
