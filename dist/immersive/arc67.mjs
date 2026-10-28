/**
 * Authored Episodes 6–7, Season 1 V4. This module contains no browser, rendering,
 * audio, or storage side effects. Physical experiment details are reversible
 * gameplay staging, not additional canonical claims. One state per run.
 */
export const arc67Meta = Object.freeze({
  6:{title:'The Crystal Artisan',location:'Mira’s workshop',portrait:'15B_Mira.webp',source:'Season 1 V4 · episode 6',adaptationNote:'The two-position mount and visual controls are interpretive staging. The source establishes that Mira’s mountings reveal crystal patterns and their relationship to the water channels.',
    intro:[{speaker:'Narrator',text:'In the crystal merchants’ quarter, Kaelan watches the communication hubs that carry messages between merchant houses.'},{speaker:'Mira',text:'You’re either brave or foolish. I’m Mira. And you’re not the only one who’s noticed the ledger discrepancies.'},{speaker:'Narrator',text:'They see guards arrest a merchant for false certification. Mira notices familiar geometry in the confiscated crystals.'},{speaker:'Narrator',text:'Mira’s workshop offers cover for an experiment. Her reputation for unusual mounting designs draws no suspicion.'}],
    question:'What changes when the mounting is brought into the water channel’s influence?',
    staging:'Compare the same crystal and mounting in two positions. Moving the mounting changes its relationship with the channel; it does not change the crystal.'},
  7:{title:'The Interpreter',location:'Mira’s workshop',portrait:'15C_Kai.webp',source:'Season 1 V4 · episode 7',adaptationNote:'The side-by-side record viewer is interpretive staging. The source establishes a correspondence between mounting harmonics and the temple bell tower, with stronger patterns during astronomical alignments.',
    intro:[{speaker:'Narrator',text:'A crystal worker arrives at Mira’s workshop: Kai, a communications expert.'},{speaker:'Kai',text:'The harmonics in your mounting designs, they match frequencies I’ve detected in the temple’s bell tower.'},{speaker:'Narrator',text:'Kai has mapped resonance patterns through the city and recorded them under different astronomical conditions.'}],
    question:'What relationship survives across the two records, and when is it stronger?',
    staging:'Compare Kai’s two source records under ordinary observations and the recorded alignment. The marks are an illustrative visual representation, not a new numerical measurement.'}
});
export const arc67VoiceCues=Object.freeze({
  6:[{speaker:'Narrator',text:arc67Meta[6].intro[0].text,picture:'merchant quarter',mix:'quiet water and street bed; duck under speech'},{speaker:'Mira',text:arc67Meta[6].intro[1].text,picture:'15B_Mira.webp',mix:'hold for character; no fake voice claim'},{speaker:'Narrator',text:arc67Meta[6].intro[2].text,picture:'workshop',mix:'fade toward intimate workshop ambience'}],
  7:[{speaker:'Narrator',text:arc67Meta[7].intro[0].text,picture:'workshop doorway',mix:'soft material movement and room tone'},{speaker:'Kai',text:arc67Meta[7].intro[1].text,picture:'15C_Kai.webp',mix:'duck bed and allow the line to breathe'},{speaker:'Narrator',text:arc67Meta[7].intro[2].text,picture:'charts and skyline',mix:'subtle distant bell, then silence'}]
});
const validChapter=c=>c===6||c===7;
const base=c=>({version:1,chapter:c,setup:null,observations:{isolated:false,coupled:false,mountOrdinary:false,mountAligned:false,bellAligned:false},conclusion:null,solved:false,feedback:'',hintLevel:0});
export function fresh67(chapter=6){return base(validChapter(chapter)?chapter:6);}
export function restore67(raw){
 try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1||!validChapter(s.chapter)||!s.observations||typeof s.observations!=='object')return fresh67();
  const r=base(s.chapter);for(const key of Object.keys(r.observations))r.observations[key]=s.observations[key]===true;
  if(s.chapter===6&&['isolated','coupled'].includes(s.setup))r.setup=s.setup;
  if(s.chapter===7&&['ordinary','aligned'].includes(s.setup))r.setup=s.setup;
  const accepted=s.chapter===6?'mount-channel':'shared-alignment';
  const enough=s.chapter===6?r.observations.isolated&&r.observations.coupled:r.observations.mountOrdinary&&r.observations.mountAligned&&r.observations.bellAligned;
  r.solved=s.solved===true&&s.conclusion===accepted&&enough;r.conclusion=r.solved?accepted:null;r.hintLevel=Number.isInteger(s.hintLevel)?Math.max(0,Math.min(3,s.hintLevel)):0;return r;
 }catch{return fresh67();}
}
const observations6={isolated:'Away from the channel, the mounting brings the internal geometry into view. The crystal is the same one in both positions.',coupled:'At the channel, the mounted crystal’s lines become more distinct as nearby water moves. The placement changed; the specimen did not.'};
const observations7={mountOrdinary:'Workshop record, ordinary observation: the mounting leaves a distinctive paired rhythm at a quieter intensity.',mountAligned:'Workshop record, recorded alignment: the same paired rhythm is stronger.',bellAligned:'Temple record, recorded alignment: the bell-tower trace has a paired rhythm.'};
/** Returns a fresh state; invalid or premature actions never manufacture progress. */
export function act67(previous,action){
 const s=restore67(previous);if(!action||typeof action.type!=='string')return s;
 if(s.solved){if(action.type==='advance'&&s.chapter===6)return fresh67(7);return s;}
 if(action.type==='hint'){s.hintLevel=Math.min(3,s.hintLevel+1);s.feedback=(s.chapter===6?['Keep the crystal fixed while you change its position.','Compare the same mounting away from and beside the water.','The channel relationship—not a different specimen—is the important change.']:['Compare what repeats in the two sources.','Compare the mounting’s ordinary record with its aligned record.','The pattern is shared, and the records say it grows stronger at alignment.'])[s.hintLevel-1];return s;}
 if(s.chapter===6){
  if(action.type==='place'&&['isolated','coupled'].includes(action.position)){s.setup=action.position;s.feedback=action.position==='isolated'?'Mounting positioned away from the channel.':'Mounting positioned beside the water channel.';return s;}
  if(action.type==='observe'){if(!s.setup){s.feedback='Place the mounting in a position before observing it.';return s;}s.observations[s.setup]=true;s.feedback=observations6[s.setup];return s;}
  if(action.type==='conclude'){
   if(!s.observations.isolated||!s.observations.coupled){s.feedback='Compare the mounting in both positions before drawing a conclusion.';return s;}
   if(action.choice==='mount-channel'){s.solved=true;s.conclusion='mount-channel';s.feedback='Mira’s mounting reveals how the crystal patterns interact with the city’s water channels.';}
   else s.feedback='That conclusion is not supported by the two observations. The crystal stayed the same while its position relative to the channel changed.';return s;
  }
 }else{
  if(action.type==='condition'&&['ordinary','aligned'].includes(action.condition)){s.setup=action.condition;s.feedback=action.condition==='ordinary'?'Ordinary observation selected.':'Recorded astronomical alignment selected.';return s;}
  if(action.type==='read'){
   if(!s.setup){s.feedback='Choose which observation record to examine.';return s;}
   const key=action.source==='mount'?(s.setup==='aligned'?'mountAligned':'mountOrdinary'):action.source==='bell'&&s.setup==='aligned'?'bellAligned':null;
   if(!key){s.feedback='That record is not part of this comparison. Try the mounting records and the aligned bell-tower record.';return s;}
   s.observations[key]=true;s.feedback=observations7[key];return s;
  }
  if(action.type==='conclude'){
   if(!s.observations.mountOrdinary||!s.observations.mountAligned||!s.observations.bellAligned){s.feedback='Compare both mounting conditions and the aligned bell record before concluding.';return s;}
   if(action.choice==='shared-alignment'){s.solved=true;s.conclusion='shared-alignment';s.feedback='The mounting and bell records share a pattern, and the mounting record strengthens during the documented alignment.';}
   else s.feedback='That claim does not fit the records. Compare the recurring rhythm and the change between the two conditions.';return s;
  }
 }
 return s;
}
/** Presentable affordances and current evidence; the game must render actual locations. */
export function view67(state){
 const s=restore67(state),observations=s.chapter===6?observations6:observations7;
 return {chapter:s.chapter,...arc67Meta[s.chapter],setup:s.setup,evidence:Object.entries(observations).filter(([k])=>s.observations[k]).map(([key,text])=>({key,text})),solved:s.solved,conclusion:s.conclusion,hintLevel:s.hintLevel};
}

