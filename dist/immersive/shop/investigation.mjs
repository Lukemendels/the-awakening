export const sunsetAngle=26;
export const assignment='Which crate should Father hold back from the disposal barge?';
export const sketchNote='First notch: the fork met the round stud. One notch clockwise: it met the square stud.';
export const packets=['A','B','C'];
// A sample ticket carries the stamp and edge cuts from its parent crate.
export const manifest=[
  {crate:'14',stamp:'Heron',cuts:2},
  {crate:'08',stamp:'Heron',cuts:1},
  {crate:'23',stamp:'Reed',cuts:2}
];
const orders=['012','021','102','120','201','210'];
// Matching pair, stationary reflection, and a fork that starts on the square.
const tracks=[['round','square'],['round','round'],['square','square']];
export const hasStone=s=>s.tray||s.drawerStone;
export function fresh(){
  return {phase:'shop',shot:0,sketch:false,tray:false,drawerStone:false,active:null,
    order:orders[Math.floor(Math.random()*orders.length)],packet:'A',notch:0,book:false,tracings:{},held:null};
}
export const ticket=packet=>manifest[packets.indexOf(packet)];
export const marks=entry=>entry.stamp+' · '+entry.cuts+(entry.cuts===1?' edge cut':' edge cuts');
export function reading(s,packet=s.packet,notch=s.notch){
  return tracks[Number(s.order[packets.indexOf(packet)])][notch];
}
export function restore(raw,flags={}){
  const s=fresh();
  s.sketch=raw?.sketch===true||flags.notebook===true;
  s.tray=raw?.tray===true||Boolean(flags.specimen);
  if(!raw){
    if(flags.solved)Object.assign(s,{sketch:true,tray:true,phase:'film',shot:2});
    return s;
  }
  s.drawerStone=raw.drawerStone===true;
  if(Number.isInteger(raw.shot)&&raw.shot>=0&&raw.shot<5)s.shot=raw.shot;
  if(['notebook','shelf','bench','journal','drawer'].includes(raw.active))s.active=raw.active;
  if(orders.includes(raw.order)){
    s.order=raw.order;
    s.book=raw.book===true;
    if(packets.includes(raw.packet))s.packet=raw.packet;
    if(raw.notch===1)s.notch=1;
    for(const packet of packets){
      const mask=raw.tracings?.[packet];
      if(Number.isInteger(mask)&&mask>0&&mask<=3)s.tracings[packet]=mask;
    }
    if(raw.held===ticket(s.packet).crate&&s.tracings[s.packet]===3&&reading(s,s.packet,0)==='round'&&reading(s,s.packet,1)==='square')s.held=raw.held;
  }
  // A player already beyond the earlier two-sample puzzle keeps that checkpoint.
  if(['dock','film'].includes(raw.phase)&&s.sketch&&hasStone(s))s.phase=raw.phase;
  return s;
}
export function trace(s){
  if(s.phase!=='shop'||!s.sketch||!hasStone(s))return false;
  s.tracings[s.packet]=(s.tracings[s.packet]||0)|(1<<s.notch);
  return true;
}
export function holdCrate(s,crate){
  if(s.phase!=='shop'||!s.sketch||!hasStone(s)||s.tracings[s.packet]!==3)return 'missing';
  if(reading(s,s.packet,0)!=='round')return 'first';
  if(reading(s,s.packet,1)!=='square')return 'turn';
  if(crate!==ticket(s.packet).crate)return 'ticket';
  Object.assign(s,{phase:'film',shot:0,active:null,notch:1,held:crate});
  return 'held';
}
