export const sunsetAngle = 26;
export const crystalAngle = -18;
export const fresh = () => ({
  phase:'shop', shot:0, sketch:false, tray:false, drawerStone:false, specimen:'condemned',
  lamp:-30, turn:16, hints:0, clearSeen:false, active:null
});

export const hasStone = s => s.tray || s.drawerStone;

export function restore(raw,flags={}) {
  const state=fresh();
  state.sketch=raw?.sketch===true || flags.notebook===true;
  state.tray=raw?.tray===true || Boolean(flags.specimen);
  if(!raw){
    if(flags.solved)Object.assign(state,{sketch:true,tray:true,phase:'film',shot:2});
    return state;
  }
  for(const [key,min,max] of [['lamp',-45,45],['turn',-60,60],['hints',0,3],['shot',0,4]]){
    if(Number.isInteger(raw[key]) && raw[key]>=min && raw[key]<=max)state[key]=raw[key];
  }
  state.drawerStone=raw.drawerStone===true;
  if(raw.specimen==='approved' && state.tray)state.specimen='approved';
  state.clearSeen=raw.clearSeen===true;
  if(['notebook','shelf','bench','journal','drawer'].includes(raw.active))state.active=raw.active;
  if(['film','dock'].includes(raw.phase) && hasStone(state) && state.sketch)state.phase=raw.phase;
  return state;
}

// These values drive both the drawn streaks and the generous capture area.
export function projection(s){
  const tilt=s.turn-crystalAngle, light=s.lamp-sunsetAngle;
  const split=Math.abs(tilt)*.95;
  return {
    diffuse:s.specimen==='approved',
    visible:Math.abs(light)<28,
    offset:light*1.2+tilt*.28,
    split,
    aligned:hasStone(s) && s.sketch && s.specimen==='condemned' &&
      Math.abs(light)<=5 && Math.abs(tilt)<=5
  };
}
export function expose(s){
  if(s.phase!=='shop'||!hasStone(s))return false;
  if(s.specimen==='approved')s.clearSeen=true;
  if(!projection(s).aligned)return false;
  Object.assign(s,{phase:'film',shot:0,active:null,lamp:sunsetAngle,turn:crystalAngle});
  return true;
}
