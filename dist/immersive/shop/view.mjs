import * as T from '../vendor/three.module.js';
import {Room3D} from '../room3d.mjs';
import {clamp,wrapAngle} from '../engine.mjs';
import {bindShopSticks} from './sticks.mjs';
import {stations,pathTo,walkable} from './walk.mjs';

// Three.js uses a vertical field of view. Bound the horizontal angle as well
// so landscape phones do not magnify the room edges during a turn.
const maxHorizontalFov=T.MathUtils.degToRad(82);
const yawRate=T.MathUtils.degToRad(80),pitchRate=T.MathUtils.degToRad(48);
function stickResponse(axis){return axis*(.35+.65*Math.abs(axis));}

function wallChart(){
  const paper=document.createElement('canvas');paper.width=480;paper.height=240;
  const pen=paper.getContext('2d');
  pen.fillStyle='#a99064';pen.fillRect(0,0,480,240);
  pen.strokeStyle='#554a36';pen.lineWidth=2;pen.strokeRect(9,9,462,222);pen.strokeRect(15,15,450,210);
  for(const radius of [20,39,62,86]){
    pen.beginPath();pen.ellipse(190,120,radius*1.4,radius,-.22,0,Math.PI*2);pen.stroke();
  }
  for(const height of [62,83,124,166]){
    pen.beginPath();pen.moveTo(25,height);pen.bezierCurveTo(140,height-55,270,height+64,448,height-2);pen.stroke();
  }
  pen.fillStyle='#493b2c';pen.font='16px Georgia';pen.fillText('ATLANTIS',340,199);
  const texture=new T.CanvasTexture(paper);texture.colorSpace=T.SRGBColorSpace;
  const chart=new T.Mesh(new T.PlaneGeometry(2.35,1.17),new T.MeshStandardMaterial({map:texture,roughness:1}));
  chart.position.set(4.57,1.78,1.09);return chart;
}

