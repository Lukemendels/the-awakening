import * as T from './vendor/three.module.js';
/** Authored physical environments for Ep14–24. Uses the existing Room3D camera,
 * movement and interaction raycast. Story logic remains in the episode modules. */
export class FinalArcRooms {
 constructor(owner){
  if(!owner?.scene||!owner?.renderer||!owner?.camera)throw new TypeError('FinalArcRooms requires the existing Room3D renderer');
  this.owner=owner;this.scene=owner.scene;this.shop=owner.shop;this.baseBackground=this.scene.background?.clone();this.baseFog=this.scene.fog?.clone();this.motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')??null;this.active=null;this.obstacles=[];this.stateful={};this.placements={};this.water=null;
 }
 setScene(id,objects=[],worldState={}){
  id=String(id).toLowerCase();const aliases={ep14:'chamber',ep15:'chamber',ep16:'chamber',ep17:'chamber',ep18:'high-temple',ep19:'high-temple',ep20:'high-temple',ep21:'hidden-path',ep22:'temple-records',ep23:'city',ep24:'library',restoration:'city'};id=aliases[id]||id;
  if(id==='shop'||id==='opening'){this.clear();if(this.shop)this.shop.visible=true;this.scene.background=this.baseBackground;this.scene.fog=this.baseFog;return [];}
  if(!['chamber','high-temple','hidden-path','temple-records','city','library'].includes(id))throw new RangeError('Unknown Ep14–24 environment '+id);
  this.clear();if(this.shop)this.shop.visible=false;this.id=id;this.active=new T.Group();this.active.name='ep14-24-'+id;this.scene.add(this.active);this.scene.background=new T.Color(['city','library'].includes(id)?0x314f58:0x102e38);this.scene.fog=new T.Fog(this.scene.background,10,24);
  const k=kit(this.active);shell(k,id);environment(this,k,id);
  for(const o of objects){if(!o?.id||!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;station(k,o,id);if(id==='chamber'&&['array','grammar'].includes(o.id)){const group=arrayModel(k,o.x,o.y);this.placements[o.id==='array'?'bench':'channel']=group;}if(id==='city'&&['central-channel','outer-channel'].includes(o.id)){const group=arrayModel(k,o.x,o.y);this.placements[o.id==='central-channel'?'center':'outer']=group;}const r=.42;this.obstacles.push({id:o.id,x0:o.x-r,x1:o.x+r,y0:o.y-r,y1:o.y+r});}
  this.setWorldState(worldState);return this.getObstacles();
 }
 setWorldState(state={}){const f={...(state.history?.flags||{}),...(state.flags||{})};for(const [key,g] of Object.entries(this.stateful))g.visible=Boolean(f[key]);const place=this.id==='chamber'?(state.placement||'bench'):(state.distribution||'center');for(const [key,g] of Object.entries(this.placements))g.visible=place===key;}
 setStoryState(episode,flags={}){this.setWorldState({...flags,episode});}
 getObstacles(){return this.obstacles.map(o=>({...o}));}
 render(player,now=globalThis.performance?.now?.()??0){if(this.water)this.water.position.y=this.motion?.matches?0:Math.sin(now/1700)*.012;this.owner.render(player);}
 clear(){if(!this.active)return;this.scene.remove(this.active);const gs=new Set(),ms=new Set();this.active.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)ms.add(m);});for(const g of gs)g.dispose();for(const m of ms)m.dispose();this.active=null;this.obstacles=[];this.stateful={};this.placements={};this.water=null;}
 dispose(){this.clear();if(this.shop)this.shop.visible=true;this.scene.background=this.baseBackground;this.scene.fog=this.baseFog;}
}
function kit(group){
 const mat={stone:new T.MeshStandardMaterial({color:0x6d756e,roughness:.92}),sand:new T.MeshStandardMaterial({color:0xb0a688,roughness:.95}),dark:new T.MeshStandardMaterial({color:0x28363a,roughness:.9}),wood:new T.MeshStandardMaterial({color:0x684b36,roughness:.85}),gold:new T.MeshStandardMaterial({color:0xb99857,metalness:.5,roughness:.4}),paper:new T.MeshStandardMaterial({color:0xdbcca4,roughness:1}),water:new T.MeshStandardMaterial({color:0x238698,metalness:.2,roughness:.3,emissive:0x063b4a,emissiveIntensity:.8}),glow:new T.MeshStandardMaterial({color:0x88edf0,emissive:0x30c3d8,emissiveIntensity:1.4}),crystal:new T.MeshPhysicalMaterial({color:0x91e5e9,roughness:.2,transparent:true,opacity:.83,emissive:0x196775,emissiveIntensity:.6})};
 const box=(x,y,z,w,h,d,m='stone',p=group)=>{const q=new T.Mesh(new T.BoxGeometry(w,h,d),mat[m]||m);q.position.set(x,y,z);p.add(q);return q;},cyl=(x,y,z,r,h,m='gold',p=group)=>{const q=new T.Mesh(new T.CylinderGeometry(r,r,h,16),mat[m]);q.position.set(x,y,z);p.add(q);return q;},gem=(x,y,z,r=.15,p=group)=>{const q=new T.Mesh(new T.OctahedronGeometry(r),mat.crystal);q.scale.y=1.5;q.position.set(x,y,z);p.add(q);return q;},light=(x,y,z,c=0x6ddce8,n=12,d=7)=>{const q=new T.PointLight(c,n,d,2);q.position.set(x,y,z);group.add(q);};return {group,mat,box,cyl,gem,light};
}
function shell(k,id){const {box}=k,open=['city','library'].includes(id);box(4.5,-.13,4,7.2,.25,6.2,open?'sand':'stone');if(!open)box(4.5,3.1,4,7.2,.18,6.2,'dark');for(const z of [1.02,6.98]){if(id==='library'&&z===1.02){box(1.8,1.5,z,1.6,3,.15,'sand');box(7.2,1.5,z,1.6,3,.15,'sand');box(4.5,.45,z,3.8,.9,.15,'sand');box(4.5,2.75,z,3.8,.5,.15,'sand');box(4.5,1.6,z-1.8,3.8,1.7,.06,'water');for(const x of [3,3.8,5.2,6]){box(x,1.2,z-1.3,.35,.55,.12,'sand');box(x,1.52,z-1.3,.42,.1,.14,'gold');}}else box(4.5,1.5,z,7.2,3,.15,open?'sand':'stone');}for(const x of [1.02,7.98])box(x,1.5,4,.15,3,6.2,open?'sand':'stone');for(const x of [1.3,3.1,5.9,7.7])for(const z of [1.16,6.84])box(x,1.5,z,.16,3,.15,open?'gold':'dark');}
function environment(owner,k,id){const {group,box,cyl,gem,light}=k;
 if(id==='chamber'){
  owner.water=new T.Group();group.add(owner.water);for(const x of [1.35,7.65]){box(x,.08,4,.25,.09,5.5,'water',owner.water);for(let z=1.5;z<7;z+=1)gem(x,.18,z,.06,owner.water);}for(let x=2;x<=7;x+=1){box(x,2.45,1.14,.035,.035,1.4,'glow');gem(x,2.1,1.23,.08);}for(let i=0;i<8;i++)box(1.2,.45+i*.26,1.5+i*.65,.06,.07,.55,'glow');light(4.5,2,2,0x56cbdc,16,8);light(4.5,2,6,0xffbd78,8,7);
 }else if(id==='high-temple'){
  for(const x of [1.28,7.72]){box(x,1.4,4,.14,2.8,.2,'sand');for(let z=1.5;z<7;z+=1)box(x,2.15,z,.05,.05,.6,'glow');}for(let x=2;x<8;x+=1.1){box(x,.06,1.28,.8,.12,.35,'sand');box(x,2.7,6.84,.5,.08,.1,'gold');}for(const x of [2.4,4.5,6.6]){const shaft=new T.Mesh(new T.CylinderGeometry(.22,.35,2.7,16,1,true),new T.MeshBasicMaterial({color:0xadeff0,transparent:true,opacity:.09,side:T.DoubleSide,depthWrite:false}));shaft.position.set(x,1.65,1.38);group.add(shaft);}light(4.5,2.5,4,0xffc885,15,9);light(2,1.5,3,0x6bcfe1,8,5);
 }else if(id==='hidden-path'){
  owner.water=new T.Group();group.add(owner.water);for(const x of [1.34,7.66]){box(x,.09,4,.3,.1,5.5,'water',owner.water);for(let z=1.5;z<7;z+=1.1)gem(x,.24,z,.07,owner.water);}for(const x of [2.2,4.5,6.8]){box(x,1.5,1.2,.2,3,.18,'sand');box(x,1.5,6.8,.2,3,.18,'sand');}light(4.5,1.8,2,0x72d8e2,15,8);
 }else if(id==='temple-records'){
  for(const z of [1.2,6.8])for(const x of [1.6,3.1,5.9,7.4]){box(x,1.2,z,1.1,2.4,.25,'wood');for(const y of [.5,1.1,1.7,2.2]){box(x,y,z+.16,1,.05,.1,'gold');for(let i=-2;i<=2;i++)box(x+i*.18,y+.2,z+.16,.11,.32,.12,'paper');}}light(4.5,2,3,0xffc888,16,8);
 }else if(id==='city'){
  owner.water=new T.Group();group.add(owner.water);for(const x of [1.34,7.66])box(x,.04,4,.28,.08,5.5,'water',owner.water);for(const z of [1.3,6.7]){for(let x=1.7;x<7.5;x+=1.5){cyl(x,.62,z,.08,1.24,'gold');gem(x,1.4,z,.15);}}light(4.5,2,4,0xffd092,15,9);light(2,1,3,0x78e0e8,8,6);
 }else if(id==='library'){
  // Highest temple chamber: an open view, not Mira's future library already built.
  for(const x of [1.3,7.7]){cyl(x,1.45,4,.14,2.9,'sand');gem(x,2.95,4,.14);}for(const z of [1.25,6.75])for(const x of [2,3.5,5.5,7]){box(x,.15,z,.8,.25,.18,'sand');box(x,2.7,z,.8,.1,.18,'gold');}light(4.5,2,4,0xffdba0,18,9);
 }
}
function station(k,o,id){const {box,cyl,gem,light}=k,x=o.x,z=o.y,label=`${o.id} ${o.label||''}`.toLowerCase();
 if(o.id==='grid'){box(x,.4,z,.78,.8,.72,'stone');box(x,1.36,z,.75,1,.08,'dark');for(const dx of [-.25,0,.25])box(x+dx,1.36,z+.05,.025,.8,.02,'glow');for(const dy of [-.3,0,.3])box(x,1.36+dy,z+.05,.6,.025,.02,'glow');}
 else if(o.id==='ascent'){box(x,.2,z,.8,.4,.8,'stone');for(let i=0;i<4;i++)box(x,.43+i*.16,z+.26-i*.16,.7,.15,.17,'sand');for(const dx of [-.28,.28])box(x+dx,1,z,.035,.035,.62,'glow');}
 else if(o.id==='evidence-table'){box(x,.77,z,.82,.1,.78,'wood');for(const dx of [-.31,.31])for(const dz of [-.29,.29])box(x+dx,.38,z+dz,.07,.76,.07,'dark');for(const [dx,dz] of [[-.22,-.2],[.2,-.17],[0,.21]])box(x+dx,.84,z+dz,.24,.025,.22,'paper');box(x,.87,z,.04,.012,.6,'gold');}
 else if(o.id==='distribution'){box(x,.48,z,.8,.96,.8,'stone');for(const radius of [.15,.25,.35]){const ring=new T.Mesh(new T.TorusGeometry(radius,.018,6,32),k.mat.water);ring.rotation.x=Math.PI/2;ring.position.set(x,1.02,z);k.group.add(ring);}for(const [dx,dz] of [[0,0],[-.24,0],[.24,0]])gem(x+dx,1.11,z+dz,.06);}
 else if(id==='chamber'&&o.id==='grammar'){box(x,.46,z,.8,.92,.8,'stone');box(x,.94,z,.72,.04,.7,'dark');for(const dx of [-.15,0,.15])box(x+dx,.98,z,.035,.025,.55,'glow');}
 else if(/water|vision|memory|channel|pool/.test(label)){box(x,.46,z,.8,.92,.8,'stone');cyl(x,.96,z,.35,.07,'gold');cyl(x,1.01,z,.3,.03,'water');light(x,1.1,z,0x6ad5df,4,2);}
 else if(/crystal|resonan|instrument|grid|mechanism|network/.test(label)){box(x,.48,z,.8,.96,.8,'stone');cyl(x,.99,z,.3,.07,'gold');if(!(id==='chamber'&&o.id==='array'))gem(x,1.25,z,.19);light(x,1.4,z,0x79dce8,4,2);}
 else if(/door|passage|entrance|exit|path|stairs|ascent/.test(label)){box(x,1,z,.78,2,.14,'dark');for(const dx of [-.4,.4])box(x+dx,1.05,z,.08,2.1,.19,'gold');box(x,2.1,z,.87,.08,.19,'gold');}
 else if(/record|ledger|evidence|chart|map|book|script|writing|mark|inscription|library/.test(label)){box(x,.48,z,.8,.96,.8,'wood');box(x,1,z,.83,.08,.83,'dark');box(x,1.06,z,.55,.03,.4,'paper');for(const dx of [-.17,0,.17])box(x+dx,1.08,z,.04,.01,.28,'gold');}
 else{box(x,.48,z,.8,.96,.8,'stone');box(x,1,z,.83,.08,.83,'gold');gem(x,1.2,z,.12);}
}

function arrayModel(k,x,z){const g=new T.Group();g.position.set(x,1.07,z);k.group.add(g);const base=new T.Mesh(new T.CylinderGeometry(.23,.23,.05,16),k.mat.gold);g.add(base);for(const [dx,dz] of [[-.14,0],[.14,0],[0,.14]]){const c=new T.Mesh(new T.OctahedronGeometry(.12),k.mat.crystal);c.scale.y=1.5;c.position.set(dx,.2,dz);g.add(c);}return g;}
