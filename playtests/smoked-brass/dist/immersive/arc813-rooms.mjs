import * as T from './vendor/three.module.js';
/**
 * Ep8–13 physical sets, using the existing Room3D renderer and camera.
 * setScene('barge'|'warehouse'|'passage', objects, worldState) returns collision AABBs.
 * Warehouse geometry stays consistent across Ep9–12; world-state controls only the
 * earned wall marking/passage reveal. Calls contain no game progression logic.
 */
export class Arc813Rooms {
 constructor(owner){
  if(!owner?.scene||!owner?.renderer||!owner?.camera)throw new TypeError('Arc813Rooms requires the existing Room3D renderer');
  this.owner=owner;this.scene=owner.scene;this.shop=owner.shop;this.baseBackground=this.scene.background?.clone();this.baseFog=this.scene.fog?.clone();
  this.motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')??null;this.active=null;this.obstacles=[];this.marking=null;this.passage=null;this.water=null;this.arrayVisuals={};this.projections={};this.experimentVisuals={};this.modelLayers={};this.workbenchGlow=null;
 }
 setScene(id,objects=[],worldState={}){
  const aliases={ep8:'barge',dock:'barge',navigation:'barge',ep9:'warehouse',ep10:'warehouse',ep11:'warehouse',ep12:'warehouse',escape:'warehouse',ep13:'passage',chamber:'passage'};
  id=aliases[String(id).toLowerCase()]||String(id).toLowerCase();
  if(id==='opening'||id==='shop'){this.clear();if(this.shop)this.shop.visible=true;this.scene.background=this.baseBackground;this.scene.fog=this.baseFog;return [];}
  if(!['barge','warehouse','passage'].includes(id))throw new RangeError('Unknown Ep8–13 environment '+id);
  this.clear();if(this.shop)this.shop.visible=false;this.id=id;this.active=new T.Group();this.active.name='ep8-13-'+id;this.scene.add(this.active);
  this.scene.background=new T.Color(id==='barge'?0x102d3d:0x172529);this.scene.fog=new T.Fog(this.scene.background,10,24);
  const k=createKit(this.active);shell(k,id);const environment=buildEnvironment(k,id);this.marking=environment.marking||null;this.passage=environment.passage||null;this.water=environment.water||null;this.projections=environment.projections||{};this.workbenchGlow=environment.workbenchGlow||null;this.arrayVisuals={};this.experimentVisuals={};this.modelLayers={};this.obstacles=id==='warehouse'?[{id:'warehouse-workbench',x0:1.05,x1:2.10,y0:6.10,y1:6.95}]:[];
  for(const object of objects){if(!object||!object.id||!Number.isFinite(object.x)||!Number.isFinite(object.y))continue;station(k,id,object);if(id==='warehouse'&&['array','west','center','east'].includes(object.id))this.arrayVisuals[object.id]=arrayDisplay(k,object.x,object.y);if(id==='warehouse'&&['specimen-setup','marked-wall','water-channel'].includes(object.id)){const loc=object.id==='specimen-setup'?'bench':object.id==='marked-wall'?'wall':'channel';this.experimentVisuals[loc]=experimentDisplays(k,object.x,object.y);}if(id==='warehouse'&&object.id==='city-model')this.modelLayers=cityLayers(k,object.x,object.y);const r=.42;this.obstacles.push({id:object.id,x0:object.x-r,x1:object.x+r,y0:object.y-r,y1:object.y+r});}
  this.setStoryState(worldState.episode||0,worldState,worldState.placement||'none');return this.getObstacles();
 }
 setWorldState(state={}){this.setStoryState(state.episode||0,state,state.placement||'none');}
 setStoryState(episode,flags={},placement='none'){
  // Earned evidence only; an episode number alone never grants discovery.
  const data=flags||{},f={...(data.history?.flags||{}),...(data.flags||data)};
  const wall=Boolean(f.wallRevealed||f.mapRevealed||f.wall_revealed||f.marked_wall||f.wall||f.matched||f.opened||f.passageOpen||f.ep9_conclusion||data.samples?.wall_paired);
  const opened=Boolean(f.opened||f.passageOpen);
  if(this.marking)this.marking.visible=wall;if(this.passage)this.passage.visible=opened;if(this.workbenchGlow)this.workbenchGlow.visible=Boolean(f.ep9_conclusion);
  const loc=data.apparatus||'bench';for(const [place,views] of Object.entries(this.experimentVisuals)){for(const mode of ['single','paired'])if(views[mode])views[mode].visible=loc===place&&data.setup===mode;}
  for(const key of ['architecture','water','astronomy'])if(this.modelLayers[key])this.modelLayers[key].visible=Boolean(f[key]);
  this.setArrayPlacement(data.placement||placement);
 }
 setArrayPlacement(placement='none'){
  if(!['none','carried','west','center','east'].includes(placement))return false;
  for(const [id,obj] of Object.entries(this.arrayVisuals))obj.visible=(placement==='none'&&id==='array')||placement===id;
  for(const [id,obj] of Object.entries(this.projections))obj.visible=placement===id;
  return true;
 }
 getObstacles(){return this.obstacles.map(x=>({...x}));}
 render(player,now=globalThis.performance?.now?.()??0){
  if(this.water){const still=this.motion?.matches===true;this.water.position.y=still?0:Math.sin(now/1700)*.014;}
  this.owner.render(player);
 }
 clear(){if(!this.active)return;this.scene.remove(this.active);const gs=new Set(),ms=new Set();this.active.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)ms.add(m);});for(const g of gs)g.dispose();for(const m of ms)m.dispose();this.active=null;this.obstacles=[];this.marking=null;this.passage=null;this.water=null;this.arrayVisuals={};this.projections={};this.experimentVisuals={};this.modelLayers={};this.workbenchGlow=null;}
 dispose(){this.clear();if(this.shop)this.shop.visible=true;this.scene.background=this.baseBackground;this.scene.fog=this.baseFog;}
}
function createKit(group){
 const mats={wood:new T.MeshStandardMaterial({color:0x60402d,roughness:.87}),dark:new T.MeshStandardMaterial({color:0x30241f,roughness:.92}),stone:new T.MeshStandardMaterial({color:0x746b5d,roughness:.98}),sand:new T.MeshStandardMaterial({color:0xa6987d,roughness:.96}),gold:new T.MeshStandardMaterial({color:0xc3a05b,metalness:.45,roughness:.48}),paper:new T.MeshStandardMaterial({color:0xd0bd96,roughness:.95}),cloth:new T.MeshStandardMaterial({color:0x556a70,roughness:1}),water:new T.MeshStandardMaterial({color:0x12677a,roughness:.26,metalness:.24,emissive:0x082e39,emissiveIntensity:.6}),crystal:new T.MeshPhysicalMaterial({color:0x7fd9dd,roughness:.22,metalness:.05,transparent:true,opacity:.76,emissive:0x105967,emissiveIntensity:.45}),glow:new T.MeshStandardMaterial({color:0x8eeaf0,emissive:0x48c4d5,emissiveIntensity:1.4,roughness:.35})};
 const box=(x,y,z,w,h,d,mat='wood',parent=group)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mats[mat]||mat);m.position.set(x,y,z);parent.add(m);return m;};
 const cyl=(x,y,z,r,h,mat='gold',parent=group)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,h,12),mats[mat]||mat);m.position.set(x,y,z);parent.add(m);return m;};
 const gem=(x,y,z,size=.16,parent=group)=>{const m=new T.Mesh(new T.OctahedronGeometry(size),mats.crystal);m.position.set(x,y,z);m.scale.set(.75,1.5,.75);parent.add(m);return m;};
 const light=(x,y,z,color=0xffc177,intensity=12,distance=5)=>{const l=new T.PointLight(color,intensity,distance,2);l.position.set(x,y,z);group.add(l);};
 return {group,mats,box,cyl,gem,light};
}
function shell(k,id){const {box}=k;
 box(4.5,-.13,4,7.2,.25,6.2,id==='passage'?'stone':'dark');
 if(id==='barge'){
  // A deck bounded by rails, not a free-floating image. Water sits outside the deck.
  for(let x=1.15;x<8;x+=.45)box(x,.01,4,.025,.02,6,'wood');
  for(const x of [1.05,7.95]){box(x,.66,4,.08,.1,6,'gold');for(let z=1.2;z<7;z+=1.1)box(x,.35,z,.07,.7,.07,'wood');}
  for(const z of [1.05,6.95]){box(4.5,.66,z,7,.1,.08,'gold');for(let x=1.3;x<8;x+=1.1)box(x,.35,z,.07,.7,.07,'wood');}
 }else{
  box(4.5,3.1,4,7.2,.18,6.2,'dark');for(const z of [1.02,6.98])box(4.5,1.5,z,7.2,3,.15,'stone');for(const x of [1.02,7.98])box(x,1.5,4,.15,3,6.2,'stone');
  for(let x=1.4;x<8;x+=1.1){box(x,1.5,1.12,.11,3,.1,'dark');box(x,1.5,6.88,.11,3,.1,'dark');}for(let z=1.4;z<7;z+=1.2){box(1.12,1.5,z,.1,3,.11,'dark');box(7.88,1.5,z,.1,3,.11,'dark');}
  for(const y of [.2,2.75])for(const z of [1.14,6.86])box(4.5,y,z,7,.1,.1,'wood');
 }
}
function buildEnvironment(k,id){const {group,box,cyl,gem,light}=k;
 if(id==='barge'){
  const water=new T.Group();group.add(water);for(const x of [.45,8.55])box(x,-.45,4,1,.08,8,'water',water);for(const z of [.45,7.55])box(4.5,-.45,z,7,.08,1,'water',water);
  // Stowed cargo and a mast outside navigation paths.
  for(const x of [2,3.1,6.1,7.2]){box(x,.45,1.24,.75,.9,.35,'wood');gem(x,.98,1.28,.14);}cyl(4.5,1.65,1.2,.08,3.3,'wood');box(4.5,2.8,1.2,2.2,.07,.07,'wood');light(4.3,1.9,2,0x5bc9de,14,7);return {water};
 }
 if(id==='warehouse'){
  // Same warehouse shell, joists and surrounding canal across four episodes.
  for(const x of [1.5,3,4.5,6,7.5]){box(x,2.9,4,.12,.18,5.8,'wood');box(x,1.45,1.22,.14,2.85,.1,'wood');}
  for(const z of [1.7,3.4,5.1,6.6])box(1.3,.24,z,.45,.5,1,'water');
  // The old marking is hidden until discovery; opened doorway is a separate group.
  const marking=new T.Group();group.add(marking);marking.position.set(6.25,1.45,1.14);
  const line=(x,y,w,h)=>box(x,y,.02,w,h,.035,'glow',marking);
  line(0,0,.055,1.45);line(-.3,-.22,.6,.045);line(.3,-.22,.6,.045);line(-.23,.25,.055,.55);line(.23,.25,.055,.55);marking.visible=false;
  const passage=new T.Group();group.add(passage);passage.position.set(6.25,0,1.18);box(0,1.2,0,1.05,2.4,.08,'dark',passage);for(const x of [-.56,.56])box(x,1.25,.05,.08,2.5,.12,'gold',passage);box(0,2.5,.05,1.2,.08,.12,'gold',passage);passage.visible=false;
  // A consistent workbench remains in the south-west corner across Ep9–12,
  // independent of the episode's interaction stations. The paired specimens and
  // notebook remain physically present; only their earned response illuminates.
  box(1.58,.82,6.55,.94,.12,.55,'wood');for(const x of [1.22,1.94])for(const z of [6.37,6.73])box(x,.4,z,.07,.8,.07,'dark');
  box(1.37,.9,6.58,.33,.025,.25,'paper');gem(1.68,1.08,6.54,.12);gem(1.9,1.08,6.54,.12);
  const workbenchGlow=new T.Group();group.add(workbenchGlow);workbenchGlow.visible=false;for(const [x,z] of [[1.68,6.54],[1.9,6.54]]){const halo=new T.Mesh(new T.TorusGeometry(.12,.012,6,24),k.mats.glow);halo.rotation.x=Math.PI/2;halo.position.set(x,1.15,z);workbenchGlow.add(halo);}
  const projections={};for(const [name,x,z] of [['west',1.8,3.6],['center',4.5,2.8],['east',7,3.6]]){const groupLines=new T.Group();group.add(groupLines);const dest=name==='center'?[[6.05,1.8],[6.25,1.8],[6.45,1.8]]:name==='west'?[[4.7,1.8],[5.1,1.8],[5.5,1.8]]:[[6.8,1.8],[7.2,1.8],[7.6,1.8]];for(const [dx,dz] of dest){const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(x,1.35,z),new T.Vector3(dx,1.45,dz)]);groupLines.add(new T.Line(geo,new T.LineBasicMaterial({color:0x7ee6ee,transparent:true,opacity:.75})));}groupLines.visible=false;projections[name]=groupLines;}
  light(3.4,2.2,3.8,0xffbb77,14,6);light(6.3,1.5,1.8,0x66d7e3,7,4);return {marking,passage,projections,workbenchGlow};
 }
 // Dark, older passage; recognizable water channels lead forward.
 for(const x of [1.35,7.65]){box(x,.12,4,.26,.18,6,'water');for(let z=1.5;z<7;z+=1.15)gem(x,.28,z,.07);}
 for(const x of [2.1,4.5,6.9]){box(x,1.5,1.16,.18,2.8,.18,'sand');box(x,1.5,6.84,.18,2.8,.18,'sand');}
 light(4.5,1.7,2,0x65cbd9,15,7);return {};
}
function station(k,scene,object){const {box,cyl,gem,light}=k,x=object.x,z=object.y,label=`${object.id} ${object.label||''}`.toLowerCase();
 // Each target is 3D geometry at the tested collision point, not an overlay sprite.
 if(scene==='passage'&&object.id==='doorway'){box(x,1.1,z,.7,2.2,.08,'dark');for(const dx of [-.4,.4])box(x+dx,1.15,z,.08,2.3,.16,'gold');box(x,2.3,z,.88,.08,.16,'gold');}
 else if(['array','west','center','east','specimen-setup'].includes(object.id)){box(x,.48,z,.78,.96,.78,'wood');box(x,.99,z,.84,.08,.84,'dark');cyl(x,1.08,z,.23,.06,'gold');}
 else if(/water|canal|reflection|channel|vision/.test(label)){
  box(x,.55,z,.8,1.1,.8,'stone');box(x,1.12,z,.75,.045,.7,'water');for(const dx of [-.2,0,.2])box(x+dx,1.15,z,.025,.02,.53,'glow');
 }else if(/crystal|specimen|array|mount|resonan|instrument/.test(label)){
  box(x,.48,z,.8,.96,.8,'wood');box(x,.99,z,.85,.08,.85,'dark');cyl(x,1.1,z,.23,.08,'gold');gem(x,1.35,z,.19);light(x,1.45,z,0x7fdce3,4,2);
 }else if(/wall|mark|door|passage|exit/.test(label)){
  box(x,1.02,z,.78,2.04,.16,'stone');for(const dx of [-.22,0,.22])box(x+dx,1.1,z+.1,.035,1.35,.025,'gold');
 }else if(/map|chart|model|ledger|record|signal|note|evidence/.test(label)){
  box(x,.48,z,.78,.96,.78,'wood');box(x,.99,z,.85,.08,.85,'dark');box(x,1.05,z,.52,.025,.38,'paper');for(const dx of [-.16,0,.16])box(x+dx,1.07,z,.07,.008,.28,'gold');
 }else if(/cargo|crate|barg|ship/.test(label)){
  box(x,.42,z,.8,.84,.8,'wood');for(const y of [.12,.7])box(x,y,z+.41,.8,.05,.025,'gold');gem(x,1,z,.12);
 }else{
  box(x,.48,z,.78,.96,.78,'wood');box(x,.99,z,.84,.08,.84,'dark');box(x,1.05,z,.48,.025,.36,'paper');
 }
}

