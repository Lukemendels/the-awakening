/** V2 is deliberately separate from the original awakening-v4 save. */
export const SAVE_KEY='awakening-immersive-opening-v1';
export const freshSave=()=>({version:1,scene:'intro',x:2.5,y:3.5,angle:-Math.PI/2,pitch:0,flags:{},sound:false,narration:false});
export function loadSave(storage){try{const raw=storage.getItem(SAVE_KEY);if(!raw)return freshSave();const s=JSON.parse(raw);if(s.version!==1||!['intro','room','complete'].includes(s.scene)||![s.x,s.y,s.angle].every(Number.isFinite)||!s.flags||typeof s.flags!=='object')return freshSave();const flags={...s.flags};if(flags.specimen===true)flags.specimen='condemned';return {...freshSave(),...s,flags};}catch{return freshSave();}}
export function writeSave(storage,save){try{storage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
