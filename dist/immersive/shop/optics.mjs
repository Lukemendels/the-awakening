import {projection,sunsetAngle,crystalAngle} from './investigation.mjs';

function line(c,points,color,width=1){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function glow(c,x,y,r,color){
  const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');
  c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);
}
export function illustration(state,kind='bench',beat=0,canvas=document.createElement('canvas')){
  canvas.className='stage';
  if(canvas.width!==1100){canvas.width=1100;canvas.height=440;}
  canvas.setAttribute('role','img');
  const c=canvas.getContext('2d');c.setTransform(2,0,0,2,0,0);c.lineJoin='round';c.lineCap='round';
  const paper=c.createLinearGradient(0,0,550,220);
  paper.addColorStop(0,'#947a54');paper.addColorStop(.42,'#ddcda8');paper.addColorStop(1,'#b29c74');
  c.fillStyle=state.sketch||kind==='sketch'?paper:'#584634';c.fillRect(0,0,550,220);
  const label=(s,x,y,size=12,col='#423e30')=>{c.fillStyle=col;c.font='italic '+size+'px Georgia';c.fillText(s,x,y);};
  const cx=230,cy=100,mx=430,my=86;
  const lampPoint=a=>[46,92+a*1.65];
  function marker(){
    c.save();c.translate(mx,my);c.rotate(Math.PI/4);c.fillStyle='#977132';c.fillRect(-7,-7,14,14);
    c.strokeStyle='#f8dfa3';c.strokeRect(-5,-5,10,10);c.restore();
  }
  if(state.sketch||kind==='sketch'){
    c.strokeStyle='#796f5555';c.strokeRect(15,13,520,193);c.strokeRect(18,16,514,187);
    const sun=lampPoint(sunsetAngle);
    c.setLineDash([7,6]);line(c,[sun,[cx,cy],[mx,my]],'#6a604a',1.4);c.setLineDash([]);
    line(c,[[cx-23,cy+17],[cx-16,cy+29],[cx+17,cy+29],[cx+24,cy+17]],'#5b5948',2);
    marker();label('Brass inlay',mx-15,my-24,16);label('Last sunlight',30,189,16);
    label('Equinox • temple steps',340,192,17);
  }
  if(kind==='sketch'){
    const t=Math.min(1,beat);
    line(c,[lampPoint(sunsetAngle),[cx,cy],[mx,my+40*(1-t)]],'#fff4c4',3);
    glow(c,mx,my+40*(1-t),14,'#fff7c8');label('Crystal stand',cx-30,152,15);
    canvas.setAttribute('aria-label','Kaelan’s field sketch. Low evening sun strikes the stand from the lower left. Turning the crystal brings the spot onto the brass floor inlay.');
    return canvas;
  }
  const lamp=lampPoint(state.lamp);
  glow(c,...lamp,31,'#ffe8a2');line(c,[lamp,[cx,cy]],'#fff0bead',4);
  c.fillStyle='#795c36';c.fillRect(lamp[0]-14,lamp[1]+5,28,6);glow(c,...lamp,10,'#fffbea');
  const optics=projection(state);let desc='The specimen rest is empty.';
  if(state.tray){
    c.save();c.translate(cx,cy);c.rotate(state.turn*Math.PI/370);
    const outline=[[-52,-8],[-35,-45],[-7,-56],[37,-33],[54,0],[26,46],[-11,53],[-42,28]];
    c.beginPath();outline.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
    const stone=c.createLinearGradient(-40,-35,46,52);stone.addColorStop(0,'#29484b');stone.addColorStop(.35,'#a0cfce');stone.addColorStop(.58,'#638e91');stone.addColorStop(1,'#254c55');
    c.fillStyle=stone;c.fill();c.strokeStyle='#e4f6e9';c.lineWidth=2;c.stroke();c.clip();
    for(const [x,y] of outline)line(c,[[x,y],[x*.63-5,y*.64+1],[5,-13]],'#e0ffff45');
    if(!optics.diffuse){
      const cloud=c.createRadialGradient(-3,0,1,-3,0,38);cloud.addColorStop(0,'#f4f1e8ac');cloud.addColorStop(1,'transparent');
      c.save();c.rotate(-.62);c.scale(1,.32+Math.abs(state.turn-crystalAngle)/180);c.fillStyle=cloud;c.fillRect(-45,-44,88,88);c.restore();
      const shimmer=optics.visible?'#f0ffeb':'#e4e4dcc0';
      line(c,[[-31,20],[-17,12],[-13,6],[0,3],[11,-7],[21,-11]],shimmer,1.6);
      line(c,[[-27,23],[-14,15],[-9,9],[3,7],[12,-4]],shimmer,1.1);
      line(c,[[7,5],[17,0],[19,-7],[33,-17]],shimmer,1.5);
      line(c,[[-11,8],[-5,14],[11,15]],'#f5efdb9c',.9);
      for(let i=0;i<8;i++){
        const x=-22+i*4.1,y=15-i*2.3;
        line(c,[[x-3,y+1],[x+2,y-2],[x+6+(i%3),y-9-(i%4)]],'#e6f5e3a8',.65);
      }
      if(beat>0)glow(c,-29+Math.min(1,beat)*59,17-Math.min(1,beat)*31,16,'#edffe1');
    }
    c.restore();
    if(optics.diffuse){
      c.save();c.translate(mx,my+optics.offset*.4);c.scale(2.5,.47);glow(c,0,0,22,'#fff9ce');c.restore();desc='The approved stone throws a broad patch of light.';
    }else if(optics.visible){
      const y=my+optics.offset;
      for(const sign of [-1,1]){
        const end=y+sign*optics.split;
        line(c,[[cx+42,cy+sign*5],[mx,end]],'#fff7d76b',5);
        line(c,[[cx+42,cy+sign*5],[mx,end]],'#ffffe8',1.6);
        glow(c,mx,end,9,'#fffbd9');
      }
      for(let i=0;i<8;i++){
        const x=-22+i*4.1,y=15-i*2.3;
        line(c,[[x-3,y+1],[x+2,y-2],[x+6+(i%3),y-9-(i%4)]],'#e6f5e3a8',.65);
      }
      if(beat>0)glow(c,mx,my,15+beat*16,'#feffcd');
      desc=optics.aligned?'The two streaks converge on the brass inlay.':'Two narrow streaks travel across the paper.';
    }else desc='A milky feather glints under the surface.';

  }
  canvas.setAttribute('aria-label',desc);return canvas;
}
