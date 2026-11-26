import * as T from '../vendor/three.module.js';
import {RoomRenderer} from '../room3d.mjs';

const halfTurn=Math.PI, rightAngle=Math.PI/2;
const surface=(color,options={})=>new T.MeshStandardMaterial({color,roughness:.82,...options});
const lathe=points=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),24);

// Map the inclusions from the playable specimen onto the broad faces of an
// asymmetric quartz prism. Its silhouette and highlights change as you walk.
function quartzPrism(){
  const base=[],shoulder=[],top=[.24,1.28,.04],positions=[],uv=[];
  const radii=[.86,.73,1,.93,.69,.97];
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3,x=radii[i]*Math.cos(angle),z=radii[i]*Math.sin(angle);
    base.push([x,0,z]);shoulder.push([x*.8+.13,.84+.13*Math.sin(angle+.5),z*.78]);
  }
  function triangle(a,b,c,coords){positions.push(...a,...b,...c);uv.push(...coords);}
  for(let i=0;i<6;i++){
    const j=(i+1)%6;
    triangle(base[i],shoulder[i],base[j],[.18,.16,.58,.74,.43,.26]);
    triangle(base[j],shoulder[i],shoulder[j],[.43,.26,.58,.74,.80,.71]);
    triangle(shoulder[i],top,shoulder[j],[.40,.39,.82,.78,.68,.63]);
  }
  const shape=new T.BufferGeometry();
  shape.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  shape.setAttribute('uv',new T.Float32BufferAttribute(uv,2));shape.computeVertexNormals();return shape;
}

// Most of the joinery shares a handful of materials. Draw identical shapes
// together so another shelf of books does not cost another shelf of draw calls.
class Fixtures {
  constructor(scene){this.scene=scene;this.batches=new Map();this.boxShape=new T.BoxGeometry();this.stamp=new T.Object3D();}
  place(shape,mat,x,y,z,w=1,h=1,d=1,rx=0,ry=0,rz=0){
    const key=shape.uuid+mat.uuid;
    if(!this.batches.has(key))this.batches.set(key,{shape,mat,matrices:[]});
    this.stamp.position.set(x,y,z);this.stamp.scale.set(w,h,d);this.stamp.rotation.set(rx,ry,rz);this.stamp.updateMatrix();
    this.batches.get(key).matrices.push(this.stamp.matrix.clone());
  }
  box(...args){this.place(this.boxShape,...args);}
  finish(){
    for(const {shape,mat,matrices} of this.batches.values()){
      const mesh=new T.InstancedMesh(shape,mat,matrices.length);
      matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
      mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;this.scene.add(mesh);
    }
  }
}