export class ShopView {
  constructor(canvas,markers,onArrive,onMessage,audio){
    this.audio=audio;
    this.canvas=canvas;this.onArrive=onArrive;this.onMessage=onMessage;
    this.room=new Room3D(canvas,{benchOffset:1.5,canalImage:'../../assets/6_Night Canal.webp'});
    this.room.scene.fog=null;
    this.room.specimen.visible=true;
    this.room.scene.add(wallChart());
    this.room.scene.background=new T.Color(0x122e34);
    this.ray=new T.Raycaster();
    this.target=new T.Vector3();this.projected=new T.Vector3();this.resolution='';
    this.reduce=matchMedia('(prefers-reduced-motion: reduce)');
    this.pins=Object.entries(stations).map(([id,s])=>{
      const b=document.createElement('button');b.className='pin';b.textContent=s.mark;b.setAttribute('aria-label','Approach '+s.label);markers.append(b);
      b.onclick=()=>this.go(s.approach,id);return [b,s];
    });
    canvas.onclick=e=>{

      const rect=canvas.getBoundingClientRect();
      this.ray.setFromCamera({x:2*(e.clientX-rect.left)/rect.width-1,y:1-2*(e.clientY-rect.top)/rect.height},this.room.camera);
      // Pin buttons and taps on the physical props select the same approach.
      const hitProp=Object.entries(stations).map(([id,s])=>{
        const center=new T.Vector3(...s.point);center.y-=.23;
        const hit=this.ray.ray.intersectBox(new T.Box3().setFromCenterAndSize(center,new T.Vector3(1.25,1.05,.8)),new T.Vector3());
        return hit?{id,s,d:hit.distanceTo(this.ray.ray.origin)}:null;
      }).filter(Boolean).sort((a,b)=>a.d-b.d)[0];
      if(hitProp){this.go(hitProp.s.approach,hitProp.id);return;}
    };
  }
  start(pose){
    this.running=true;this.path=[];this.arrival=null;
    this.pos=[4.5,5.75];this.yaw=-Math.PI/2;this.pitch=-.13;
    if(pose && [pose.x,pose.z,pose.yaw,pose.pitch].every(Number.isFinite) && walkable(pose.x,pose.z)){
      this.pos=[pose.x,pose.z];this.yaw=wrapAngle(pose.yaw);this.pitch=clamp(pose.pitch,-1,1);
    }
    this.input=bindShopSticks(document.getElementById('move-pad'),document.getElementById('look-pad'),
      ()=>this.running&&!document.hidden&&!document.querySelector('dialog[open]'),()=>{
        if(this.arrival)this.onMessage('');
        this.path=[];this.arrival=null;
      });
    this.resolution='';this.last=performance.now();this.frame(this.last);
  }
  pose(){return {x:this.pos[0],z:this.pos[1],yaw:this.yaw,pitch:this.pitch};}
  pause(){this.path=[];this.arrival=null;this.input?.reset();}
  stop(){this.running=false;this.pause();cancelAnimationFrame(this.frameId);}
  go(to,id){
    const [x,,z]=stations[id].point;
    const inReach=Math.hypot(this.pos[0]-x,this.pos[1]-z)<=1.3;
    const path=inReach?[]:pathTo(this.pos,to);
    if(!path){this.onMessage('Move clear of the furniture and try again.');return;}
    this.input.reset();this.path=path;this.arrival=id;
    this.onMessage('Approaching '+stations[id].label.toLowerCase()+'…');
  }
  walk(dt){
    const {move,look,keys}=this.input;
    const turn=clamp(stickResponse(look.x)+Number(keys.has('arrowright'))-Number(keys.has('arrowleft')),-1,1);
    const tilt=clamp(-stickResponse(look.y)+Number(keys.has('arrowup'))-Number(keys.has('arrowdown')),-1,1);
    this.yaw=wrapAngle(this.yaw+turn*yawRate*dt);
    this.pitch=clamp(this.pitch+tilt*pitchRate*dt,-1,1);
    const forward=-move.y+Number(keys.has('w'))-Number(keys.has('s'));
    const strafe=move.x+Number(keys.has('d'))-Number(keys.has('a'));
    const speed=2.2*dt/Math.max(1,Math.hypot(forward,strafe));
    const dx=speed*(forward*Math.cos(this.yaw)-strafe*Math.sin(this.yaw));
    const dz=speed*(forward*Math.sin(this.yaw)+strafe*Math.cos(this.yaw));
    if(walkable(this.pos[0]+dx,this.pos[1]))this.pos[0]+=dx;
    if(walkable(this.pos[0],this.pos[1]+dz))this.pos[1]+=dz;
  }
  frame=(time)=>{
    this.frameId=requestAnimationFrame(this.frame);
    if(document.hidden || document.querySelector('dialog[open]')){this.last=time;return;}
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    const dt=Math.min(.08,(time-this.last)/1000);this.last=time;
    const camera=this.room.camera,aspect=w/Math.max(1,h);
    if(this.resolution!==[w,h].join('/')){
      this.resolution=[w,h].join('/');this.room.renderer.setSize(w,h,false);
      camera.aspect=aspect;
      camera.fov=Math.min(62,T.MathUtils.radToDeg(2*Math.atan(Math.tan(maxHorizontalFov/2)/aspect)));
      this.room.camera.updateProjectionMatrix();
    }
    const moving=Boolean(this.arrival);
    if(!moving)this.walk(dt);
    let remaining=this.reduce.matches?Infinity:dt*2.8;
    while(this.path.length && remaining>0){
      const [x,z]=this.path[0],dx=x-this.pos[0],dz=z-this.pos[1],d=Math.hypot(dx,dz);
      if(d<=remaining){this.pos=[x,z];remaining-=d;this.path.shift();}
      else{this.pos[0]+=dx*remaining/d;this.pos[1]+=dz*remaining/d;remaining=0;}
    }
    const [x,z]=this.pos;
    let facing=false;
    if(this.arrival){
      const [tx,ty,tz]=stations[this.arrival].point;
      const yaw=Math.atan2(tz-z,tx-x);
      const pitch=Math.atan2(ty-1.58,Math.hypot(tx-x,tz-z));
      const blend=this.reduce.matches?1:1-Math.exp(-7*dt);
      const yawStep=wrapAngle(yaw-this.yaw)*blend,pitchStep=(pitch-this.pitch)*blend;
      this.yaw=wrapAngle(this.yaw+(this.reduce.matches?yawStep:clamp(yawStep,-yawRate*dt,yawRate*dt)));
      this.pitch+=this.reduce.matches?pitchStep:clamp(pitchStep,-pitchRate*dt,pitchRate*dt);
      facing=Math.abs(wrapAngle(yaw-this.yaw))<.06 && Math.abs(pitch-this.pitch)<.06;
    }
    camera.position.set(x,1.58,z);
    camera.lookAt(x+Math.cos(this.yaw),1.58+Math.tan(this.pitch),z+Math.sin(this.yaw));
    if(x!==this.lastX||z!==this.lastZ||this.yaw!==this.lastYaw){
      this.audio.setListener(x,z,this.yaw);
      this.lastX=x;this.lastZ=z;this.lastYaw=this.yaw;
    }
    camera.updateMatrixWorld();
    for(const [b,s] of this.pins){
      const p=this.projected.set(...s.point).project(camera);
      const px=(p.x+1)*w/2,py=(1-p.y)*h/2;
      b.hidden=moving||p.z>1||p.z< -1||px<22||px>w-22||py<62||py>h-65;
      if(!b.hidden){b.style.left=px+'px';b.style.top=py+'px';}
    }
    this.room.renderer.render(this.room.scene,camera);
    if(facing&&!this.path.length&&this.arrival){const id=this.arrival;this.arrival=null;this.onArrive(id);}
  };
}
