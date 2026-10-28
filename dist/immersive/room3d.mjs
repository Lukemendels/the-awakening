import * as T from './vendor/three.module.js';
/** An authored, walkable 3D shop. Coordinates match engine.mjs's collision map. */
export class Room3D {
 constructor(canvas){
  this.canvas=canvas;this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.3));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
  this.scene=new T.Scene();this.scene.background=new T.Color(0x102b36);this.scene.fog=new T.Fog(0x1c3033,8,22);this.camera=new T.PerspectiveCamera(68,1,.05,40);this.scene.add(new T.HemisphereLight(0x8ccddd,0x342014,1.25));
  const ambient=new T.AmbientLight(0xb5a38a,.3);this.scene.add(ambient);
  const sun=new T.DirectionalLight(0xffdc9d,2.1);sun.position.set(8,4,3);this.scene.add(sun);
  const lamp=new T.PointLight(0xffbb59,32,6,2);lamp.position.set(7.05,1.35,1.58);this.scene.add(lamp);
  this.shop=new T.Group();this.scene.add(this.shop);
  const wood=new T.MeshStandardMaterial({color:0x563925,roughness:.84}), dark=new T.MeshStandardMaterial({color:0x2d201a,roughness:.9}),plaster=new T.MeshStandardMaterial({color:0x9b8a6e,roughness:1}),gold=new T.MeshStandardMaterial({color:0xc49a55,metalness:.55,roughness:.42}),paper=new T.MeshStandardMaterial({color:0xd5c5a0,roughness:.9}),crystal=new T.MeshPhysicalMaterial({color:0x80d6da,metalness:.05,roughness:.18,transparent:true,opacity:.72,emissive:0x1c6872,emissiveIntensity:.28});
  const box=(x,y,z,w,h,d,mat)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);this.shop.add(m);return m;};
  box(4.5,-.13,4,7.2,.25,6.2,wood);box(4.5,3.15,4,7.2,.2,6.2,dark);
  box(4.5,1.5,.93,7.2,3,.16,plaster);box(4.5,1.5,7.07,7.2,3,.16,plaster);box(.93,1.5,4,.16,3,6.2,plaster);box(8.07,1.5,4,.16,3,6.2,plaster);
  // Structural wall beams, floorboard seams and timber trim.
  for(let x=1.2;x<8;x+=.65){box(x,.01,4,.025,.01,6,dark);box(x,1.5,1.04,.08,3,.06,wood);box(x,1.5,6.96,.08,3,.06,wood);}
  for(let z=1.2;z<7;z+=1){box(1.04,1.5,z,.06,3,.08,wood);box(7.96,1.5,z,.06,3,.08,wood);}
  for(let z of [1.05,6.95])for(let y of [.18,2.85])box(4.5,y,z,7,.12,.1,wood);
  // Large east-facing canal window, with still used as scenery rather than room geometry.
  const tex=new T.TextureLoader().load('../assets/6_Night Canal.webp');tex.colorSpace=T.SRGBColorSpace;
  const windowMat=new T.MeshBasicMaterial({map:tex});const windowPlane=new T.Mesh(new T.PlaneGeometry(2.2,1.8),windowMat);windowPlane.position.set(7.96,1.8,3.4);windowPlane.rotation.y=-Math.PI/2;this.shop.add(windowPlane);
  for(const z of [2.25,3.4,4.55])box(7.87,1.8,z,.12,2,.09,wood);for(const y of [.85,1.8,2.75])box(7.87,y,3.4,.12,.09,2.4,wood);
  // Crystal shelf on north wall: shelves, specimens, and a lamp.
  box(2.1,1.15,1.2,1.35,2.1,.34,dark);for(const y of [.45,1,1.55,2.05])box(2.1,y,1.4,1.3,.07,.38,wood);
  const gem=(x,y,z,scale=1,mat=crystal)=>{const m=new T.Mesh(new T.OctahedronGeometry(.16*scale,0),mat);m.scale.set(.65,1.5,.65);m.position.set(x,y,z);this.shop.add(m);return m;};
  for(const [x,y,sc] of [[1.7,.7,.7],[2.05,.7,1],[2.4,.7,.55],[1.85,1.25,.75],[2.25,1.25,.9],[2.1,1.8,.6]])gem(x,y,1.52,sc);
  // Notebook on a small side desk, and drawer across the room.
  box(1.5,.85,4.5,1.05,.12,.75,wood);for(let x of [1.12,1.88])for(let z of [4.25,4.75])box(x,.42,z,.08,.85,.08,dark);box(1.5,.94,4.5,.55,.035,.4,paper);box(1.5,.96,4.5,.02,.01,.38,dark);
  box(7.34,.48,4.5,.72,.96,.95,wood);for(let y of [.25,.53,.81]){box(7.0,y,4.5,.02,.22,.75,dark);box(6.97,y,4.5,.03,.04,.12,gold);}
  // Lamp, tray and specimen station; backlit from the window side.
  box(6.55,.85,1.58,1.45,.12,.75,wood);for(let x of [6.0,7.1])for(let z of [1.34,1.82])box(x,.42,z,.09,.85,.09,dark);
  box(7.05,1.07,1.58,.16,.4,.16,gold);gem(7.05,1.35,1.58,.85,new T.MeshStandardMaterial({color:0xffd88a,emissive:0xd58a32,emissiveIntensity:2,roughness:.3}));this.specimen=gem(6.4,1.12,1.58,.9,crystal.clone());this.specimen.visible=false;
  // Hanging lamps and decorative crystal rhythm establish a lived-in shop.
  for(const [x,z] of [[3,3.5],[6,5.8]]){box(x,2.5,z,.025,1,.025,gold);box(x,1.95,z,.35,.08,.35,gold);gem(x,2.12,z,.6);}
 }
 render(player){const rect=this.canvas.getBoundingClientRect(),w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));if(this.w!==w||this.h!==h){this.w=w;this.h=h;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.fov=Math.min(110,2*Math.atan(Math.tan(70*Math.PI/360)/(w/h))*180/Math.PI);this.camera.updateProjectionMatrix();}this.camera.position.set(player.x,1.55,player.y);this.camera.lookAt(player.x+Math.cos(player.angle),1.55+Math.tan(player.pitch||0),player.y+Math.sin(player.angle));this.specimen.visible=Boolean(player.flags?.placed);if(this.specimen.visible)this.specimen.material.color.set(player.flags.specimen==='approved'?0xc7e8ea:0x80d6da);this.camera.updateMatrixWorld();this.renderer.render(this.scene,this.camera);}
 get interactionHalfAngle(){return Math.atan(Math.tan(this.camera.fov*Math.PI/360)*this.camera.aspect)*.9;}
 dispose(){this.renderer.dispose();}
}
