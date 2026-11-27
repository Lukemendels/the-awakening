/** V2 is deliberately separate from the original awakening-v4 save. */
export const SAVE_KEY='awakening-immersive-opening-v1';
const requestedRun=new URLSearchParams(globalThis.location?.search||'').get('run');
const runKeys={'season-one':'season-one-review',workshop:'workshop-investigation','lot-vii':'lot-vii-inquiry','smoked-brass':'smoked-brass','first-light':'first-light'};
export const playtestRun=Object.hasOwn(runKeys,requestedRun);
const activeKey=playtestRun?SAVE_KEY+'-'+runKeys[requestedRun]:SAVE_KEY;
export function journeyUrl(path){
  if(!playtestRun)return path;
  const url=new URL(path,location.href);url.searchParams.set('run',requestedRun);return url.href;
}
export const freshSave=()=>({version:1,scene:'intro',x:2.5,y:3.5,angle:-Math.PI/2,pitch:0,flags:{},sound:false,narration:false});
export function loadSave(storage){try{const raw=storage.getItem(activeKey);if(!raw)return freshSave();const s=JSON.parse(raw);if(s.version!==1||!['intro','room','complete'].includes(s.scene)||![s.x,s.y,s.angle].every(Number.isFinite)||!s.flags||typeof s.flags!=='object')return freshSave();const flags={...s.flags};if(flags.specimen===true)flags.specimen='condemned';return {...freshSave(),...s,flags};}catch{return freshSave();}}
export function writeSave(storage,save){try{storage.setItem(activeKey,JSON.stringify(save));return true;}catch{return false;}}
