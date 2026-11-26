import {clamp} from '../engine.mjs';

// Coordinates are pencil distances on Kaelan's board, independent of screen size.
// Both sightings share the nick on the longer ray and the same pair of tips.
const rays=[
  [[-112,-44],[-66,-30],[-59,-35],[-47,-24],[0,0],[45,11]],
  [[-76,50],[-41,23],[-16,12],[0,0]],
  [[-59,-35],[-65,-51]]
];
const target={x:441,y:236};
export const initialSheet=()=>({x:326,y:268,angle:-28});
export function sheetPose(raw){
  const base=initialSheet();
  for(const [key,low,high] of [['x',115,700],['y',105,375],['angle',-60,60]]){
    if(Number.isFinite(raw?.[key]))base[key]=clamp(raw[key],low,high);
  }
  return base;
}
export function registered(pose){
  const angle=pose.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  // Check the joint AND both tips. A sheet pivoted at the right spot still misses.
  return [[0,0],rays[0][0],rays[1][0]].every(([x,y])=>
    Math.hypot(pose.x+x*c-y*s-target.x-x,pose.y+x*s+y*c-target.y-y)<=11);
}
export const sights={
  near_view:{image:'disposal-barge',x:397,y:349,angle:-8,scale:1.05,label:'Lower steps'},
  far_view:{image:'barge-overlook',x:431,y:329,angle:-36,scale:.79,label:'Gate overlook'}
};
const images={};
function drawPlate(ctx,name,fallback){
  const img=images[name];
  if(img?.naturalWidth){ctx.drawImage(img,0,0,800,450);return;}
  ctx.fillStyle=fallback;ctx.fillRect(0,0,800,450);
}
export function loadPlates(){
  return Promise.all(['quay-sketchboard',...Object.values(sights).map(s=>s.image)].map(name=>{
    if(!images[name]){
      const img=new Image();img.src=new URL('../../assets/generated/'+name+'.webp',import.meta.url).href;images[name]=img;
    }
    return images[name].decode().catch(()=>{});
  }));
}
function linework(ctx,x,y,angle,scale,color,width){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);ctx.scale(scale,scale);
  ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=width;
  for(const ray of rays){ctx.beginPath();ray.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();}
  ctx.restore();
}
export function drawSight(ctx,id,traced){
  const s=sights[id];drawPlate(ctx,s.image,'#12383e');
  ctx.save();ctx.shadowColor='#76e3dd';ctx.shadowBlur=11;
  linework(ctx,s.x,s.y,s.angle,s.scale,'rgba(180,250,229,.86)',2.7);ctx.restore();
  if(traced){
    ctx.strokeStyle='#ffdda1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,14,0,2*Math.PI);ctx.stroke();
  }
}
export function drawBoard(ctx,flags,pose){
  drawPlate(ctx,'quay-sketchboard','#dbc296');
  ctx.font='italic 19px Georgia';ctx.fillStyle='#564132';ctx.fillText('Water gate · nightfall',155,95);
  // The temple page marks only where the pulse landed; the water supplies the rays.
  ctx.strokeStyle='#866e52';ctx.lineWidth=1.7;ctx.beginPath();ctx.ellipse(target.x,target.y,15,11,-.1,0,Math.PI*2);ctx.stroke();
  ctx.font='italic 13px Georgia';ctx.fillText('brass inlay',target.x+24,target.y+34);
  if(flags.near_view){
    ctx.fillText('Lower steps',target.x-115,target.y-65);
    linework(ctx,target.x,target.y,0,1,'#40392c',4.8);
  }
  if(flags.far_view){
    ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle*Math.PI/180);
    ctx.shadowColor='#352d2266';ctx.shadowBlur=6;ctx.fillStyle='rgba(255,246,213,.38)';
    ctx.fillRect(-145,-78,226,155);ctx.shadowBlur=0;ctx.strokeStyle='#947b5566';ctx.lineWidth=1;
    ctx.strokeRect(-145,-78,226,155);
    ctx.fillStyle='#315952';ctx.fillText('Gate overlook',-125,66);ctx.restore();
    linework(ctx,pose.x,pose.y,pose.angle,1,'#316d70',3);
  }
}

// On a confirmed match, keep both inks visible and bring the tiny nick into focus.
export function drawMatch(ctx){
  ctx.save();ctx.translate(400,225);ctx.scale(2.25,2.25);ctx.translate(-399,-231);
  drawBoard(ctx,{near_view:true,far_view:true},{...target,angle:0});
  ctx.lineWidth=1.8;ctx.strokeStyle='#98601e';
  for(const [x,y,r] of [[0,0,13],[-59,-35,10]]){
    ctx.beginPath();ctx.arc(target.x+x,target.y+y,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
