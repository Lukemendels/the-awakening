import * as T from '../vendor/three.module.js';
import {Room3D} from '../room3d.mjs';
import {stations,pathTo} from './walk.mjs';

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
  constructor(canvas,markers,onArrive,onMessage){
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
  start(){
    cancelAnimationFrame(this.frameId);this.path=[];this.arrival=null;this.pos=[4.5,5.75];this.look=new T.Vector3(4.5,1,1.7);
    this.resolution='';this.last=performance.now();this.frame(this.last);
  }
  stop(){cancelAnimationFrame(this.frameId);this.path=[];this.arrival=null;}
  go(to,id=null){
    const path=pathTo(this.pos,to);
    if(!path){this.onMessage('Choose a clear patch of floor.');return;}
    this.path=path;this.arrival=id;
    if(id)this.onMessage('Approaching '+stations[id].label.toLowerCase()+'…');
  }
  frame=(time)=>{
    this.frameId=requestAnimationFrame(this.frame);
    if(document.hidden || document.querySelector('dialog[open]')){this.last=time;return;}
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    const dt=Math.min(.08,(time-this.last)/1000);this.last=time;
    const camera=this.room.camera,aspect=w/Math.max(1,h);
    if(this.resolution!==[w,h].join('/')){
      this.resolution=[w,h].join('/');this.room.renderer.setSize(w,h,false);
      this.room.camera.aspect=aspect;this.room.camera.fov=72;
      this.room.camera.updateProjectionMatrix();
    }
    const moving=this.path.length>0;
    let remaining=this.reduce.matches?Infinity:dt*4.5;
    while(this.path.length && remaining>0){
      const [x,z]=this.path[0],dx=x-this.pos[0],dz=z-this.pos[1],d=Math.hypot(dx,dz);
      if(d<=remaining){this.pos=[x,z];remaining-=d;this.path.shift();}
      else{this.pos[0]+=dx*remaining/d;this.pos[1]+=dz*remaining/d;remaining=0;}
    }
    const [x,z]=this.pos;
    if(this.arrival){
      this.target.set(...stations[this.arrival].point);
      this.look.lerp(this.target,this.reduce.matches?1:1-Math.exp(-8*dt));
    }
    camera.position.set(x,1.58,z);camera.lookAt(this.look);
    camera.updateMatrixWorld();
    for(const [b,s] of this.pins){
      const p=this.projected.set(...s.point).project(camera);
      const px=(p.x+1)*w/2,py=(1-p.y)*h/2;
      b.hidden=moving||p.z>1||p.z< -1||px<22||px>w-22||py<62||py>h-65;
      if(!b.hidden){b.style.left=px+'px';b.style.top=py+'px';}
    }
    this.room.renderer.render(this.room.scene,camera);
    if(moving&&!this.path.length&&this.arrival){const id=this.arrival;this.arrival=null;this.onArrive(id);}
  };
}
