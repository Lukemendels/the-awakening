// The dashed sketch and solid mineral veins use the same geometry at every scale.
function mark(c,x,y,r,angle,ink,dashed=false){
  c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle=ink;c.lineWidth=2.8;
  c.setLineDash(dashed?[4,4]:[]);c.beginPath();c.arc(0,0,r,-.26,Math.PI*2-.83);c.stroke();
  c.beginPath();c.moveTo(-r*.58,r*.78);c.lineTo(0,0);c.lineTo(-r*.18,-r*.89);
  c.moveTo(0,0);c.lineTo(r*.64,r*.38);c.stroke();c.restore();
}
export function illustration(state,kind){
  const canvas=document.createElement('canvas');canvas.className='stage';
  canvas.width=900;canvas.height=320;canvas.setAttribute('role','img');
  const c=canvas.getContext('2d');c.scale(2,2);
  const light=['front','side','back'][state.lamp],visible=state.tray&&state.specimen==='condemned'&&state.lamp===2;
  const sketchOnly=kind==='sketch',journal=kind==='journal';
  const text=(label,x,y)=>{c.fillStyle='#f2dfb5';c.font='13px system-ui';c.textAlign='center';c.fillText(label,x,y);};
  canvas.setAttribute('aria-label',sketchOnly?'Temple sketch. A ring opens at the upper right with three branches inside.':
    'Lamp at '+light+'. '+(state.tray?(visible?'Three veins and a broken ring appear inside the stone.':'The interior shows no clear pattern.'):'The specimen rest is empty.')+
    (state.sketch?' The sketch has a gap at the upper right.':'')+(visible&&state.sketch?(state.turn===0?' Both gaps coincide.':' The two gaps point in different directions.'):''));
  if(sketchOnly){mark(c,225,76,49,0,'#dfc698');text('Temple floor · Kaelan’s sketch',225,149);return canvas;}
  const sx=300,sy=74;
  if(state.sketch){mark(c,99,sy,39,0,'#e5cc9f',true);text('Temple sketch',99,149);}
  if(!state.tray){text('Empty specimen rest',sx,149);return canvas;}
  if(!journal){
    const lampX=[391,374,sx][state.lamp],lampY=[118,52,24][state.lamp];
    const glow=c.createRadialGradient(lampX,lampY,3,lampX,lampY,70);glow.addColorStop(0,'#ffd384bb');glow.addColorStop(1,'#eac17600');
    c.fillStyle=glow;c.fillRect(lampX-70,lampY-70,140,140);c.fillStyle='#ffe0a2';c.beginPath();c.arc(lampX,lampY,5,0,Math.PI*2);c.fill();
  }
  const gem=c.createLinearGradient(sx-45,20,sx+38,118);gem.addColorStop(0,'#8bbfca');gem.addColorStop(.43,'#254e59');gem.addColorStop(1,'#9fd1c7');
  c.fillStyle=gem;c.strokeStyle='#b3e6db';c.lineWidth=2;c.beginPath();
  for(const [index,[dx,dy]] of [[-47,-12],[-26,-51],[17,-54],[48,-17],[35,32],[-8,54],[-43,23]].entries()){
    if(index===0)c.moveTo(sx+dx,sy+dy);else c.lineTo(sx+dx,sy+dy);
  }
  c.closePath();c.fill();c.stroke();
  if(visible)mark(c,sx,sy,33,state.turn*Math.PI/6,'#bffff9');
  if(state.sketch&&visible)mark(c,sx,sy,39,0,'#fbd38c',true);
  text(state.specimen==='condemned'?'Condemned specimen':'Approved specimen',sx,149);
  return canvas;
}