function arrayDisplay(k,x,z){const g=new T.Group();g.position.set(x,1.12,z);k.group.add(g);const base=new T.Mesh(new T.CylinderGeometry(.23,.23,.06,16),k.mats.gold);g.add(base);for(const [dx,dz] of [[-.13,0],[.13,0],[0,.13]]){const crystal=new T.Mesh(new T.OctahedronGeometry(.13),k.mats.crystal);crystal.scale.set(.7,1.4,.7);crystal.position.set(dx,.2,dz);g.add(crystal);}return g;}

function experimentDisplays(k,x,z){
 const make=count=>{const g=new T.Group();g.position.set(x,1.12,z);k.group.add(g);for(let i=0;i<count;i++){const m=new T.Mesh(new T.OctahedronGeometry(.14),k.mats.crystal);m.scale.set(.7,1.4,.7);m.position.set((i-(count-1)/2)*.3,.18,0);g.add(m);}g.visible=false;return g;};
 return {single:make(1),paired:make(2)};
}
function cityLayers(k,x,z){
 const make=()=>{const g=new T.Group();g.position.set(x,1.08,z);k.group.add(g);g.visible=false;return g;},architecture=make(),water=make(),astronomy=make();
 for(const radius of [.14,.25,.35]){const ring=new T.Mesh(new T.TorusGeometry(radius,.012,6,32),k.mats.gold);ring.rotation.x=Math.PI/2;architecture.add(ring);}
 for(const radius of [.19,.3]){const ring=new T.Mesh(new T.TorusGeometry(radius,.01,6,32),k.mats.water);ring.rotation.x=Math.PI/2;ring.position.y=.025;water.add(ring);}
 for(const [dx,dz] of [[0,0],[-.2,.12],[.21,.1],[0,-.26]]){const star=new T.Mesh(new T.OctahedronGeometry(.035),k.mats.glow);star.position.set(dx,.08,dz);astronomy.add(star);}
 return {architecture,water,astronomy};
}
