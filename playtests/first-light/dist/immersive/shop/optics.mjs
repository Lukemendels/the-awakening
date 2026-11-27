import {hasStone,beam,profile,sunsetAngle} from './investigation.mjs';

const width=900,height=450,stand={x:450,y:270};
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
// The notebook and the smoked brass receiver use the same physical landmarks.
function receiver(c,x,y,w,h,ink,pencil){
  c.save();c.translate(x,y);
  c.lineWidth=3;c.strokeStyle=ink;c.fillStyle=ink;
  c.beginPath();c.arc(-w,0,9,0,Math.PI*2);c.stroke();c.strokeRect(w-8,-8,16,16);
  c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();
  stroke(c,[[-5,5],[2,-2],[-1,-4],[5,-7]],pencil?'#d6c7a1':'#272522',2);
  if(pencil){
    c.strokeStyle='#574437';c.lineWidth=4;c.setLineDash([8,3]);c.beginPath();
    for(let i=0;i<=40;i++){const pt=beam(0,i/40);if(i)c.lineTo(pt.x*w,pt.y*h);else c.moveTo(pt.x*w,pt.y*h);}
    c.stroke();c.setLineDash([]);
  }
  c.restore();
}
export function illustration(s,kind='bench',beat=0,canvas=document.createElement('canvas'),overlay=false){
  canvas.className='stage';
  if(canvas.width!==1080){canvas.width=1080;canvas.height=540;}
  const c=canvas.getContext('2d',{willReadFrequently:true});
  c.setTransform(1.2,0,0,1.2,0,0);c.lineCap='round';c.lineJoin='round';
  if(kind==='sketch'||!assets.plate){
    const paper=c.createLinearGradient(0,0,width,height);paper.addColorStop(0,'#ae966b');paper.addColorStop(.56,'#efdfbd');paper.addColorStop(1,'#b79c6e');c.fillStyle=paper;c.fillRect(0,0,width,height);
  }else{
    const img=assets.plate,sh=img.width/2;c.drawImage(img,0,(img.height-sh)*.4,img.width,sh,0,0,width,height);
  }
  canvas.setAttribute('role','img');
  if(kind==='sketch'){
    c.fillStyle='#493c2c';c.font='italic 28px Georgia';c.fillText('Temple steps, just before the glass broke',65,70);
    receiver(c,450,255,247,85,'#504733',true);
    c.font='22px Georgia';c.fillText('At rest',165,305);c.fillText('After the turn',610,305);
    c.fillText('Broken rivet',397,308);c.font='italic 21px Georgia';c.fillText('The fork moved when the priest turned the stone.',150,390);
    canvas.setAttribute('aria-label','Temple sketch. The fork starts on the round stud, bends above the broken rivet and ends on the square stud.');
    return canvas;
  }
  const x=667,y=201,w=100,h=49;
  const plate=c.createLinearGradient(0,y-85,0,y+90);plate.addColorStop(0,'#6f593f');plate.addColorStop(.18,'#443d35');plate.addColorStop(.92,'#393832');plate.addColorStop(1,'#a18052');
  c.fillStyle=plate;c.beginPath();c.roundRect(x-w-30,y-90,w*2+60,179,10);c.fill();c.lineWidth=3;c.strokeStyle='#b59360';c.stroke();
  c.strokeStyle='#443521';c.lineWidth=2;c.strokeRect(x-w-26,y-86,w*2+52,171);
  for(const sx of [-1,1])for(const sy of [-1,1]){
    const u=x+sx*(w+18),v=y+sy*77;ellipse(c,u,v,4,4,'#bea276');
    stroke(c,[[u-2,v+2],[u+2,v-2]],'#443d30',1.5);
  }
  receiver(c,x,y,w,h,'#ccb889',false);
  if(overlay){
    c.fillStyle='rgba(226,220,179,.30)';c.fillRect(x-w-19,y-h-14,2*w+38,2*h+28);
    receiver(c,x,y,w,h,'#352d22',true);
  }
  const a=s.rotation??s.notch??0,p=profile(s);
  const lamp=lampPosition(sunsetAngle);shadow(c,sunsetAngle,false);
  if(assets.rest)drawProp(c,assets.rest,stand.x,stand.y+3,153,82);
  if(hasStone(s)){
    const spot=beam(p,a),end=[x+spot.x*w,y+spot.y*h];
    const observed=s.tracings?.[s.packet]||0;
    if(observed){
      const from=(observed&1)?0:a,to=(observed&2)?1:a;
      c.beginPath();
      for(let i=0;i<=32;i++){const q=beam(p,from+(to-from)*i/32);if(i)c.lineTo(x+w*q.x,y+h*q.y);else c.moveTo(x+w*q.x,y+h*q.y);}
      c.strokeStyle='#cbb073';c.lineWidth=3;c.stroke();
    }
    c.save();c.shadowColor='#ffcf7e';c.shadowBlur=5;
    for(const side of [-1,1])stroke(c,[[stand.x+43,stand.y-63+side*19],end],'#fff2b8',3);
    glow(c,...end,12+beat*8,'#fffad1');c.restore();
    if(assets.condemned){
      c.save();c.translate(stand.x,stand.y-68);c.rotate(-.22+a*.71);c.drawImage(assets.condemned,-85,-56,170,112);c.restore();
    }else ellipse(c,stand.x,stand.y-63,57,30,'#adaf99');
    if(assets.rest){c.save();c.beginPath();c.rect(stand.x-78,stand.y-40,156,48);c.clip();drawProp(c,assets.rest,stand.x,stand.y+3,153,82);c.restore();}
  }
  if(assets.lamp)drawProp(c,assets.lamp,lamp.x,lamp.y,115,176);
  else glow(c,lamp.x,lamp.y-48,32,'#fff1b9');
  const region=a<.06?'round stud':a>.95?(p===1?'round stud':'square stud'):(p===0?'above the broken rivet':p===2?'below the broken rivet':'near the round stud');
  canvas.setAttribute('aria-label','Packet '+s.packet+'. Light on the receiver: '+region+'.');
  return canvas;
}
