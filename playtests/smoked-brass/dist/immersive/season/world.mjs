import * as T from '../vendor/three.module.js';
import {furnishRoom} from './furnishings.mjs';
import {workshopLayout} from './workshop.mjs';
import {figure} from './figures.mjs';
import {disposeInterior} from '../room3d.mjs';
import {floorPlan} from './layout.mjs';
const assets=new URL('../../assets/generated/season/',import.meta.url);
const objectArt={
  old_wall:'shutter',canal_light:'window-bench','experiment-notes':'desk','mount-notebook':'plan',
  'route-chart':'plan','bell-record':'scope','workshop-record':'mount',research:'desk',comparison:'plan',
  'modified-instrument':'scope','original-markers':'plan',initiation:'robe',robes:'robe',
  'rings-memory':'city','founding-memory':'basin','crystal-memory':'plinth','continue-memory':'basin',
  'architecture-record':'plan','astronomy-record':'scope',western_stacks:'arch','water-record':'basin',
  shaft:'scope',harbor:'scope',grid:'city',patrol:'basin','altered-grid':'city',resonance:'mount',
  'dock-signal':'cargo','vendor-signal':'cargo','distant-sites':'scope'
};
const kindArt={record:'desk',model:'city',water:'basin',crystal:'plinth',gate:'arch',optics:'scope',cargo:'cargo',person:'robe'};
const movable={6:['mounting','channel'],9:['specimen-setup','marked-wall','water-channel'],12:['array','west','center','east'],14:['array','grammar'],23:['central-channel','outer-channel']};
function shadowTexture(){
  const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d');
  const grad=ctx.createRadialGradient(48,48,4,48,48,48);grad.addColorStop(0,'white');grad.addColorStop(.48,'#aaa');grad.addColorStop(1,'black');
  ctx.fillStyle=grad;ctx.fillRect(0,0,96,96);return new T.CanvasTexture(c);
}
export function buildLayout(sc,ch,passageOpen=false){
  if(sc.episode===4)return workshopLayout(sc);
  const plan=floorPlan(sc,passageOpen);
  plan.Interior=class {
    dispose(){disposeInterior(this);}
    constructor(canvas){
      this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.scene=new T.Scene();this.scene.background=new T.Color(0x393730);
      this.camera=new T.PerspectiveCamera(55,1,.035,75);this.tokens={};this.stationMeshes=[];
      const loader=new T.TextureLoader(),cache=new Map();
      const texture=name=>{
        if(!cache.has(name)){const t=loader.load(new URL(name+'.webp',assets).href);t.colorSpace=T.SRGBColorSpace;cache.set(name,t);}
        return cache.get(name);
      };
      this.scene.add(new T.HemisphereLight(0xffefd8,0x817560,1.65));
      const sun=new T.DirectionalLight(0xffdfb4,1.85);sun.position.set(3,7,-2);this.scene.add(sun);
      const place=furnishRoom(texture);
      const sky=texture(ch.world);sky.wrapS=T.RepeatWrapping;sky.repeat.x=-1;
      const shell=new T.Mesh(new T.SphereGeometry(28,64,32),new T.MeshBasicMaterial({map:sky,side:T.BackSide}));
      shell.position.set(4.5,1.58,4);this.scene.add(shell);
      const alpha=shadowTexture();
      const floor=new T.Mesh(new T.PlaneGeometry(17,16),new T.MeshBasicMaterial({map:texture('floor-'+ch.world),alphaMap:alpha,transparent:true,depthWrite:false}));
      floor.rotation.x=-Math.PI/2;floor.position.set(4.5,-.008,4);floor.renderOrder=-2;this.scene.add(floor);
      const shade=new T.MeshBasicMaterial({color:0x201910,alphaMap:alpha,transparent:true,opacity:.55,depthWrite:false});
      const flat=new T.PlaneGeometry(1,1);
      const shadow=(x,z,width)=>{
        const oval=new T.Mesh(flat,shade);oval.rotation.x=-Math.PI/2;oval.position.set(x,.004,z);
        oval.scale.set(width*1.22,width*.76,1);oval.renderOrder=-1;this.scene.add(oval);
      };
      for(const [id,s] of Object.entries(plan.furnishings)){
        const [x,,z]=s.point;
        if(sc.episode===12&&id==='wall'){
          // This section belongs to the west wall. Keep its bearing and stone scale
          // fixed, with real depth behind the opening as the player steps inside.
          const width=4.65,height=2.72,root=new T.Group();
          root.rotation.y=Math.PI/2;root.position.set(x,0,z);this.scene.add(root);root.userData.station=passageOpen?'passage':id;this.stationMeshes.push(root);
          const wall=texture(passageOpen?'open-passage':'evidence-12');
          const panel=(u0,v0,u1,v1,depth,map=wall)=>{
            const geom=new T.PlaneGeometry(width*(u1-u0),height*(v1-v0));
            const uv=geom.getAttribute('uv');
            for(let i=0;i<uv.count;i++)uv.setXY(i,u0+uv.getX(i)*(u1-u0),v0+uv.getY(i)*(v1-v0));
            const mesh=new T.Mesh(geom,new T.MeshBasicMaterial({map,side:T.DoubleSide}));
            mesh.position.set(((u0+u1)/2-.5)*width,(v0+v1)/2*height,depth);root.add(mesh);
          };
          if(passageOpen){
            panel(0,0,.348,1,0);panel(.69,0,1,1,0);panel(.348,.88,.69,1,0);
            panel(.348,0,.69,.88,-.64);
            for(const side of [.348,.69]){
              const lining=new T.Mesh(new T.BoxGeometry(.055,.88*height,.66),new T.MeshBasicMaterial({map:wall,color:0x696361}));
              lining.position.set((side-.5)*width,.44*height,-.32);root.add(lining);
            }
          }else panel(0,0,1,1,0);
          continue;
        }
        const mobile=movable[sc.episode]?.includes(id);
        const art=mobile?'plinth':objectArt[id]||kindArt[s.type];
        const {root,token}=place(art);
        root.name='station-'+id;
        root.position.set(x,0,z);
        root.rotation.y=Math.atan2(s.approach[0]-x,s.approach[1]-z);
        const extent=new T.Box3().setFromObject(root);
        s.point[1]=extent.max.y*.85;
        root.userData.station=id;this.stationMeshes.push(root);
        this.scene.add(root);shadow(x,z,.82);
        if(token)this.tokens[id]=token;
      }
      for(const {name,x,z} of plan.people){
        const person=figure(name,texture('person-'+name),personAspect[name]);
        person.position.set(x,0,z);person.rotation.y=Math.atan2(4.5-x,4-z);
        shadow(x,z,.55);this.scene.add(person);
      }
    }
    setState(visible){for(const [id,value] of Object.entries(visible))if(this.tokens[id])this.tokens[id].visible=value;}
  };
  return plan;
}
const personAspect={'mira': 0.4, 'kai': 0.332, 'thalor': 0.511, 'keeper': 0.384, 'leader': 0.513, 'signaler': 0.45};
