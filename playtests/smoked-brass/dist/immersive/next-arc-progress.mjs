import {arc810Scenes,fresh810,canResume810,restore810,arc810Act} from './arc810.mjs';
import {arc1113Scenes,freshArc1113,canResumeArc1113,restoreArc1113,arc1113Act} from './arc1113.mjs';
const scenes=[...arc810Scenes,...arc1113Scenes];
export const nextSceneFor=p=>scenes.find(s=>s.episode===p?.episode)||null;
export const freshNextArc=()=>({version:1,episode:8,phase:'intro',clip:0,story810:fresh810(),story1113:null});
export function canResumeNextArc(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1||![8,9,10,11,12,13].includes(raw.episode)||!['intro','room','outro','done'].includes(raw.phase)||!Number.isInteger(raw.clip)||raw.clip<0)return false;
 if(Object.keys(raw).some(k=>!['version','episode','phase','clip','story810','story1113'].includes(k))||!canResume810(raw.story810))return false;
 if(raw.story810.episode!==(raw.episode<=10?raw.episode:11))return false;
 if(raw.episode<=10&&raw.story1113!==null)return false;
 if(raw.episode>=11&&(!canResumeArc1113(raw.story1113)||raw.story1113.episode!==(raw.phase==='done'&&raw.episode===13?14:raw.episode)))return false;
 const scene=nextSceneFor(raw),clips=raw.phase==='outro'?scene.outro:scene.intro,max=Math.max(0,clips.length-1);if(raw.clip>max)return false;
 const solved=raw.episode<=10?arc810Act(raw.story810,{type:'status'}).complete:raw.phase==='done'?true:arc1113Act(raw.story1113,{type:'status'}).complete;
 if((raw.phase==='outro'||raw.phase==='done')&&!solved)return false;
 if(raw.phase==='done'&&raw.episode!==13)return false;
 return true;
}
/** Call only after canResumeNextArc; never use this to overwrite malformed data. */
export function restoreNextArc(raw){if(!canResumeNextArc(raw))return null;return {version:1,episode:raw.episode,phase:raw.phase,clip:raw.clip,story810:restore810(raw.story810),story1113:raw.story1113?restoreArc1113(raw.story1113):null};}
export function nextArcAction(raw,action){const p=restoreNextArc(raw);if(!p||p.phase!=='room')return {progress:p,message:'',complete:false,changed:false};const r=p.episode<=10?arc810Act(p.story810,action):arc1113Act(p.story1113,action);if(p.episode<=10)p.story810=r.state;else p.story1113=r.state;return {progress:p,message:r.message,changed:r.changed,complete:r.complete};}
export function nextIsComplete(raw){const p=restoreNextArc(raw);if(!p)return false;return p.phase==='done'||(p.episode<=10?arc810Act(p.story810,{type:'status'}).complete:arc1113Act(p.story1113,{type:'status'}).complete);}
export function beginNextOutro(raw){const p=restoreNextArc(raw);if(!p||p.phase!=='room'||!nextIsComplete(p))return p;p.phase='outro';p.clip=0;return p;}
export function advanceNextArc(raw){const p=restoreNextArc(raw);if(!p||p.phase!=='outro'||!nextIsComplete(p))return p;
 if(p.episode<=10){p.story810=arc810Act(p.story810,{type:'advance'}).state;p.episode=p.story810.episode;if(p.episode===11)p.story1113=freshArc1113();}
 else{p.story1113=arc1113Act(p.story1113,{type:'advance'}).state;if(p.episode===13){p.phase='done';p.clip=0;return p;}p.episode=p.story1113.episode;}
 p.phase='intro';p.clip=0;return p;
}
