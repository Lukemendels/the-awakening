import {hasStone,reading,sunsetAngle} from './investigation.mjs';

const width=900,height=450,stand={x:450,y:270},inlay={x:747,y:211};
const assets={};
let loading;
export function loadBenchArt(){
  if(!loading){
    const sources={plate:'light-bench-plate',lamp:'bench-lamp',rest:'bench-rest',condemned:'bench-quartz'};
    loading=Promise.all(Object.entries(sources).map(([key,name])=>new Promise(resolve=>{
      const image=new Image();
      image.onload=()=>{assets[key]=image;resolve();};
      image.onerror=resolve;
      image.src=new URL('../../assets/generated/'+name+'.webp',import.meta.url).href;
    })));
  }
  return loading;
}
export function lampPosition(angle){
  // The foot follows a shallow arc around the rest, on Kaelan's left.
  const theta=angle*Math.PI/180;
  return {x:stand.x-297*Math.cos(theta),y:stand.y+157*Math.sin(theta)};
}
function stroke(c,points,color,w){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.stroke();
}
function ellipse(c,x,y,rx,ry,color){
  c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function glow(c,x,y,r,color){
  const grad=c.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,color.slice(0,7)+'00');
  c.fillStyle=grad;c.fillRect(x-r,y-r,r*2,r*2);
}
function shadowEnd(angle){
  const p=lampPosition(angle);
  return {x:stand.x+(stand.x-p.x)*.65,y:stand.y+(stand.y-p.y)*.78};
}
function shadow(c,angle,sketch){
  const tip=shadowEnd(angle),dx=tip.x-stand.x,dy=tip.y-stand.y;
  c.save();
  if(sketch){
    c.setLineDash([6,4]);
    stroke(c,[[stand.x,stand.y+4],[tip.x,tip.y+4],[tip.x,tip.y-4],[stand.x,stand.y-16]],'#595343',2);
    c.setLineDash([]);
    for(let i=.24;i<1;i+=.07)stroke(c,[[stand.x+dx*i,stand.y+dy*i-5],[stand.x+dx*i-5,stand.y+dy*i+3]],'#6b614f',1);
    c.font='italic 18px Georgia';c.fillStyle='#62503c';c.fillText('Shadow at sunset',tip.x-62,tip.y-17);
  }else{
    c.filter='blur(1.5px)';
    c.beginPath();c.moveTo(stand.x-16,stand.y-17);c.lineTo(tip.x+3,tip.y-6);c.lineTo(tip.x,tip.y+5);c.lineTo(stand.x-14,stand.y+9);
    c.closePath();c.fillStyle='#46342077';c.fill();
  }
  c.restore();
}
function drawProp(c,image,x,y,w,h,radians=0){
  c.save();c.translate(x,y);c.rotate(radians);
  c.drawImage(image,-w/2,-h,w,h);c.restore();
}
function studs(c,x,y,scale){
  c.save();c.translate(x,y);c.scale(scale,scale);
  c.lineWidth=2;c.strokeStyle='#d5ba7c';
  c.beginPath();c.arc(0,-22,10,0,Math.PI*2);c.stroke();
  c.strokeRect(-9,14,18,18);
  c.restore();
}
function loupe(c,spot){
  const x=744,y=320,r=89,dy=spot==='round'?-22:23;
  c.save();
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='#38352e';c.fill();c.clip();
  studs(c,x+18,y,1.36);
  c.shadowColor='#ffc56c';c.shadowBlur=5;
  for(const sign of [-1,1])stroke(c,[[x-r,y+sign*40],[x+18,y+dy*1.36]],'#fff1b8',3);
  glow(c,x+18,y+dy*1.36,13,'#fff7c5');
  c.restore();c.strokeStyle='#b99856';c.lineWidth=6;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
  c.fillStyle='#453925';c.font='19px Georgia';c.textAlign='center';c.fillText('Through the loupe',x,y+r+25);c.textAlign='start';
}
export function illustration(s,kind='bench',beat=0,canvas=document.createElement('canvas')){
  canvas.className='stage';if(canvas.width!==1350){canvas.width=1350;canvas.height=675;}
  const c=canvas.getContext('2d');c.setTransform(1.5,0,0,1.5,0,0);c.lineCap='round';c.lineJoin='round';
  const sketch=kind==='sketch';
  if(!sketch&&assets.plate){
    const photo=assets.plate,sh=photo.width*height/width;
    c.drawImage(photo,0,(photo.height-sh)*.4,photo.width,sh,0,0,width,height);
  }else{
    const paper=c.createLinearGradient(0,0,width,height);paper.addColorStop(0,'#ad946c');paper.addColorStop(.5,'#e6d5b0');paper.addColorStop(1,'#b89a6c');c.fillStyle=paper;c.fillRect(0,0,width,height);
  }
  if(sketch){
    c.strokeStyle='#877256';c.strokeRect(25,24,850,402);
    c.fillStyle='#493c2c';c.font='italic 26px Georgia';c.fillText('Temple light · My two tracings',64,79);
    for(const [i,label] of ['I · Before the turn','II · One notch clockwise'].entries()){
      const x=88+i*418,y=222;
      c.fillStyle='#555047';c.fillRect(x,y-89,280,160);
      studs(c,x+215,y-2,1.65);
      const tip=y-2+(i?23:-22)*1.65;
      for(const sign of [-1,1])stroke(c,[[x+18,y-6+sign*35],[x+215,tip]],'#f6e1a3',4);
      c.fillStyle='#493c2c';c.font='24px Georgia';c.fillText(label,x,y+117);
    }
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Temple sketch. At notch one the fork meets a round stud. At notch two it meets a square stud.');
    return canvas;
  }
  if(s.sketch)shadow(c,sunsetAngle,true);
  const lamp=lampPosition(sunsetAngle);
  glow(c,lamp.x+12,lamp.y-85,160,'#ffb94f39');
  shadow(c,sunsetAngle,false);
  ellipse(c,stand.x+4,stand.y+5,63,13,'#47311f52');
  const brass=c.createLinearGradient(stand.x-50,0,stand.x+50,0);brass.addColorStop(0,'#46341f');brass.addColorStop(.23,'#b68a45');brass.addColorStop(.43,'#e4c482');brass.addColorStop(.74,'#77542f');brass.addColorStop(1,'#38291b');
  if(assets.rest)drawProp(c,assets.rest,stand.x,stand.y+3,153,82);
  else ellipse(c,stand.x,stand.y,55,12,brass);
  if(hasStone(s)){
    const endpoint=inlay.y+(reading(s)==='round'?-21:22);
    c.save();studs(c,inlay.x,inlay.y,1);
    c.globalCompositeOperation='screen';c.shadowColor='#ffe7aa';c.shadowBlur=6;
    for(const sign of [-1,1])stroke(c,[[stand.x+54,stand.y-62+sign*19],[inlay.x,endpoint]],'#fff3b4',3.5);
    glow(c,inlay.x,endpoint,13,'#fff5c2');c.restore();
    const photo=assets.condemned,rotation=s.notch*.28;
    if(photo){
      c.save();c.translate(stand.x,stand.y-66);c.rotate(rotation);c.drawImage(photo,-77,-53,154,106);c.restore();
      if(assets.rest){
        c.save();c.beginPath();c.rect(stand.x-78,stand.y-44,156,50);c.clip();drawProp(c,assets.rest,stand.x,stand.y+3,153,82);c.restore();
      }
    }
    else ellipse(c,stand.x,stand.y-49,53,38,'#b4bdad');
    if(beat>0){glow(c,stand.x-29+beat*63,stand.y-42-beat*30,14,'#ffffddb8');glow(c,inlay.x,endpoint,12+beat*18,'#fff9d6');}
  }
  ellipse(c,lamp.x+4,lamp.y+4,55,12,'#452c1f60');
  if(assets.lamp)drawProp(c,assets.lamp,lamp.x,lamp.y,115,176);
  else{ellipse(c,lamp.x,lamp.y-8,35,14,brass);glow(c,lamp.x,lamp.y-58,25,'#ffc778');}
  if(hasStone(s))loupe(c,reading(s));
  const description=hasStone(s)?'Packet '+s.packet+', notch '+(s.notch+1)+'. Two threads meet on the '+reading(s)+' stud.':'An empty sample rest beside a brass lamp.';
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',description);
  return canvas;
}