/** Declarative, stable room affordances for the shared HUD. Coordinates are
 * logical room-space staging and may be rebound by the authored room layout. */
export const arc67Scenes=[
 {episode:6,id:'mira-mounting',roomId:'mira-workshop',title:arc67Meta[6].title,place:arc67Meta[6].location,objective:arc67Meta[6].question,source:arc67Meta[6].source,adaptationNote:arc67Meta[6].adaptationNote,start:{x:4.5,y:6,angle:-Math.PI/2},portrait:arc67Meta[6].portrait,intro:arc67Meta[6].intro,
  outro:[{speaker:'Narrator',text:'Mira’s mounting reveals that the crystal patterns interact with the city’s water channels.'}],
  objects:[
   {id:'mounting',label:'Mira’s mounting',x:3.4,y:3,description:'Observe the same crystal and mount away from the channel.',choices:[{id:'isolated',label:'Observe away from water'}]},
   {id:'channel',label:'Water-channel station',x:6.6,y:2,description:'Move the mounting into the channel’s influence and observe.',choices:[{id:'coupled',label:'Observe beside the channel'}]},
   {id:'mount-notebook',label:'Experiment notes',x:2,y:4.4,description:'Compare the observations and decide what they support.',choices:[{id:'mount-channel',label:'The mounting reveals a relationship with the water channel'},{id:'different-stone',label:'The change proves the two tests used different crystals'},{id:'all-dangerous',label:'The change proves every patterned crystal is dangerous'}]}
  ],hints:['Keep the crystal fixed while you change its position.','Compare the same mounting away from and beside the water.','The channel relationship—not a different specimen—is the important change.']},
 {episode:7,id:'kai-comparison',roomId:'mira-workshop',title:arc67Meta[7].title,place:arc67Meta[7].location,objective:arc67Meta[7].question,source:arc67Meta[7].source,adaptationNote:arc67Meta[7].adaptationNote,start:{x:4.5,y:6,angle:-Math.PI/2},portrait:arc67Meta[7].portrait,intro:arc67Meta[7].intro,
  outro:[{speaker:'Narrator',text:'The temple observations preserve precise conditions that affect crystal behavior. Their collaboration, however, draws growing attention.'}],
  objects:[
   {id:'workshop-record',label:'Mounting records',x:2,y:4.4,description:'Compare the mounting record at two documented conditions.',choices:[{id:'ordinary',label:'Read the ordinary observation'},{id:'aligned',label:'Read the recorded alignment'}]},
   {id:'bell-record',label:'Bell-tower record',x:5.8,y:5.4,description:'Examine Kai’s temple observation from the recorded alignment.',choices:[{id:'bell-aligned',label:'Read the aligned bell record'}]},
   {id:'kai-notebook',label:'Kai’s comparison',x:3.4,y:3,description:'Consider what the records establish together.',choices:[{id:'shared-alignment',label:'The records share a pattern, stronger during the alignment'},{id:'unrelated',label:'The records show unrelated patterns'},{id:'unchanged',label:'The mounting pattern never changes with conditions'}]}
  ],hints:['Compare what repeats in the two sources.','Compare the mounting’s ordinary record with its aligned record.','The pattern is shared, and the records say it grows stronger at alignment.']}
];
/** Same return envelope as Episodes 3–5; unknown objects and choices are inert. */
export function arc67Act(previous,action){
 let before=restore67(previous),next=before;
 if(action?.type==='interact'){
  const key=`${action.id}:${action.choice}`;
  const mappings={
   'mounting:isolated':[{type:'place',position:'isolated'},{type:'observe'}],
   'channel:coupled':[{type:'place',position:'coupled'},{type:'observe'}],
   'mount-notebook:mount-channel':[{type:'conclude',choice:'mount-channel'}],
   'mount-notebook:different-stone':[{type:'conclude',choice:'different-stone'}],
   'mount-notebook:all-dangerous':[{type:'conclude',choice:'all-dangerous'}],
   'workshop-record:ordinary':[{type:'condition',condition:'ordinary'},{type:'read',source:'mount'}],
   'workshop-record:aligned':[{type:'condition',condition:'aligned'},{type:'read',source:'mount'}],
   'bell-record:bell-aligned':[{type:'condition',condition:'aligned'},{type:'read',source:'bell'}],
   'kai-notebook:shared-alignment':[{type:'conclude',choice:'shared-alignment'}],
   'kai-notebook:unrelated':[{type:'conclude',choice:'unrelated'}],
   'kai-notebook:unchanged':[{type:'conclude',choice:'unchanged'}]
  };
  const scene=arc67Scenes.find(x=>x.episode===before.chapter),item=scene.objects.find(x=>x.id===action.id);
  if(item?.choices.some(c=>c.id===action.choice))for(const step of mappings[key]||[])next=act67(next,step);
 }else if(action?.type==='hint'||action?.type==='advance')next=act67(before,action);
 const changed=JSON.stringify({...before,feedback:''})!==JSON.stringify({...next,feedback:''});
 return {state:next,message:next.feedback,changed,complete:next.solved};
}
