import * as T from '../vendor/three.module.js';

// All pieces share geometry and materials. Assemble them once in room coordinates.
export function furnishRoom(texture){
  const cube=new T.BoxGeometry(),drum=new T.CylinderGeometry(1,1,1,24);
  const band=new T.TorusGeometry(1,.075,8,40),gem=new T.IcosahedronGeometry(1,0);
  const basin=new T.LatheGeometry([[.10,0],[.20,.045],[.32,.17],[.33,.20],[.29,.20],[.25,.14],[.15,.07],[0,.06]].map(p=>new T.Vector2(...p)),32);
  const material=(color,map,detail={})=>new T.MeshStandardMaterial({color,map,roughness:.76,...detail});
  const wood=material(0xa98261,texture('../shop-walnut')),dark=material(0x755a43,texture('../shop-walnut'));
  const stone=material(0xa8a398,texture('../quay-flagstones'));
  const brass=material(0xc6a36a,null,{metalness:.32,roughness:.44}),ink=material(0x344342,null);
  const paper=material(0xd9c5a0,null),cloth=material(0x395b60,null);
  const glass=material(0xa2ddce,texture('../bench-quartz'),{roughness:.24,metalness:.15});
  const water=material(0x619795,null,{roughness:.2,metalness:.30});
  const notes=material(0xe9ddc1,texture('../shop-field-notes'));
  const parts={
    desk(){table();book(-.12,.79,.02);scroll(.15,.83,-.04);},
    plan(){table();book(0,.79,0);for(const x of [-.26,.26])scroll(x,.82,0);},
    'window-bench'(){table();vessel(0,.78,0);},
    city(){
      table();cylinder(stone,0,.80,0,.31,.045);
      for(const r of [.12,.20,.28])ring(brass,0,.833,0,r,Math.PI/2);
      for(const [x,z,h] of [[0,0,.14],[-.14,.11,.07],[.17,.08,.08],[.04,-.21,.06]])box(stone,x,.85+h/2,z,.045,h,.045);
    },
    plinth(){
      cylinder(stone,0,.055,0,.28,.11);cylinder(stone,0,.40,0,.19,.64);cylinder(brass,0,.74,0,.23,.045);
      cylinder(stone,0,.79,0,.26,.065);
      token=mesh(gem,glass,0,.97,0,.085,.18,.095);token.rotation.z=-.18;
    },
    scope(){
      cylinder(dark,0,.08,0,.25,.10);cylinder(brass,0,.56,0,.055,.91);
      ring(brass,0,1.05,0,.15,0);
      const tube=cylinder(brass,0,1.16,0,.069,.58);tube.rotation.x=1.19;
      const lens=cylinder(glass,0,1.26,.264,.061,.022);lens.rotation.x=tube.rotation.x;
    },
    mount(){table();ring(brass,0,1.0,0,.17,0);cylinder(brass,0,.87,0,.045,.15);mesh(gem,glass,0,1.02,0,.075,.10,.07);},
    basin(){cylinder(stone,0,.08,0,.31,.14);cylinder(stone,0,.39,0,.16,.53);vessel(0,.65,0);},
    cargo(){
      box(wood,0,.31,0,.72,.59,.57);box(dark,0,.62,0,.76,.045,.60);
      for(const x of [-.24,.24]){box(brass,x,.319,0,.03,.60,.585);box(brass,x,.648,0,.03,.013,.60);}
      box(brass,0,.50,.294,.10,.10,.02);
    },
    arch(){
      for(const x of [-.35,.35]){box(stone,x,.76,0,.17,1.52,.39);box(stone,x,.11,0,.24,.22,.46);}
      for(let i=0;i<9;i++){
        const a=(i+.5)*Math.PI/9;
        const block=box(stone,.35*Math.cos(a),1.52+.35*Math.sin(a),0,.175,.17,.40);
        block.rotation.z=a;
      }
    },
    shutter(){
      for(const x of [-.32,.32])box(dark,x,.85,0,.085,1.7,.13);
      for(let i=0;i<11;i++){const slat=box(wood,0,.29+i*.12,0,.62,.096,.07);slat.rotation.x=-.25;}
      for(const y of [.18,1.59])box(dark,0,y,0,.72,.09,.15);
    },
    robe(){
      table();
      for(let i=0;i<3;i++)box(cloth,.02,.81+i*.045,0,.43-i*.025,.046,.32);
      box(brass,.02,.945,0,.06,.022,.15);
    }
  };
  let root,token;
  function mesh(shape,mat,x,y,z,w,h,d){
    const m=new T.Mesh(shape,mat);m.position.set(x,y,z);m.scale.set(w,h,d);root.add(m);return m;
  }
  function box(mat,x,y,z,w,h,d){return mesh(cube,mat,x,y,z,w,h,d);}
  function cylinder(mat,x,y,z,r,h){return mesh(drum,mat,x,y,z,r,h,r);}
  function ring(mat,x,y,z,r,tilt){const m=mesh(band,mat,x,y,z,r,r,r);m.rotation.x=tilt;return m;}
  function table(){
    for(const x of [-.31,.31])for(const z of [-.21,.21])box(dark,x,.36,z,.063,.72,.063);
    box(dark,0,.68,0,.72,.10,.50);box(wood,0,.75,0,.82,.065,.59);
  }
  function book(x,y,z){
    box(dark,x,y+.015,z,.36,.03,.27);
    const page=mesh(new T.PlaneGeometry(.345,.255),notes,x,y+.032,z,1,1,1);page.rotation.x=-Math.PI/2;
  }
  function scroll(x,y,z){const roll=cylinder(paper,x,y,z,.035,.29);roll.rotation.x=Math.PI/2;}
  function vessel(x,y,z){mesh(basin,brass,x,y,z,1,1,1);cylinder(water,x,y+.163,z,.263,.009);}
  return function place(type){
    root=new T.Group();token=null;parts[type]();
    return {root,token};
  };
}
