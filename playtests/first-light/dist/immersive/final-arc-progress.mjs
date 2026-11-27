/** Separate nested checkpoint: preserves all earlier journey and source saves. */
import {arc1417Scenes,freshArc1417,canResumeArc1417,restoreArc1417,arc1417Act} from './arc1417.mjs';
import {arc1820Scenes,freshArc1820,canResumeArc1820,restoreArc1820,arc1820Act} from './arc1820.mjs';
import {arc2124Scenes,freshArc2124,canResumeArc2124,restoreArc2124,arc2124Act} from './arc2124.mjs';
const scenes=[...arc1417Scenes,...arc1820Scenes,...arc2124Scenes];
export const finalSceneFor=p=>scenes.find(s=>s.episode===p?.episode)||null;
export const freshFinalArc=()=>({version:1,episode:14,phase:'intro',clip:0,story1417:freshArc1417(),story1820:null,story2124:null});
const group=ep=>ep<=17?'story1417':ep<=20?'story1820':'story2124';
const act=(p,a)=>p.episode<=17?arc1417Act(p.story1417,a):p.episode<=20?arc1820Act(p.story1820,a):arc2124Act(p.story2124,a);
export function canResumeFinalArc(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||p.version!==1||!Number.isInteger(p.episode)||p.episode<14||p.episode>24||!['intro','room','outro','done'].includes(p.phase)||!Number.isInteger(p.clip)||p.clip<0||Object.keys(p).some(k=>!['version','episode','phase','clip','story1417','story1820','story2124'].includes(k)))return false;
 if(!canResumeArc1417(p.story1417)||p.story1417.episode!==(p.episode<=17?p.episode:18))return false;
 if(p.episode<18?p.story1820!==null:!canResumeArc1820(p.story1820)||p.story1820.episode!==(p.episode<=20?p.episode:21))return false;
 if(p.episode<21?p.story2124!==null:!canResumeArc2124(p.story2124)||p.story2124.episode!==(p.phase==='done'?25:p.episode))return false;
 const scene=finalSceneFor(p);if(!scene)return false;const clips=p.phase==='outro'?scene.outro:scene.intro;if(p.clip>Math.max(0,clips.length-1))return false;
 if(p.phase==='done')return p.episode===24&&p.clip===0;
 if(p.phase==='outro'&&!act(p,{type:'status'}).complete)return false;
 return true;
}
export function restoreFinalArc(p){if(!canResumeFinalArc(p))return null;return {...p,story1417:restoreArc1417(p.story1417),story1820:p.story1820?restoreArc1820(p.story1820):null,story2124:p.story2124?restoreArc2124(p.story2124):null};}
export function finalArcAction(raw,action){const p=restoreFinalArc(raw);if(!p||p.phase!=='room')return {progress:p,message:'',changed:false,complete:false};const r=act(p,action);p[group(p.episode)]=r.state;return {progress:p,message:r.message,changed:r.changed,complete:r.complete};}
export function finalIsComplete(raw){const p=restoreFinalArc(raw);return !!p&&(p.phase==='done'||act(p,{type:'status'}).complete);}
export function beginFinalOutro(raw){const p=restoreFinalArc(raw);if(!p||p.phase!=='room'||!finalIsComplete(p))return p;p.phase='outro';p.clip=0;return p;}
export function advanceFinalArc(raw){const p=restoreFinalArc(raw);if(!p||p.phase!=='outro'||!finalIsComplete(p))return p;const key=group(p.episode),r=act(p,{type:'advance'});p[key]=r.state;if(p.episode===24){p.phase='done';p.clip=0;return p;}p.episode++;if(p.episode===18)p.story1820=freshArc1820();if(p.episode===21)p.story2124=freshArc2124();p.phase='intro';p.clip=0;return p;}
