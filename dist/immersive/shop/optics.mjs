import {hasStone,projection,sunsetAngle,crystalAngle} from './investigation.mjs';

const width=900,height=450,stand={x:450,y:270},inlay={x:747,y:211};
const assets={};
let loading;
export function loadBenchArt(){
  if(!loading){
    const sources={plate:'light-bench-plate',lamp:'bench-lamp',rest:'bench-rest',condemned:'bench-quartz',approved:'bench-clear'};
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
export function propAt(x,y,s){
  const lamp=lampPosition(s.lamp);
  if(Math.abs(x-lamp.x)<72 && y>lamp.y-192 && y<lamp.y+23)return 'lamp';
  if(hasStone(s)&&((x-stand.x)/110)**2+((y-stand.y+55)/82)**2<1)return 'turn';
  return null;
}
export function dragLamp(original,deltaY){
  const y=Math.sin(original*Math.PI/180)+deltaY/157;
  return Math.round(Math.max(-45,Math.min(45,Math.asin(Math.max(-1,Math.min(1,y)))*180/Math.PI)));
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
function brassMarker(c){
  c.save();c.translate(inlay.x,inlay.y);c.rotate(-.09);
  c.strokeStyle='#655844';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,25,16,-.12,.05,6.17);c.stroke();
  const brass=c.createLinearGradient(-6,-7,6,7);brass.addColorStop(0,'#ffe9aa');brass.addColorStop(.5,'#ac874a');brass.addColorStop(1,'#77572d');
  c.fillStyle=brass;c.beginPath();c.moveTo(-11,0);c.lineTo(0,-6);c.lineTo(11,0);c.lineTo(0,6);c.closePath();c.fill();c.restore();
}
function annotate(c){
  shadow(c,sunsetAngle,true);brassMarker(c);
  c.fillStyle='#5b503e';c.font='italic 18px Georgia';c.fillText('Brass inlay',inlay.x-40,inlay.y+43);
}
function drawProp(c,image,x,y,w,h,radians=0){
  c.save();c.translate(x,y);c.rotate(radians);
  c.drawImage(image,-w/2,-h,w,h);c.restore();
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
    const l=lampPosition(sunsetAngle);
    stroke(c,[[l.x,l.y],[stand.x,stand.y-45],[inlay.x,inlay.y+(1-beat)*75]],'#f8edbf',4);
    stroke(c,[[stand.x-22,stand.y],[stand.x-10,stand.y-46],[stand.x+8,stand.y-46],[stand.x+20,stand.y]],'#574e3e',3);
    annotate(c);c.fillStyle='#564b39';c.font='italic 23px Georgia';c.fillText('Temple steps · Spring equinox',65,80);c.font='italic 18px Georgia';c.fillText('Last sunlight',l.x-25,l.y+35);
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Field sketch. The stand casts a long shadow to the right, a little uphill. A circle marks where the streaks meet.');return canvas;
  }
  if(s.sketch)annotate(c);
  const lamp=lampPosition(s.lamp),o=projection(s);
  glow(c,lamp.x+12,lamp.y-85,160,'#ffb94f39');
  shadow(c,s.lamp,false);
  ellipse(c,stand.x+4,stand.y+5,63,13,'#47311f52');
  const brass=c.createLinearGradient(stand.x-50,0,stand.x+50,0);brass.addColorStop(0,'#46341f');brass.addColorStop(.23,'#b68a45');brass.addColorStop(.43,'#e4c482');brass.addColorStop(.74,'#77542f');brass.addColorStop(1,'#38291b');
  if(assets.rest)drawProp(c,assets.rest,stand.x,stand.y+3,153,82);
  else ellipse(c,stand.x,stand.y,55,12,brass);
  if(hasStone(s)){
    const y=inlay.y+o.offset*1.8;
    c.save();c.globalCompositeOperation='screen';
    if(o.diffuse){
      c.translate(inlay.x,y);c.scale(2.4,.45);glow(c,0,0,28,'#fff0acbf');
    }else if(o.visible){
      for(const sign of [-1,1]){
        const end=y+sign*o.split*1.55;
        const l=c.createLinearGradient(stand.x+30,0,inlay.x,0);l.addColorStop(0,'#ffeba622');l.addColorStop(.58,'#f9df9d99');l.addColorStop(1,'#fffae1ec');
        c.shadowColor='#ffe7aa';c.shadowBlur=6;
        stroke(c,[[stand.x+30,stand.y-48+sign*3],[inlay.x,end]],l,2);glow(c,inlay.x,end,13,'#fff5c2d0');
      }
    }
    c.restore();
    const photo=assets[s.specimen],rotation=(s.turn-crystalAngle)*.008;
    if(photo){
      c.save();c.translate(stand.x,stand.y-66);c.rotate(rotation);c.drawImage(photo,-77,-53,154,106);c.restore();
      if(assets.rest){
        c.save();c.beginPath();c.rect(stand.x-78,stand.y-44,156,50);c.clip();drawProp(c,assets.rest,stand.x,stand.y+3,153,82);c.restore();
      }
    }
    else ellipse(c,stand.x,stand.y-49,53,38,'#b4bdad');
    if(beat>0){glow(c,stand.x-29+beat*63,stand.y-42-beat*30,14,'#ffffddb8');glow(c,inlay.x,inlay.y,12+beat*18,'#fff9d6');}
  }
  ellipse(c,lamp.x+4,lamp.y+4,55,12,'#452c1f60');
  if(assets.lamp)drawProp(c,assets.lamp,lamp.x,lamp.y,115,176);
  else{ellipse(c,lamp.x,lamp.y-8,35,14,brass);glow(c,lamp.x,lamp.y-58,25,'#ffc778');}
  const description=!hasStone(s)?'The lamp casts the shadow of an empty brass rest.':
    o.diffuse?'The clear specimen spills a broad patch of light.':
    s.sketch?'The lamp casts the stand’s shadow across the temple sketch.':'Quartz sits in the brass rest beside the lamp.';
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',description);
  return canvas;
}
