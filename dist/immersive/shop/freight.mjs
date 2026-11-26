import * as T from '../vendor/three.module.js';
import {ShopInterior} from './interior.mjs';
import {stations,walkable} from './walk.mjs';
import {manifest} from './investigation.mjs';

export const cargo=manifest.map((entry,i)=>({...entry,x:3.43+i*1.11,z:1.52}));
export const freightStations={...stations};
for(const item of cargo)freightStations['crate-'+item.crate]={label:'Crate '+item.crate,mark:item.crate,point:[item.x,.78,item.z+.41],approach:[item.x,2.43]};
freightStations.window={label:'Canal window',mark:'≈',point:[7.79,1.55,3.51],approach:[6.65,3.95]};
export const loadingWalkable=(x,z)=>walkable(x,z)&&cargo.every(c=>Math.abs(c.x-x)>.68||Math.abs(c.z-z)>.61);

function freightLabel(item,held){
  const c=document.createElement('canvas');c.width=360;c.height=190;
  const ctx=c.getContext('2d');
  ctx.fillStyle=held?'#842e29':'#d8c5a0';ctx.fillRect(0,0,360,190);
  ctx.strokeStyle=ctx.fillStyle=held?'#fff1ce':'#392d22';ctx.lineWidth=3;ctx.strokeRect(8,8,344,174);
  ctx.textAlign='center';ctx.font='bold 49px Georgia';ctx.fillText(held?'HELD':item.stamp.toUpperCase(),180,61);
  ctx.font='bold 39px Georgia';ctx.fillText('CRATE '+item.crate,180,116);
  ctx.font='bold 30px Georgia';ctx.fillText('╱ '.repeat(item.cuts).trim(),180,163);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
export class LoadingRoom extends ShopInterior{
  constructor(canvas){
    super(canvas);this.tags=new Map();this.boxes=new Map();
    const wood=new T.TextureLoader().load(new URL('../../assets/generated/shop-walnut.webp',import.meta.url).href);wood.colorSpace=T.SRGBColorSpace;
    const boards=new T.MeshStandardMaterial({color:0xe6c69f,map:wood}),iron=new T.MeshStandardMaterial({color:0x60523a,roughness:.65});
    const shape=new T.BoxGeometry(),plaque=new T.PlaneGeometry(.76,.40);
    for(const item of cargo){
      const root=new T.Group();root.position.set(item.x,0,item.z);root.userData.crate=item.crate;this.scene.add(root);this.boxes.set(item.crate,root);
      const block=(mat,x,y,z,w,h,d)=>{const part=new T.Mesh(shape,mat);part.position.set(x,y,z);part.scale.set(w,h,d);root.add(part);return part;};
      block(iron,0,.47,0,.88,.90,.72);
      for(let i=0;i<6;i++)block(boards,0,.12+i*.145,0,.93,.137,.77);
      block(boards,0,.956,0,.97,.063,.81);
      for(const x of [-.345,.345])block(iron,x,.50,0,.040,.976,.79);
      const tag=new T.Mesh(plaque,new T.MeshBasicMaterial({map:freightLabel(item,false)}));tag.position.set(0,.69,.392);root.add(tag);this.tags.set(item.crate,tag);
    }
  }
  hold(id){
    if(this.held===id)return;
    const item=cargo.find(c=>c.crate===id),tag=this.tags.get(id);if(!item||!tag)return;
    this.held=id;tag.material.map.dispose();tag.material.map=freightLabel(item,true);
    this.flash=new T.Group();this.scene.add(this.flash);
    const glow=new T.MeshBasicMaterial({color:0xffe5a1,transparent:true,depthWrite:false});
    for(const sign of [-1,1]){
      const stripe=new T.Mesh(new T.SphereGeometry(1,12,6),glow);stripe.scale.set(.055,.017,.34);
      stripe.rotation.y=sign*.28;stripe.position.set(9.4,.99,3.42+sign*.19);this.flash.add(stripe);
    }
  }
  update(time,reduced){
    if(this.flash)this.flash.children[0].material.opacity=reduced ? .9 : .25+.68*(.5+.5*Math.cos(time*.0029));
  }
  crateAt(ray){
    for(const hit of ray.intersectObjects([...this.boxes.values()],true)){
      const id=hit.object.parent.userData.crate;
      if(id)return id;
    }
    return null;
  }
}
export const loadingLayout={Interior:LoadingRoom,stations:freightStations,walkable:loadingWalkable,start:[4.5,4.9],yaw:-Math.PI/2,height:()=>0,
  footstep:(x,z)=>Math.abs(x-4.38)<.605&&Math.abs(z-4.68)<1.59?'rug-step':'floor-step'};
