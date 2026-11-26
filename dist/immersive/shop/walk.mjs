import {canOccupy} from '../engine.mjs';

export const stations = {
  drawer: {label:'Grading drawer', mark:'⌑', point:[7.03,.68,4.52], approach:[6.52,4.54]},
  notebook: {label:'Notebook', mark:'✎', point:[1.5,1.05,4.5], approach:[2.5,4.5]},
  shelf: {label:'Specimen shelf', mark:'◇', point:[2.1,1.6,1.5], approach:[2.25,2.25]},
  bench: {label:'Light bench', mark:'☼', point:[6.55,1.26,3.08], approach:[6.5,4]}
};
const map = Array.from({length:8},(_,y)=>Array.from({length:9},(_,x)=>Number(!x||x===8||!y||y===7)));
const furniture = [
  {x0:1.42,x1:2.78,y0:1.03,y1:1.7}, {x0:1,x1:2.02,y0:4.12,y1:4.88},
  {x0:6.98,x1:7.7,y0:4.02,y1:4.98}, {x0:5.82,x1:7.28,y0:2.68,y1:3.55}
];
export const walkable = (x,z)=>canOccupy(map,x,z,.2,furniture);
const step=.25;
function reachable(a,b) {
  const count=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.08));
  for(let i=1;i<=count;i++) if(!walkable(a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count)) return false;
  return true;
}
export function pathTo(from,to) {
  if(!walkable(...to)) return null;
  if(reachable(from,to)) return [to];
  const snapped=from.map(v=>Math.round(v/step)*step);
  const start=[[0,0],[step,0],[-step,0],[0,step],[0,-step]].map(([x,z])=>[snapped[0]+x,snapped[1]+z]).find(p=>reachable(from,p));
  if(!start)return null;
  const queue=[start], parent=new Map([[String(start),null]]);
  for(let i=0;i<queue.length;i++){
    const p=queue[i];
    if(reachable(p,to)){
      const path=[to];
      for(let q=p;q;q=parent.get(String(q))) path.unshift(q);
      return path;
    }
    for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
      const q=[p[0]+dx,p[1]+dz],key=String(q);
      if(parent.has(key)||!reachable(p,q)) continue;
      parent.set(key,p);queue.push(q);
    }
  }
  return null;
}