export class ShopInterior extends RoomRenderer {
  constructor(canvas){
    super(canvas);
    const scene=this.scene, f=new Fixtures(scene);
    const loader=new T.TextureLoader();
    const texture=name=>{
      const tex=loader.load(new URL('../../assets/generated/'+name+'.webp',import.meta.url).href);
      tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());return tex;
    };
    const walnut=texture('shop-walnut'), lime=texture('shop-limewash');
    lime.wrapS=lime.wrapT=T.RepeatWrapping;lime.repeat.set(2.6,1.5);
    const wood=surface(0xf6dfba,{map:walnut}), dark=surface(0xa08776,{map:walnut});
    const brass=surface(0xb38b49,{metalness:.47,roughness:.37}), patina=surface(0x526357,{metalness:.35});
    const iron=surface(0x382e26),paper=surface(0xd4bb90),plaster=surface(0xf7e4c5,{map:lime});
    const leather=[0x73382b,0x38453b,0x6b502c].map(c=>surface(c));
    const page=surface(0xfff7e1,{map:texture('shop-field-notes')});
    const box=(...args)=>f.box(...args);
    const disc=new T.CylinderGeometry(1,1,1,24), ball=new T.SphereGeometry(1,16,10);
    const round=(mat,x,y,z,r,h)=>f.place(disc,mat,x,y,z,r,h,r);
    const photo=(name,x,y,z,w,h,yaw)=>{
      const mat=new T.MeshBasicMaterial({map:texture('shop-'+name),toneMapped:false});
      const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);mesh.rotation.y=yaw;scene.add(mesh);
    };

    scene.background=new T.Color(0x8497a1);
    const reflections=texture('shop-reflections');reflections.mapping=T.EquirectangularReflectionMapping;
    scene.environment=reflections;scene.environmentIntensity=.78;
    scene.add(new T.HemisphereLight(0xffedcf,0x9a8170,1.45));
    // Light crosses the true window opening. The furniture and mullions are
    // static, so all subsequent frames reuse the first directional shadow map.
    const sun=new T.DirectionalLight(0xffda9b,2.4);
    sun.position.set(12,4.3,1.2);sun.target.position.set(4.5,.1,4.25);scene.add(sun,sun.target);
    sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
    Object.assign(sun.shadow.camera,{left:-5,right:5,top:4,bottom:-4,near:.5,far:19});sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias=-.00035;sun.shadow.normalBias=.014;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;

    photo('survey-wall',4.5,1.55,1,7,3.1,0);
    photo('entry-wall',4.5,1.55,7,7,3.1,halfTurn);
    // The shop fits inside the sphere, including the full camera collision radius.
    // A grazing ray through the window still sees sky, quay or water.
    const panorama=texture('shop-canal-panorama');
    panorama.wrapS=T.RepeatWrapping;panorama.repeat.x=-1;
    const canal=new T.Mesh(new T.SphereGeometry(16,64,32),
      new T.MeshBasicMaterial({map:panorama,side:T.BackSide,toneMapped:false}));
    canal.position.set(7.9,1.24,3.42);scene.add(canal);
    photo('study-wall',1,1.55,4,6,3.1,rightAngle);
    for(const [z,length] of [[1.48,.96],[5.94,2.12]])box(plaster,8.07,1.55,z,.14,3.1,length);
    box(plaster,8.07,.43,3.42,.14,.86,2.92);box(plaster,8.07,2.99,3.42,.14,.22,2.92);
    box(dark,4.5,3.15,4,7,.1,6);
    for(const z of [1.13,2.6,4.15,5.7,6.88]){
      box(dark,4.5,3.015,z,7,.17,.14);
      for(const x of [1.13,7.87])box(wood,x,2.91,z,.22,.22,.19);
    }
    {
      const x=7.97;
      box(wood,x,.42,4,.065,.84,6);box(dark,x,.085,4,.12,.17,6);
      box(wood,x,.84,4,.13,.075,6);
      for(let i=0;i<=10;i++)box(dark,x,.44,1.04+i*.59,.095,.66,.042);
      box(wood,x,2.97,4,.14,.14,6);
    }

    // A single floor mesh gives each board a different cut of the same grain.
    walnut.wrapS=walnut.wrapT=T.RepeatWrapping;
    const vertices=[],uv=[],indices=[],colors=[];
    for(let row=0;row<26;row++){
      const z=1+row*6/26;
      for(let k=-1;k<4;k++){
        const start=1+k*2.35+((row*7)%13)*.17;
        const x0=Math.max(1,start)+.003,x1=Math.min(8,start+2.35)-.003;
        if(x1<=x0)continue;
        const i=vertices.length/3, z1=z+6/26-.004, u=row*.37+k*.23,v=row*.139;
        vertices.push(x0,0,z,x0,0,z1,x1,0,z1,x1,0,z);
        uv.push(u,v,u,v+.18,u+(x1-x0)*.7,v+.18,u+(x1-x0)*.7,v);
        const shade=.71+.23*(.5+.5*Math.sin(row*24+k*2));for(let n=0;n<4;n++)colors.push(shade,shade,shade);
        indices.push(i,i+1,i+2,i,i+2,i+3);
      }
    }
    const floor=new T.BufferGeometry();floor.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    floor.setAttribute('uv',new T.Float32BufferAttribute(uv,2));floor.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    floor.setIndex(indices);floor.computeVertexNormals();
    const boards=new T.Mesh(floor,surface(0xeedfcf,{map:walnut,vertexColors:true,roughness:.62}));
    boards.receiveShadow=true;scene.add(boards);box(iron,4.5,-.039,4,7,.07,6);

    const runner=new T.Mesh(new T.PlaneGeometry(3.18,1.21),surface(0xf8eddb,{map:texture('shop-runner')}));
    runner.rotation.set(-rightAngle,rightAngle,0,'YXZ');runner.position.set(4.38,.005,4.68);
    runner.receiveShadow=true;scene.add(runner);

    // Recessed canal window with an overhanging sill and leaded transom.
    for(const z of [1.96,4.88]){
      box(dark,7.94,1.89,z,.22,2.13,.13);box(wood,7.82,1.87,z,.065,2.2,.095);
    }
    for(const z of [2.94,3.9])box(wood,7.97,1.87,z,.12,2.02,.068);
    for(const y of [.89,2.39,2.87])box(wood,7.95,y,3.42,.16,.078,3);
    for(let i=0;i<6;i++){
      const z=2.20+i*.48;
      for(const sign of [-1,1])box(patina,7.98,2.63,z+sign*.12,.025,.51,.024,sign*.53);
    }
    box(wood,7.85,.87,3.42,.36,.095,3.14);
    for(const z of [2.1,3.42,4.74])box(dark,7.89,.75,z,.17,.19,.075);

    const leg=lathe([[.038,0],[.048,.05],[.035,.10],[.039,.36],[.061,.53],[.043,.62],[.06,.66],[.06,.76]]);
    function table(x,z,w,d){
      box(wood,x,.846,z,w,.084,d);box(dark,x,.79,z,w-.055,.046,d-.055);
      for(const dx of [-1,1])for(const dz of [-1,1])f.place(leg,wood,x+dx*(w/2-.095),0,z+dz*(d/2-.09));
      for(const side of [-1,1]){
        box(dark,x,.73,z+side*(d/2-.07),w-.12,.13,.055);
        box(wood,x+side*(w/2-.09),.25,z,.045,.058,d-.14);
      }
    }
    const glass=surface(0xc9e4df,{transparent:true,opacity:.22,roughness:.15,depthWrite:false,side:T.DoubleSide});
    const flame=new T.MeshBasicMaterial({color:0xffcf78,toneMapped:false});
    const foot=lathe([[.095,0],[.1,.015],[.093,.027],[.056,.038],[.065,.057],[.085,.072],[.08,.118],[.043,.144],[.036,.163]]);
    const chimney=lathe([[.036,0],[.056,.035],[.06,.078],[.041,.125],[.028,.181],[.033,.246],[.035,.252]]);
    const lampHandle=new T.TorusGeometry(.046,.008,8,22);
    function lamp(x,y,z,scale){
      f.place(lampHandle,brass,x+.088*scale,y+.104*scale,z,scale,scale*1.16,scale,0,.2,-.27);
      round(iron,x,y+.15*scale,z,.042*scale,.011*scale);
      round(brass,x,y+.159*scale,z,.045*scale,.009*scale);
      f.place(foot,brass,x,y,z,scale,scale,scale);
      f.place(chimney,glass,x,y+.146*scale,z,scale,scale,scale);
      f.place(ball,flame,x,y+.204*scale,z,.017*scale,.048*scale,.017*scale);
    }
    const jar=lathe([[.05,0],[.063,.015],[.063,.13],[.047,.152],[.043,.176]]);
    const label=surface(0xd0b98f);
    function bottle(x,y,z,s){
      f.place(jar,patina,x,y,z,s,s,s);round(iron,x,y+s*.18,z,s*.048,s*.022);
      box(label,x,y+s*.084,z+s*.061,s*.061,s*.051,.003);
    }
    const shard=quartzPrism();
    const feather=texture('bench-quartz');
    const gems=[0xceefec,0xffddab,0xbac9de].map(color=>surface(color,{map:feather,flatShading:true,roughness:.16,metalness:.16}));
    function crystal(x,y,z,r,h,mat,angle=0,lean=0){
      f.place(shard,mat,x,y,z,r,h,r*.87,0,angle,lean);
    }
    function book(x,y,z,w,h,d,index){
      const cover=leather[index%3];box(cover,x,y+h/2,z,w,h,d);
      for(const height of [.14,.82])box(brass,x,y+h*height,z+d/2,w*.86,.009,.006);
    }

    // One little printed strip supplies all nine brass specimen labels.
    const catalog=document.createElement('canvas');catalog.width=768;catalog.height=48;
    const ink=catalog.getContext('2d');ink.fillStyle='#dfcd9e';ink.fillRect(0,0,768,48);
    ink.fillStyle='#392d20';ink.textAlign='center';ink.font='bold 21px Georgia';
    for(let i=0;i<9;i++)ink.fillText(['Q','R','S'][Math.floor(i/3)]+' · '+(i+1),768*(i+.5)/9,32);
    const tags=new T.CanvasTexture(catalog);tags.colorSpace=T.SRGBColorSpace;
    const tagMaterial=surface(0xffffff,{map:tags});
    // Kaelan's specimen cabinet occupies the original station footprint.
    box(dark,2.1,1.12,1.15,1.33,2.19,.16);
    for(const x of [1.47,2.73]){
      box(wood,x,1.09,1.40,.095,2.17,.52);box(dark,x,1.12,1.667,.062,2.16,.044);
    }
    for(const y of [.13,.59,1.10,1.65,2.19]){
      box(wood,2.1,y,1.41,1.35,.062,.53);
      box(dark,2.1,y-.019,1.673,1.35,.042,.038);
    }
    box(wood,2.1,2.24,1.40,1.40,.065,.55);
    for(let i=0;i<9;i++)book(1.59+i*.081,.162,1.44,.073,.27+.035*Math.sin(i),.29,i);
    for(const [n,y] of [.622,1.132,1.682].entries()){
      for(let i=0;i<3;i++){
        const x=1.72+i*.38,z=1.48;
        round(dark,x,y+.018,z,.127,.036);
        crystal(x,y+.036,z,.076,.19+.041*Math.sin(n*5+i),gems[(i+n)%3],i*.7,.21*Math.sin(n*5+i));
        crystal(x-.064,y+.036,z+.027,.041,.107,gems[(i+n)%3],n*.8,.37);
        crystal(x+.061,y+.036,z-.012,.043,.124,gems[(i+n)%3],n+.5,-.47);
        box(brass,x,y+.019,1.612,.137,.047,.012);
        const tag=new T.PlaneGeometry(.109,.032),uvs=tag.getAttribute('uv');
        for(let k=0;k<uvs.count;k++)uvs.setX(k,(n*3+i+uvs.getX(k))/9);
        f.place(tag,tagMaterial,x,y+.019,1.619);
      }
    }
    // Notebook desk and wall-mounted field notes face the player's approach.
    table(1.51,4.5,.995,.73);
    box(leather[0],1.56,.904,4.5,.39,.03,.52);
    box(paper,1.56,.928,4.5,.362,.02,.496);
    const spread=new T.PlaneGeometry(.492,.36,16,2);
    const points=spread.getAttribute('position');
    for(let i=0;i<points.count;i++){
      const t=Math.abs(points.getX(i))/.246;
      points.setZ(i,.002+.018*Math.sin(Math.PI*t));
    }
    spread.computeVertexNormals();
    const journal=new T.Mesh(spread,page);
    journal.rotation.set(-rightAngle,rightAngle,0,'YXZ');
    journal.position.set(1.56,.94,4.5);scene.add(journal);
    lamp(1.23,.889,4.74,.83);bottle(1.25,.889,4.27,.74);
    box(wood,1.68,.90,4.80,.23,.013,.015,0,.24);
    // The light bench echoes the puzzle's brass cradle, specimen and oil lamp.
    table(6.55,3.1,1.45,.78);
    const blotter=texture('light-bench-plate');
    blotter.offset.set(.129,.047);blotter.repeat.set(.785,.814);
    const mat=new T.Mesh(new T.PlaneGeometry(.97,.59),surface(0xf8e8cb,{map:blotter}));
    mat.rotation.x=-rightAngle;mat.position.set(6.51,.89,3.13);mat.receiveShadow=true;scene.add(mat);
    box(wood,6.46,.923,3.12,.43,.046,.29);
    for(const dx of [-.12,.12]){round(brass,6.46+dx,.975,3.12,.05,.064);box(brass,6.46+dx,1.013,3.12,.056,.07,.16);}
    crystal(6.33,1.038,3.12,.067,.25,gems[0],0,-1.12);
    lamp(6.04,.89,2.99,1.37);
    bottle(7.07,.89,2.90,.85);
    for(let i=0;i<2;i++)box(paper,7.00,.894+i*.009,3.27,.32,.007,.18,0,.12+i*.08);
    const loupe=new T.TorusGeometry(.052,.011,8,24);
    f.place(loupe,brass,6.98,.915,3.27,1,1,1,rightAngle);
    box(dark,7.066,.917,3.27,.091,.024,.022);
    const glow=new T.PointLight(0xffbd72,2.1,4);glow.position.set(6.04,1.32,2.97);scene.add(glow);

    // Low drawers beside the window, with inset fronts and brass pulls.
    box(dark,7.35,.48,4.52,.65,.86,.86);box(wood,7.34,.94,4.52,.72,.075,.95);
    for(let i=0;i<4;i++){
      const y=.21+i*.19;
      box(wood,7.002,y,4.52,.046,.166,.79);
      for(const z of [4.30,4.72]){box(brass,6.974,y,z,.017,.067,.089);f.place(ball,brass,6.947,y,z,.033,.026,.026);}
    }
    bottle(7.47,.978,4.31,1.05);bottle(7.49,.978,4.51,.78);
    const ring=new T.TorusGeometry(1,.038,8,40);
    round(dark,7.28,.997,4.71,.12,.038);round(brass,7.28,1.046,4.71,.043,.069);
    for(const [tilt,turn] of [[.18,.78],[1.29,.21],[-.74,-.48]])f.place(ring,brass,7.28,1.224,4.71,.149,.149,.149,tilt,turn);
    f.place(ball,patina,7.28,1.224,4.71,.038,.038,.038);
    f.finish();
  }
}
