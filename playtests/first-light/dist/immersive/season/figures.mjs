import * as T from '../vendor/three.module.js';
import {profiles} from './figure-contours.mjs';

// Keep the photographed face and costume on the front of a closed volume.
// The rear gets its cloth colors from each row of the original costume.
export function figure(name,map,aspect){
  const group=new T.Group(),rows=profiles[name],height=1.67;
  for(const rear of [false,true]){
    const positions=[],uv=[],colors=[],indices=[],segments=14;
    for(const [left,right,v,r,g,b] of rows){
      const radius=(right-left)*height*aspect/2,mid=(right+left)/2;
      const color=new T.Color().setRGB(r/255,g/255,b/255,T.SRGBColorSpace);
      for(let j=0;j<=segments;j++){
        const angle=Math.PI*(j/segments+Number(rear)),u=mid+Math.cos(angle)*(right-left)/2;
        positions.push((u-.5)*height*aspect,(1-v)*height,Math.sin(angle)*Math.min(.16,radius*.76));
        uv.push(u,1-v);colors.push(color.r,color.g,color.b);
      }
    }
    for(let i=0;i<rows.length-1;i++)for(let j=0;j<segments;j++){
      const a=i*(segments+1)+j,b=a+segments+1;
      indices.push(a,a+1,b,b,a+1,b+1);
    }
    const geom=new T.BufferGeometry();
    geom.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geom.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    geom.setIndex(indices);geom.computeVertexNormals();
    const mat=rear?new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide}):new T.MeshBasicMaterial({map,alphaTest:.4,side:T.DoubleSide});
    group.add(new T.Mesh(geom,mat));
  }
  return group;
}
