import * as T from '../vendor/three.module.js';
import {ShopInterior} from '../shop/interior.mjs';
import {stations,walkable} from '../shop/walk.mjs';

// Return to the same window and notebook that the player used before the quay.
export function workshopLayout(sc){
  const furnishing={
    canal_light:{...stations.bench,type:'water',point:[7.77,1.34,3.42],approach:[7.12,3.8]},
    old_wall:{type:'record',point:[1.13,1.46,3.20],approach:[2.22,3.20],mark:'⌑'},
    research:{...stations.notebook,type:'record'}
  };
  for(const o of sc.objects)furnishing[o.id].label=o.label;
  return {stations:furnishing,furnishings:furnishing,people:[],start:[4.5,5.75],yaw:-Math.PI/2,
    height:()=>0,footstep:(x,z)=>Math.abs(x-4.38)<.605&&Math.abs(z-4.68)<1.59?'rug-step':'floor-step',walkable,Interior:Workshop};
}

class Workshop extends ShopInterior{
  constructor(canvas){
    super(canvas);
    const loader=new T.TextureLoader();
    const map=name=>{const t=loader.load(new URL('../../assets/generated/'+name+'.webp',import.meta.url).href);t.colorSpace=T.SRGBColorSpace;return t;};
    const wood=new T.MeshStandardMaterial({color:0xc3aa8b,map:map('shop-walnut')});
    const plaster=new T.MeshStandardMaterial({color:0xe6d4af,map:map('shop-limewash')});
    const brass=new T.MeshStandardMaterial({color:0xbc924b,metalness:.4,roughness:.38});
    const wall=new T.Group();wall.name='station-old_wall';wall.position.set(1.04,1.45,3.20);wall.rotation.y=Math.PI/2;this.scene.add(wall);
    const cube=new T.BoxGeometry();
    const box=(group,material,x,y,z,w,h,d)=>{
      const part=new T.Mesh(cube,material);part.position.set(x,y,z);part.scale.set(w,h,d);group.add(part);return part;
    };
    box(wall,plaster,0,0,0,1.08,.94,.06);
    const engraving=new T.MeshStandardMaterial({color:0x7c7161,emissive:0x5ed8cf,emissiveIntensity:0});
    const groove=(x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1;
      box(wall,engraving,(x1+x2)/2,(y1+y2)/2,.039,.012,Math.hypot(dx,dy),.008).rotation.z=-Math.atan2(dx,dy);
    };
    groove(-.37,-.19,.04,.05);groove(.04,.05,.23,.30);groove(.04,.05,.38,.12);groove(.22,.085,.25,.15);
    this.engraving=engraving;
    for(const x of [-.55,.55])box(wall,wood,x,0,.046,.045,1.01,.065);
    for(const y of [-.49,.49])box(wall,wood,0,y,.046,1.14,.05,.065);
    const cover=this.cover=new T.Group();cover.position.set(-.51,0,.077);wall.add(cover);
    for(let i=0;i<8;i++)box(cover,wood,.51,-.40+i*.113,0,1.01,.108,.044);
    for(const x of [.09,.92])box(cover,wood,x,0,.035,.05,.91,.035);
    for(const y of [-.27,.27])box(cover,brass,.10,y,.057,.19,.033,.012);
    box(cover,brass,.92,0,.078,.077,.028,.06);
    const quartz=new T.MeshStandardMaterial({color:0xbed7c7,roughness:.2,emissive:0x61baac,emissiveIntensity:0});
    this.sample=new T.Mesh(new T.IcosahedronGeometry(1,0),quartz);
    this.sample.position.set(7.75,1.01,3.42);this.sample.scale.set(.06,.11,.065);this.sample.rotation.z=.31;this.scene.add(this.sample);
    const hitSurface=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});
    const sill=box(this.scene,hitSurface,7.83,1.49,3.42,.12,1.16,2.6);
    const desk=box(this.scene,hitSurface,1.52,.70,4.5,.99,.5,.77);
    wall.userData.station='old_wall';sill.userData.station='canal_light';this.sample.userData.station='canal_light';desk.userData.station='research';
    this.stationMeshes=[wall,this.sample,sill,desk];
    this.renderer.toneMappingExposure*=.87;
  }
  setState({wallSeen,wallLit}){
    this.cover.rotation.y=wallSeen?-Math.PI*.83:0;
    this.engraving.emissiveIntensity=wallLit ? .75 : 0;
    this.sample.material.emissiveIntensity=wallLit ? .9 : 0;
  }
}
