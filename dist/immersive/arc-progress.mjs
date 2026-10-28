import {arc35Scenes,freshArc35,restoreArc35,arc35Act} from './arc35.mjs';
import {arc67Scenes,fresh67,restore67,arc67Act} from './arc67.mjs';
const scenes=[...arc35Scenes,...arc67Scenes];
export const sceneFor=arc=>scenes.find(s=>s.episode===arc?.episode)||null;
export const freshArc=()=>({version:1,episode:3,phase:'intro',clip:0,story35:freshArc35(),story67:null,mount:'isolated'});
export function canResumeArc(raw){
 if(!raw||raw.version!==1||![3,4,5,6,7].includes(raw.episode)||!['intro','room','outro','done'].includes(raw.phase))return false;
 if(Object.keys(raw).some(k=>!['version','episode','phase','clip','story35','story67','mount'].includes(k)))return false;
 const d=raw.story35;if(!d||d.version!==1||!d.flags||typeof d.flags!=='object'||Array.isArray(d.flags)||!Array.isArray(d.journal)||!d.journal.every(x=>typeof x==='string')||d.episode!==(raw.episode<=5?raw.episode:6))return false;
 if(Object.keys(d).some(k=>!['version','episode','flags','journal','hints'].includes(k))||d.journal.length>8||!d.hints||typeof d.hints!=='object'||Array.isArray(d.hints)||Object.entries(d.hints).some(([k,v])=>!['3','4','5'].includes(k)||!Number.isInteger(v)||v<1||v>3))return false;
 if(raw.episode<=5&&raw.story67!==null)return false;
 if(!Number.isInteger(raw.clip)||raw.clip<0||!['isolated','carried','coupled'].includes(raw.mount))return false;
 if(raw.episode>=6){const e=raw.story67;if(!e||e.version!==1||e.chapter!==raw.episode||!e.observations||typeof e.observations!=='object'||Array.isArray(e.observations))return false;
  const allowed=['version','chapter','setup','observations','conclusion','solved','feedback','hintLevel'];if(Object.keys(e).some(k=>!allowed.includes(k)))return false;
  const keys=['isolated','coupled','mountOrdinary','mountAligned','bellAligned'];if(Object.keys(e.observations).length!==keys.length||keys.some(k=>typeof e.observations[k]!=='boolean'))return false;
  if(e.setup!==null&&!(e.chapter===6?['isolated','coupled']:['ordinary','aligned']).includes(e.setup))return false;
  if(typeof e.solved!=='boolean'||typeof e.feedback!=='string'||!Number.isInteger(e.hintLevel)||e.hintLevel<0||e.hintLevel>3)return false;
  const cleaned=restore67(e);if(e.solved!==cleaned.solved||e.conclusion!==cleaned.conclusion)return false;
 }
 const cleaned35=restoreArc35(d);const pairs=o=>Object.entries(o).sort(([a],[b])=>a.localeCompare(b));if(JSON.stringify(pairs(d.flags))!==JSON.stringify(pairs(cleaned35.flags)))return false;
 const normalized=restoreArc(raw);if(normalized.episode!==raw.episode||normalized.phase!==raw.phase||normalized.clip!==raw.clip)return false;
 return true;
}
export function restoreArc(raw){
 if(!raw||raw.version!==1||![3,4,5,6,7].includes(raw.episode)||!['intro','room','outro','done'].includes(raw.phase))return freshArc();
 const a35=restoreArc35(raw.story35),a67=raw.story67?restore67(raw.story67):null;if(a67&&typeof raw.story67.feedback==='string')a67.feedback=raw.story67.feedback;
 if((raw.episode<=5&&a35.episode!==raw.episode)||(raw.episode>=6&&(a35.episode!==6||!a67||a67.chapter!==raw.episode)))return freshArc();
 const scene=scenes.find(s=>s.episode===raw.episode),max=Math.max(0,(raw.phase==='outro'?scene.outro:scene.intro).length-1);
 const result={version:1,episode:raw.episode,phase:raw.phase,clip:Number.isInteger(raw.clip)?Math.max(0,Math.min(max,raw.clip)):0,story35:a35,story67:a67,mount:['isolated','carried','coupled'].includes(raw.mount)?raw.mount:'isolated'};
 const solved=result.episode<=5?arc35Act(result.story35,{type:'status'}).complete:result.story67.solved;
 if((result.phase==='outro'||result.phase==='done')&&!solved){result.phase='room';result.clip=0;}
 if(result.phase==='done'&&result.episode!==7){result.phase='room';result.clip=0;}
 return result;
}
export function arcAction(raw,action){
 const arc=restoreArc(raw);if(arc.phase!=='room')return {arc,message:'',complete:false,changed:false};
 const result=arc.episode<=5?arc35Act(arc.story35,action):arc67Act(arc.story67,action);
 if(arc.episode<=5)arc.story35=result.state;else arc.story67=result.state;
 return {arc,message:result.message,complete:result.complete,changed:result.changed};
}
export function isComplete(raw){const arc=restoreArc(raw);return arc.episode<=5?arc35Act(arc.story35,{type:'status'}).complete:arc.story67.solved;}
export function beginOutro(raw){const arc=restoreArc(raw);if(!isComplete(arc))return arc;arc.phase='outro';arc.clip=0;return arc;}
export function advanceArc(raw){const arc=restoreArc(raw);if(arc.phase!=='outro'||!isComplete(arc))return arc;
 if(arc.episode<=5){const r=arc35Act(arc.story35,{type:'advance'});arc.story35=r.state;arc.episode=r.state.episode;if(arc.episode===6)arc.story67=fresh67(6);}
 else if(arc.episode===6){arc.story67=arc67Act(arc.story67,{type:'advance'}).state;arc.episode=7;}
 else{arc.phase='done';arc.clip=0;return arc;}
 arc.phase='intro';arc.clip=0;arc.mount='isolated';return arc;
}
