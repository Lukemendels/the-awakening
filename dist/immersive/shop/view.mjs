import * as T from '../vendor/three.module.js';
import {ShopInterior} from './interior.mjs';
import {clamp,wrapAngle} from '../engine.mjs';
import {bindShopSticks} from './sticks.mjs';
import {stations,pathTo,walkable} from './walk.mjs';

// Three.js uses a vertical field of view. Bound the horizontal angle as well
// so landscape phones do not magnify the room edges during a turn.
const maxHorizontalFov=T.MathUtils.degToRad(82);
const yawRate=T.MathUtils.degToRad(80),pitchRate=T.MathUtils.degToRad(48);
function stickResponse(axis){return axis*(.35+.65*Math.abs(axis));}

// At full stick this is a relaxed 92 footfalls a minute, including guided walks.
const walkingSpeed=1.25, stepLength=.82;
const shopLayout={
  Interior:ShopInterior,stations,walkable,start:[4.5,5.75],yaw:-Math.PI/2,
  height:()=>0,
  footstep:(x,z)=>Math.abs(x-4.38)<.605&&Math.abs(z-4.68)<1.59?'rug-step':'floor-step'
};

export class ShopView {
  constructor(canvas,markers,onArrive,onMessage,audio,layout=shopLayout){
    this.layout=layout;
    this.audio=audio;
    this.canvas=canvas;this.onArrive=onArrive;this.onMessage=onMessage;
    this.room=new layout.Interior(canvas);
    this.ray=new T.Raycaster();
    this.target=new T.Vector3();this.projected=new T.Vector3();this.resolution='';
    this.reduce=matchMedia('(prefers-reduced-motion: reduce)');
    this.pins=Object.entries(layout.stations).map(([id,s])=>{
      const b=document.createElement('button');b.className='pin';b.textContent=s.mark;b.setAttribute('aria-label','Approach '+s.label);markers.append(b);
      b.onclick=()=>this.go(s.approach,id);return [b,s];
    });
    canvas.onclick=e=>{

      const rect=canvas.getBoundingClientRect();
      this.ray.setFromCamera({x:2*(e.clientX-rect.left)/rect.width-1,y:1-2*(e.clientY-rect.top)/rect.height},this.room.camera);
      if(this.room.stationMeshes){
        const hits=this.ray.intersectObjects(this.room.stationMeshes,true);
        for(const hit of hits){
          let obj=hit.object;
          while(obj&&!obj.userData.station&&obj.visible)obj=obj.parent;
          const id=obj?.visible&&obj.userData.station;
          if(id&&layout.stations[id]){this.go(layout.stations[id].approach,id);return;}
        }
        return;
      }
      // Pin buttons and taps on the physical props select the same approach.
      const hitProp=Object.entries(layout.stations).map(([id,s])=>{
        const center=new T.Vector3(...s.point);center.y-=.23;
        const hit=this.ray.ray.intersectBox(new T.Box3().setFromCenterAndSize(center,new T.Vector3(1.25,1.05,.8)),new T.Vector3());
        return hit?{id,s,d:hit.distanceTo(this.ray.ray.origin)}:null;
      }).filter(Boolean).sort((a,b)=>a.d-b.d)[0];
      if(hitProp){this.go(hitProp.s.approach,hitProp.id);return;}
    };
  }
  start(pose){
    this.stride=0;this.running=true;this.path=[];this.arrival=null;
    this.pos=[...this.layout.start];this.yaw=this.layout.yaw;this.pitch=-.13;
    if(pose && [pose.x,pose.z,pose.yaw,pose.pitch].every(Number.isFinite) && this.layout.walkable(pose.x,pose.z)){
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
    const [x,,z]=this.layout.stations[id].point;
    const inReach=Math.hypot(this.pos[0]-x,this.pos[1]-z)<=1.3;
    const path=inReach&&!this.layout.stations[id].walkThrough?[]:pathTo(this.pos,to,this.layout.walkable);
    if(!path){this.onMessage('Move clear of the furniture and try again.');return;}
    this.input.reset();this.path=path;this.arrival=id;
    this.onMessage('Approaching '+this.layout.stations[id].label.toLowerCase()+'…');
  }
  walk(dt){
    const {move,look,keys}=this.input;
    const turn=clamp(stickResponse(look.x)+Number(keys.has('arrowright'))-Number(keys.has('arrowleft')),-1,1);
    const tilt=clamp(-stickResponse(look.y)+Number(keys.has('arrowup'))-Number(keys.has('arrowdown')),-1,1);
    this.yaw=wrapAngle(this.yaw+turn*yawRate*dt);
    this.pitch=clamp(this.pitch+tilt*pitchRate*dt,-1,1);
    const forward=-move.y+Number(keys.has('w'))-Number(keys.has('s'));
    const strafe=move.x+Number(keys.has('d'))-Number(keys.has('a'));
    const speed=walkingSpeed*dt/Math.max(1,Math.hypot(forward,strafe));
    const dx=speed*(forward*Math.cos(this.yaw)-strafe*Math.sin(this.yaw));
    const dz=speed*(forward*Math.sin(this.yaw)+strafe*Math.cos(this.yaw));
    if(this.layout.walkable(this.pos[0]+dx,this.pos[1]))this.pos[0]+=dx;
    if(this.layout.walkable(this.pos[0],this.pos[1]+dz))this.pos[1]+=dz;
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
    const [fromX,fromZ]=this.pos;
    const moving=Boolean(this.arrival);
    if(!moving)this.walk(dt);
    let remaining=this.reduce.matches?Infinity:dt*walkingSpeed;
    while(this.path.length && remaining>0){
      const [x,z]=this.path[0],dx=x-this.pos[0],dz=z-this.pos[1],d=Math.hypot(dx,dz);
      if(d<=remaining){this.pos=[x,z];remaining-=d;this.path.shift();}
      else{this.pos[0]+=dx*remaining/d;this.pos[1]+=dz*remaining/d;remaining=0;}
    }
    const [x,z]=this.pos;
    const eye=1.58+this.layout.height(x,z);
    let facing=false;
    if(this.arrival){
      const station=this.layout.stations[this.arrival];
      const [tx,ty,tz]=station.lookAt??station.point;
      const yaw=Math.atan2(tz-z,tx-x);
      const pitch=Math.atan2(ty-eye,Math.hypot(tx-x,tz-z));
      const blend=this.reduce.matches?1:1-Math.exp(-7*dt);
      const yawStep=wrapAngle(yaw-this.yaw)*blend,pitchStep=(pitch-this.pitch)*blend;
      this.yaw=wrapAngle(this.yaw+(this.reduce.matches?yawStep:clamp(yawStep,-yawRate*dt,yawRate*dt)));
      this.pitch+=this.reduce.matches?pitchStep:clamp(pitchStep,-pitchRate*dt,pitchRate*dt);
      facing=Math.abs(wrapAngle(yaw-this.yaw))<.06 && Math.abs(pitch-this.pitch)<.06;
    }
    camera.position.set(x,eye,z);
    camera.lookAt(x+Math.cos(this.yaw),eye+Math.tan(this.pitch),z+Math.sin(this.yaw));
    if(x!==this.lastX||z!==this.lastZ||this.yaw!==this.lastYaw){
      this.audio.setListener(x,z,this.yaw);
      this.lastX=x;this.lastZ=z;this.lastYaw=this.yaw;
    }
    const traveled=Math.hypot(x-fromX,z-fromZ);
    if(traveled>.001 && !(moving&&this.reduce.matches)){
      this.stride+=traveled;
      if(this.stride>=stepLength){
        this.stride%=stepLength;
        this.audio.cue(this.layout.footstep(x,z),x,z);
      }
    }else this.stride=.34;
    camera.updateMatrixWorld();
    for(const [b,s] of this.pins){
      const p=this.projected.set(...s.point).project(camera);
      const px=(p.x+1)*w/2,py=(1-p.y)*h/2;
      b.hidden=moving||Math.hypot(x-s.point[0],z-s.point[2])>(s.walkThrough?7:2.65)||p.z>1||p.z< -1||px<22||px>w-22||py<62||py>h-65;
      if(!b.hidden){b.style.left=px+'px';b.style.top=py+'px';}
    }
    this.room.update?.(time,this.reduce.matches);
    this.room.renderer.render(this.room.scene,camera);
    if(this.layout.crossed?.(x,z)){this.arrival=null;this.onArrive('passage');return;}
    if(facing&&!this.path.length&&this.arrival){const id=this.arrival;this.arrival=null;this.onArrive(id);}
  };
}
