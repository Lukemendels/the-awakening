import * as T from '../vendor/three.module.js';
import {RoomRenderer} from '../room3d.mjs';
import {clamp} from '../engine.mjs';

const height=x=>.10+.72*clamp((x-3.5)/2,0,1);
class Quay extends RoomRenderer{
  constructor(canvas){
    super(canvas);
    const scene=this.scene;
    const loader=new T.TextureLoader();
    const tex=(name,u=1,v=1)=>{
      const t=loader.load(new URL('../../assets/generated/'+name+'.webp',import.meta.url).href);
      t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(u,v);
      t.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());return t;
    };
    const mat=(color,map,options={})=>new T.MeshStandardMaterial({color,map,roughness:.76,...options});
    const paving=tex('quay-flagstones',2,2.8),trim=tex('quay-flagstones'),timber=tex('shop-walnut');
    const stone=mat(0xbcc2bd,trim,{bumpMap:trim,bumpScale:.023}),wood=mat(0xb49c84,timber),dark=mat(0x968677,timber),
      brass=mat(0xb5976f,trim,{metalness:.42,roughness:.46}),iron=mat(0x667270,trim,{metalness:.33}),hemp=mat(0xc0a997,timber);
    const lens=mat(0x75d0d1,null,{metalness:.45,roughness:.12});
    const lightGlass=new T.MeshBasicMaterial({color:0xffcf84});
    const panorama=tex('night-quay-panorama');
    const reflections=panorama.clone();reflections.mapping=T.EquirectangularReflectionMapping;
    scene.environment=reflections;scene.environmentIntensity=.65;
    const sky=new T.Mesh(new T.SphereGeometry(27,72,32),new T.MeshBasicMaterial({map:panorama,side:T.BackSide,toneMapped:false}));
    sky.position.set(4.5,.35,2);sky.rotation.y=Math.PI/2;scene.add(sky);
    scene.add(new T.HemisphereLight(0xdce7ff,0x69777b,1.4));
    const moon=new T.DirectionalLight(0xb4d6ff,1.45);moon.position.set(-4,8,-5);scene.add(moon);
    const cube=new T.BoxGeometry(),unitPole=new T.CylinderGeometry(1,1,1,16);
    const put=(shape,m,x,y,z,group=scene)=>{
      const mesh=new T.Mesh(shape,m);mesh.position.set(x,y,z);group.add(mesh);return mesh;
    };
    const box=(x,y,z,w,h,d,m,group)=>{const a=put(cube,m,x,y,z,group);a.scale.set(w,h,d);return a;};
    const pole=(x,y,z,r,h,m,group)=>{const a=put(unitPole,m,x,y,z,group);a.scale.set(r,h,r);return a;};
    const beam=(a,b,r,m,group=scene)=>{
      const from=new T.Vector3(...a),to=new T.Vector3(...b),axis=to.clone().sub(from);
      const mid=from.add(to).multiplyScalar(.5),mesh=pole(mid.x,mid.y,mid.z,r,axis.length(),m,group);
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());return mesh;
    };
    const rope=(a,b,sag,r=.019,group=scene)=>{
      const start=new T.Vector3(...a),end=new T.Vector3(...b),mid=start.clone().lerp(end,.5);mid.y-=sag;
      const curve=new T.QuadraticBezierCurve3(start,mid,end);
      put(new T.TubeGeometry(curve,13,r,6,false),hemp,0,0,0,group);
    };
    const horizontal=(x,y,z,w,d,m,group)=>{
      const mesh=put(new T.PlaneGeometry(w,d),m,x,y,z,group);mesh.rotation.x=-Math.PI/2;return mesh;
    };
    // A level lower landing leads up eight shallow risers to the overlook.
    // The eye follows the sloping envelope, so no camera bob is needed.
    for(const [x,w,h] of [[2.22,2.56,.10],...Array.from({length:8},(_,i)=>[3.625+i*.25,.25,.10+(i+.5)*.09]),[6.78,2.56,.82]]){
      box(x,(h-.9)/2,4,w,h+.9,6.2,stone);
      const floorMap=paving.clone();floorMap.repeat.set(w/2.6,2.8);floorMap.offset.x=(x-w/2)/2.6;
      // Texture clones share the source image and upload after the loader resolves.
      horizontal(x,h+.005,4,w,6.20,mat(0xc2ccd0,floorMap));
      box(x,h-.07,.92,w,.16,.20,stone);
    }
    const lamp=(x,y,z,s=1,group=scene)=>{
      box(x,y+.045*s,z,.31*s,.09*s,.31*s,iron,group);
      pole(x,y+.22*s,z,.084*s,.24*s,lightGlass,group);
      for(const dy of [.105,.28])box(x,y+dy*s,z,.23*s,.019*s,.23*s,iron,group);
      for(const dx of [-.107,.107])for(const dz of [-.107,.107])box(x+dx*s,y+.24*s,z+dz*s,.023*s,.34*s,.023*s,brass,group);
      box(x,y+.40*s,z,.29*s,.045*s,.29*s,iron,group);
      put(new T.ConeGeometry(.2*s,.15*s,4),brass,x,y+.485*s,z,group).rotation.y=Math.PI/4;
    };
    const rail=(a,b)=>{
      rope(a,b,.32);rope([a[0],a[1]-.25,a[2]],[b[0],b[1]-.25,b[2]],.28,.014);
    };
    for(const [x,forward] of [[1,1],[8,-1]]){
      const y=height(x);
      for(const z of [1.05,3.03,5.01,6.98]){
        box(x,y+.46,z,.16,.94,.16,dark);box(x,y+.84,z,.18,.055,.18,brass);
        if(z<6.9)rail([x,y+.83,z],[x,y+.83,z+1.97]);
      }
      lamp(x+forward*.05,y+.96,3.03,.82);
    }
    for(const x of [1.0,3.38,5.57,8]){
      const y=height(x);
      box(x,y+.39,6.98,.18,.80,.18,wood);
      if(x!==8){const nx=x===1?3.38:x===3.38?5.57:8;rail([x,y+.75,6.98],[nx,height(nx)+.75,6.98]);}
    }
    // Near mooring, with a working coil and the line running out to the water.
    for(const x of [1.80,2.36]){
      pole(x,.38,1.09,.102,.47,iron);pole(x,.59,1.09,.14,.082,iron);
      pole(x,.155,1.09,.16,.082,iron);pole(x,.51,1.09,.108,.023,brass);
    }
    const coil=new T.TorusGeometry(.18,.023,7,24);
    for(let i=0;i<4;i++){
      const loop=put(coil,hemp,2.63+.012*Math.sin(i),.141+.028*i,1.20+.013*Math.cos(i));
      loop.rotation.set(Math.PI/2,.048*i,.35*i);loop.scale.x=1.32-.095*i;
    }
    rope([2.63,.16,1.40],[2.25,.21,1.11],.05,.02);
    lamp(1.45,.11,1.34,.84);
    // A brass sight and worn parapet mark the raised viewing place.
    box(6.8,1.06,1.06,2.36,.48,.30,stone);box(6.8,1.33,1.06,2.48,.087,.39,stone);
    pole(6.72,1.54,1.15,.065,.39,brass);
    beam([6.62,1.82,1.48],[6.83,1.70,.85],.077,brass);
    for(const [x,y,z] of [[6.65,1.80,1.39],[6.76,1.74,1.05]])beam([x,y,z],[x+.01,y-.005,z-.035],.084,iron);
    beam([6.62,1.82,1.49],[6.61,1.83,1.53],.067,lens);
    beam([6.81,1.71,.90],[6.84,1.70,.81],.091,lens);
    // Survey board on a trestle, with room to walk around its open side.
    box(2.01,.94,5.25,1.22,.10,.75,wood);
    for(const x of [1.50,2.52])for(const z of [5.00,5.52])box(x,.49,z,.085,.86,.085,dark);
    horizontal(2.12,1.0,5.25,.79,.53,new T.MeshBasicMaterial({map:tex('quay-sketchboard')}));
    lamp(1.54,.99,5.45,.81);
    for(const [x,y,z,power] of [[1.54,1.5,5.44,9],[1.47,.58,1.35,7],[7.9,2.2,3.0,6]]){
      const l=new T.PointLight(0xffb363,power,5);l.position.set(x,y,z);scene.add(l);
    }

    // The cargo boat has a tapered hull, open well and a sheltered stern.
    const boat=this.boat=new T.Group();scene.add(boat);
    const hull=new T.Shape();hull.moveTo(-2.36,0);hull.quadraticCurveTo(-2.12,-.60,-1.31,-.63);
    hull.lineTo(1.38,-.63);hull.quadraticCurveTo(2.1,-.5,2.47,0);hull.quadraticCurveTo(2.14,.56,1.38,.63);
    hull.lineTo(-1.31,.63);hull.quadraticCurveTo(-2.12,.57,-2.36,0);
    const shell=put(new T.ExtrudeGeometry(hull,{depth:.32,bevelEnabled:true,bevelThickness:.065,bevelSize:.055,bevelSegments:2,curveSegments:10}),dark,0,-.13,0,boat);
    shell.rotation.x=-Math.PI/2;shell.scale.set(.98,.87,.84);
    const sideTimber=mat(0xf6e4ce,tex('barge-planking'));
    for(const side of [-1,1]){
      // Map the photographed planks around both curved hull sides.
      const edges=[[-2.34,0,.41],[-1.92,.43,.34],[-1.43,.64,.29],[1.38,.64,.29],[1.93,.47,.35],[2.42,0,.44]];
      const pos=[],uv=[],indices=[];
      for(const [i,[x,z,top]] of edges.entries()){
        pos.push(x,-.144,side*z*.91,x,top,side*z);uv.push((x+2.34)/4.76,0,(x+2.34)/4.76,1);
        if(i){const k=i*2;indices.push(k-2,k,k+1,k-2,k+1,k-1);}
      }
      const sideGeo=new T.BufferGeometry();sideGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
      sideGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));sideGeo.setIndex(indices);sideGeo.computeVertexNormals();
      sideTimber.side=T.DoubleSide;put(sideGeo,sideTimber,0,0,0,boat);
      for(const x of [-1.38,-.60,.32,1.28]){
        const z=side*.65;beam([x-.03,.30,z],[x+.04,-.085,side*.62],.032,iron,boat);
      }
      beam([-1.61,.32,side*.57],[1.5,.32,side*.57],.052,wood,boat);
      for(const end of [-1,1])beam([end*1.5,.32,side*.57],[end*2.28,.43,0],.045,wood,boat);
    }
    for(const x of [-1.75,-.84])for(const z of [-.43,.43])pole(x,.69,z,.043,.83,wood,boat);
    const canopy=new T.Shape();canopy.moveTo(-.58,0);canopy.quadraticCurveTo(0,.31,.58,0);
    canopy.lineTo(.58,-.042);canopy.quadraticCurveTo(0,.245,-.58,-.042);canopy.closePath();
    const roof=put(new T.ExtrudeGeometry(canopy,{depth:1.42,bevelEnabled:false}),wood,-1.98,1.04,0,boat);roof.rotation.y=Math.PI/2;
    box(-1.33,.45,-.48,1.15,.31,.07,wood,boat);
    box(-1.74,.49,0,.32,.40,.78,wood,boat);
    lamp(-1.39,.21,-.02,.81,boat);
    const shard=new T.IcosahedronGeometry(1,0), mineral=mat(0xc6d5cf,tex('barge-ballast'),{metalness:.09,roughness:.53});
    for(let i=0;i<29;i++){
      const x=-.58+(i%8)*.264,z=((i*11)%17-8)*.045;
      const gem=put(shard,mineral,x,.30+(i%3)*.025,z,boat);
      gem.scale.set(.19,.11+(i%5)*.025,.14);gem.rotation.set(i*.32,i*.73,i*.53);
    }
    const exposed=put(new T.OctahedronGeometry(.31),mat(0xb6cfcb,tex('bench-quartz'),{metalness:.16,roughness:.19}),.38,.48,.12,boat);
    exposed.scale.set(1.35,.45,.48);exposed.rotation.z=.22;
    for(const x of [-.34,.25,.81,1.31])rope([x,.34,-.52],[x+.13,.34,.52],-.38,.015,boat);
    // Keep the water immediately around the hull visibly connected to its wake.
    const wakeMat=new T.MeshBasicMaterial({color:0x79b7b5,transparent:true,opacity:.42,depthWrite:false});
    for(let i=0;i<18;i++){
      const x=-2.1+i*.24,z=.64+.12*Math.sin(i*.41);
      box(x,-.096,z,.15+.12*Math.sin(i),.004,.015,wakeMat,boat);
    }
    this.pulse=new T.MeshBasicMaterial({color:0xbbf5e6,transparent:true,opacity:.62,depthWrite:false});
    for(const dx of [-.38,.28])beam([dx,-.095,.7],[.08,-.095,1.29],.014,this.pulse,boat);
    // Keep the near water registered with the panorama. The hull darkens its
    // reflection underneath, and its lantern breaks into flecks on the ripples.
    this.water=new T.ShaderMaterial({
      uniforms:{panorama:{value:panorama},clock:{value:0},boatX:{value:4.35}},
      vertexShader:`varying vec3 point;
        void main(){point=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(point,1.);}`,
      fragmentShader:`uniform sampler2D panorama;uniform float clock,boatX;varying vec3 point;
        void main(){
          vec3 d=normalize(point-cameraPosition),c=cameraPosition-vec3(4.5,.35,2.);
          float b=dot(d,c);vec3 q=normalize(c+d*(-b+sqrt(b*b+729.-dot(c,c))));
          vec2 uv=vec2(atan(q.x,q.z)/6.2831853,.5+asin(q.y)/3.14159265);
          float ripple=sin(22.*point.z+2.*point.x+clock)*sin(6.*point.x-1.5*clock);
          vec3 col=texture2D(panorama,uv+vec2(.0007*ripple,.0015*ripple)).rgb;
          vec2 h=point.xz-vec2(boatX,-2.48);
          float shade=(1.-smoothstep(1.8,2.5,abs(h.x)))*(1.-smoothstep(.35,1.25,abs(h.y-.34)));
          col*=1.-.72*shade;
          float gold=exp(-9.*abs(h.x+1.38)-1.7*abs(h.y-.85))*smoothstep(.14,.84,ripple);
          col+=vec3(.53,.21,.054)*gold;
          gl_FragColor=vec4(col,1.);
          #include <colorspace_fragment>
        }`
    });
    horizontal(4.5,-.43,-2.8,20,10,this.water);
    // Repeated masonry fittings and boat parts draw in material batches.
    for(const group of [scene,boat]){
      const batches=new Map();
      for(const m of group.children){
        if(!m.isMesh||m.material.transparent)continue;
        const key=m.geometry.uuid+m.material.uuid;
        if(!batches.has(key))batches.set(key,[]);batches.get(key).push(m);
      }
      for(const parts of batches.values()){
        if(parts.length<2)continue;
        const inst=new T.InstancedMesh(parts[0].geometry,parts[0].material,parts.length);
        parts.forEach((m,i)=>{m.updateMatrix();inst.setMatrixAt(i,m.matrix);group.remove(m);});
        group.add(inst);
      }
    }
    this.update(0,true);
  }
  update(time,reduced){
    const t=reduced?0:time*.00019;
    this.boat.position.set(4.35+1.16*Math.sin(t),-.30+.018*Math.sin(t*4),-2.48);
    this.water.uniforms.clock.value=t*4;this.water.uniforms.boatX.value=this.boat.position.x;
    this.boat.rotation.y=.09+.035*Math.sin(t);this.pulse.opacity=.54+.22*Math.cos(t*4);
  }
}

export const quay={
  Interior:Quay,
  start:[4.65,5.75],yaw:-Math.PI/2,
  height,footstep:()=> 'stone-step',
  walkable:(x,z)=>x>=1.23&&x<=7.77&&z>=1.32&&z<=6.68&&!(x<2.84&&z>4.66&&z<5.83),
  stations:{
    near_view:{label:'Canal steps',mark:'◇',point:[2.1,.78,1.12],lookAt:[4.25,.12,-2.5],approach:[2.12,1.88]},
    far_view:{label:'Gate overlook',mark:'◇',point:[6.73,1.84,1.18],lookAt:[4.5,.1,-2.45],approach:[6.72,1.91]},
    chart:{label:'Survey board',mark:'✎',point:[2.02,1.13,5.25],approach:[3.08,5.28]}
  }
};
