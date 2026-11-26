import * as T from './vendor/three.module.js';

/**
 * Authored 3D environmental sets for the first-person continuation.
 * Uses the existing Room3D renderer/camera. No extra WebGL context or remote assets.
 * Usage: const sets = new ArcRooms(room3d); sets.setScene('canal', objects);
 * Call room3d.render(player) normally. `setScene('opening')` restores the shop.
 * `sets.obstacles` corresponds to generated station plinths; combine it with
 * your scene's collision map and `nearestReachable` line-of-sight predicate.
 */
export class ArcRooms {
 constructor(owner){
  if(!owner?.scene||!owner?.renderer||!owner?.camera)throw new TypeError('ArcRooms requires an existing Room3D');
  this.motionQuery=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')??null;this.owner=owner;this.scene=owner.scene;this.original=owner.shop||new T.Group();this.original.name='opening-shop';
  if(!owner.shop){for(const child of [...this.scene.children])if(child.isMesh)this.original.add(child);this.scene.add(this.original);}this.active=null;this.obstacles=[];this.mountVisuals={};this.mountingState='isolated';this.originalBackground=this.scene.background?.clone();this.originalFog=this.scene.fog?.clone();
 }
 setScene(id,objects=[]){
  const aliases={'ep3':'canal','ep4':'workshop','ep5':'archive','ep6':'artisan','ep7':'artisan','mira-workshop':'artisan','3':'canal','4':'workshop','5':'archive','6':'artisan','7':'artisan'};
  id=aliases[String(id).toLowerCase()]||String(id).toLowerCase();
  if(id==='opening'||id==='shop'){this.clear();this.original.visible=true;this.scene.background=this.originalBackground;this.scene.fog=this.originalFog;return [];}
  if(!['canal','workshop','archive','artisan','tower'].includes(id))throw new RangeError('Unknown immersive scene '+id);
  this.clear();this.original.visible=false;this.id=id;this.active=new T.Group();this.active.name='arc-'+id;this.scene.add(this.active);
  this.scene.background=new T.Color(id==='canal'||id==='tower'?0x102939:0x1a2427);this.scene.fog=new T.Fog(this.scene.background,11,23);
  const k=makeKit(this.active,id);buildShell(k,id);this.barge=buildEnvironment(k,id)||null;
  this.obstacles=[];this.mountVisuals={};this.mountingState='isolated';
  for(const o of objects){if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y)||!o.id)continue;
   buildStation(k,id,o);if(id==='artisan'&&(o.id==='mounting'||o.id==='channel'))this.mountVisuals[o.id]=mountDisplay(k,o.x,o.y,o.id==='channel'?.76:1.18);const r=stationRadius(o);this.obstacles.push({id:o.id,x0:o.x-r,x1:o.x+r,y0:o.y-r,y1:o.y+r});
  }
  this.setMountingState('isolated');return this.obstacles.map(o=>({...o}));
 }
 setMountingState(state){if(!['isolated','carried','coupled'].includes(state))return false;this.mountingState=state;if(this.mountVisuals.mounting)this.mountVisuals.mounting.visible=state==='isolated';if(this.mountVisuals.channel)this.mountVisuals.channel.visible=state==='coupled';return true;}
 getObstacles(){return this.obstacles.map(o=>({...o}));}
 render(player,now=globalThis.performance?.now?.()??0){
  // Ambient-only motion: no game state or puzzle timing depends on the boat.
  if(this.barge){const reduced=this.motionQuery?.matches===true;if(!reduced){const phase=(now/22000)*Math.PI*2;this.barge.position.x=5.7+.55*Math.sin(phase);this.barge.position.y=.025*Math.sin(phase*1.6);}}
  this.owner.render(player);
 }
 clear(){if(!this.active)return;this.scene.remove(this.active);const geometries=new Set(),materials=new Set();this.active.traverse(o=>{if(o.geometry)geometries.add(o.geometry);const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m)materials.add(m);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();this.active=null;this.barge=null;this.obstacles=[];this.mountVisuals={};}
 dispose(){this.clear();this.original.visible=true;this.scene.background=this.originalBackground;this.scene.fog=this.originalFog;}
}
function stationRadius(){return .43;}
function makeKit(group,id){
 const mats={stone:new T.MeshStandardMaterial({color:id==='archive'?0x9b8c72:0x7b7769,roughness:.9}),dark:new T.MeshStandardMaterial({color:0x25333a,roughness:.85}),wood:new T.MeshStandardMaterial({color:0x63412b,roughness:.84}),woodDark:new T.MeshStandardMaterial({color:0x32231e,roughness:.9}),paper:new T.MeshStandardMaterial({color:0xd1bf9b,roughness:.95}),gold:new T.MeshStandardMaterial({color:0xc9a35e,metalness:.45,roughness:.5}),water:new T.MeshStandardMaterial({color:0x176a7c,metalness:.2,roughness:.3,emissive:0x0c313e,emissiveIntensity:.45}),crystal:new T.MeshPhysicalMaterial({color:0x7edee6,roughness:.2,metalness:.05,transparent:true,opacity:.76,emissive:0x105a70,emissiveIntensity:.4}),night:new T.MeshStandardMaterial({color:0x142d40,roughness:.95}),cloth:new T.MeshStandardMaterial({color:0x607075,roughness:1})};
 const box=(x,y,z,w,h,d,mat='wood')=>{let mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mats[mat]||mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
 const cyl=(x,y,z,r,h,mat='gold',r2=r)=>{let mesh=new T.Mesh(new T.CylinderGeometry(r,r2,h,12),mats[mat]||mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
 const gem=(x,y,z,s=.18)=>{let m=new T.Mesh(new T.OctahedronGeometry(s),mats.crystal);m.scale.set(.75,1.5,.75);m.position.set(x,y,z);group.add(m);return m;};
 const light=(x,y,z,color=0xffc46d,intensity=15,distance=4)=>{const l=new T.PointLight(color,intensity,distance,2);l.position.set(x,y,z);group.add(l);};
 return {group,mats,box,cyl,gem,light};
}
function buildShell(k,id){
 const {box}=k;const isNight=id==='canal'||id==='tower';box(4.5,-.13,4,7.2,.25,6.2,id==='canal'?'stone':'woodDark');
 if(id!=='canal'){box(4.5,3.12,4,7.2,.18,6.2,'woodDark');box(4.5,1.5,1,7.2,3,.16,isNight?'night':'stone');box(4.5,1.5,7,7.2,3,.16,isNight?'night':'stone');box(1,1.5,4,.16,3,6.2,isNight?'night':'stone');box(8,1.5,4,.16,3,6.2,isNight?'night':'stone');}
 else{box(4.5,.45,1,7.2,.9,.18,'stone');box(1,.45,4,.18,.9,6.2,'stone');box(8,.45,4,.18,.9,6.2,'stone');box(4.5,.45,7,7.2,.9,.18,'stone');box(4.5,.52,.93,7.2,.08,.25,'gold');}
 if(id!=='canal'){for(let x=1.3;x<8;x+=1.1){box(x,1.5,1.11,.08,2.9,.08,'wood');box(x,1.5,6.89,.08,2.9,.08,'wood');}for(let z=1.3;z<7;z+=1.2){box(1.11,1.5,z,.08,2.9,.08,'wood');box(7.89,1.5,z,.08,2.9,.08,'wood');}}
}
function buildEnvironment(k,id){const {box,cyl,gem,light}=k;
 if(id==='canal'){
  // Water below the observation wall and a slow-looking barge silhouette.
  box(4.5,-.25,.48,7.2,.06,.9,'water');
  // Group the same hull and cargo so the distant barge drifts as one object.
  const barge=new T.Group();barge.position.set(5.7,0,.5);k.group.add(barge);const boat=makeKit(barge,'canal');boat.box(0,-.04,0,1.65,.12,.45,'woodDark');for(let i=0;i<3;i++)boat.gem(-.45+i*.4,.12,0,.12);
  for(const x of [1.3,3,5,7.7]){cyl(x,.55,1.05,.12,1.1,'stone');gem(x,1.12,1.05,.1);}light(4,2,1,0x63c9e6,12,7);return barge;
 } else if(id==='workshop'){
  // Uncovered ancient wall under ordinary timber and a concealed-work alcove.
  box(6.5,1.4,1.13,2.2,1.7,.06,'stone');for(let i=0;i<3;i++)box(5.7+i*.72,1.4,1.21,.025,1.25,.025,'gold');
  box(1.5,1.7,1.15,.75,1.6,.07,'cloth');box(1.5,.95,1.25,.9,.1,.55,'wood');light(4.2,2.3,2,0xffc87b,18,6);
 } else if(id==='archive'){
  // Shelf walls, discrete ledgers and a quiet common lamp.
  for(const x of [1.65,3.1,4.55,6,7.4]){box(x,1.4,1.2,1.18,2.5,.38,'woodDark');for(const y of [.45,.95,1.45,1.95,2.4]){box(x,y,1.43,1.14,.07,.46,'wood');for(let n=0;n<5;n++)box(x-.42+n*.2,y+.16,1.45,.13,.25,.23,n%2?'paper':'wood');}}
  light(4.4,2.2,3,0xffc673,16,6);
 } else if(id==='artisan'){
  // A maker's mounting frames and little water model, not a portrait stand-in.
  box(4.5,.22,1.3,4.5,.3,.5,'wood');box(4.5,.4,1.3,4.2,.05,.25,'water');
  for(const x of [2,3.1,5.9,7]){cyl(x,1.1,1.3,.07,1.6,'gold');gem(x,1.85,1.3,.14);}light(5.2,2.1,2,0xffc773,18,6);light(3,1.1,1.7,0x56d4df,9,4);
 } else if(id==='tower'){
  // A communication bell, star chart and quiet blue night sky.
  for(const x of [2.3,4.5,6.7]){cyl(x,2.0,1.3,.32,.55,'gold',.52);box(x,2.4,1.3,.07,.55,.07,'gold');}
  box(4.5,1.7,1.1,2.5,1.7,.06,'night');for(let x=3.5;x<5.8;x+=.38)for(let y=1.1;y<2.4;y+=.4)gem(x,y,1.17,.025);light(4.5,2,2,0x7bc9e1,17,7);
 }
}
function buildStation(k,scene,o){
 const {box,cyl,gem,light}=k,x=o.x,z=o.y,label=`${o.id} ${o.label||''}`.toLowerCase();
 // Every selectable object has a physical station at its own world coordinate.
 if(/water|canal|reflection|barge|view/.test(label)){
  box(x,.62,z,.76,.16,.65,'stone');box(x,.72,z,.65,.035,.52,'water');for(let i=0;i<3;i++)box(x-.22+i*.2,.745,z,.035,.015,.4,'gold');
 }else if(/wall|mark|passage|cover/.test(label)){
  box(x,1.0,z,.72,1.7,.18,'stone');for(let i=0;i<3;i++)box(x-.23+i*.23,1.05,z+.11,.025,1,.025,'gold');
 }else if(/price|volume|ledger|record|notebook|sketch|chart|comparison|notes|research/.test(label)){
  box(x,.48,z,.72,.96,.72,'wood');box(x,.99,z,.82,.08,.82,'woodDark');box(x,1.05,z,.5,.025,.38,'paper');for(let n=0;n<3;n++)box(x-.15+n*.15,1.068,z,.08,.006,.27,'gold');
 }else if(/lamp/.test(label)){
  box(x,.48,z,.72,.96,.72,'wood');box(x,.99,z,.82,.08,.82,'woodDark');box(x,1.05,z,.45,.025,.34,'paper');cyl(x+.2,1.28,z,.065,.42,'gold');gem(x+.2,1.54,z,.1);light(x+.2,1.55,z,0xffc773,5,3);
 }else if(/crystal|shard|specimen|mount|array/.test(label)){
  box(x,.55,z,.72,1.1,.7,'wood');box(x,1.12,z,.8,.1,.78,'woodDark');if(o.id!=='mounting'){cyl(x,1.18,z,.22,.08,'gold');gem(x,1.43,z,.2);light(x,1.55,z,0x82dbe8,3,2);}
 }else if(/bell|instrument|resonan|harmonic|frequency|sound/.test(label)){
  box(x,.5,z,.72,1,.72,'woodDark');box(x,1.02,z,.82,.08,.8,'wood');cyl(x,1.25,z,.18,.35,'gold',.28);box(x,1.48,z,.05,.2,.05,'gold');
 }else if(/shelf|stack|book|ledger|archive|records/.test(label)){
  box(x,1.05,z,.74,2.1,.62,'woodDark');for(const y of [.45,.9,1.35,1.8]){box(x,y,z,.7,.06,.66,'wood');for(let n=0;n<3;n++)box(x-.23+n*.22,y+.15,z,.14,.25,.35,n%2?'wood':'paper');}
 }else{
  // Charts, tools and notices are presented on a table so they are visible at eye level.
  box(x,.48,z,.72,.96,.72,'wood');box(x,.99,z,.82,.08,.82,'woodDark');box(x,1.05,z,.45,.025,.34,'paper');
  for(let n=0;n<3;n++)box(x-.14+n*.14,1.068,z,.08,.006,.26,'gold');
 }
}

function mountDisplay(k,x,z,y){
 const group=new T.Group();group.position.set(x,y,z);k.group.add(group);
 const plate=new T.Mesh(new T.CylinderGeometry(.23,.23,.06,16),k.mats.gold);group.add(plate);
 const crystal=new T.Mesh(new T.OctahedronGeometry(.18),k.mats.crystal);crystal.scale.set(.75,1.45,.75);crystal.position.y=.24;group.add(crystal);
 for(const side of [-1,1]){const support=new T.Mesh(new T.BoxGeometry(.045,.28,.045),k.mats.gold);support.position.set(side*.21,.17,0);group.add(support);}
 return group;
}
