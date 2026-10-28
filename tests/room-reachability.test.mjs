// Source-level geometry acceptance, not a device/visual playtest.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {canOccupy,nearestReachable} from '../dist/immersive/engine.mjs';
import {freshSave} from '../dist/immersive/save.mjs';
const src=readFileSync(new URL('../dist/immersive/opening.mjs',import.meta.url),'utf8');
// Load the actual literal map, target proxies, and lamp condition from the candidate.
const extract=(re,label)=>{const m=src.match(re);assert.ok(m,`Cannot find ${label}; update this test if scene representation changes`);return m;};
const map=JSON.parse(extract(/const map=(\[.*?\]);/,'map')[1]);
const objects=runInNewContext('('+extract(/const objects=(\[.*?\]);/,'objects')[1]+')');
const obstacles=runInNewContext('('+extract(/const obstacles=(\[.*?\]);/,'obstacles')[1]+')');
const m=extract(/const bench=\{x:([\d.]+),y:([\d.]+)\},lamp=\{x:([\d.]+),y:([\d.]+)\}.*?visibility=clamp\(\(-cos-([\d.]+)\)\/([\d.]+),0,1\)/,'backlight visibility');
const bench={x:+m[1],y:+m[2]},lamp={x:+m[3],y:+m[4]},bias=+m[5],scale=+m[6];
const required=+extract(/if\(visibility<([\d.]+)\)/,'inspection visibility threshold')[1];
const spawn=freshSave();assert.ok(canOccupy(map,spawn.x,spawn.y,.18,obstacles),'fresh spawn must not be inside collision geometry');
// Search a conservative 0.1 unit lattice by cardinal movement, starting from the saved spawn.
const step=10,start=[Math.round(spawn.x*step),Math.round(spawn.y*step)],queue=[start],seen=new Set([start.join(',')]);
for(let i=0;i<queue.length;i++){
 const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
  if(!seen.has(key)&&canOccupy(map,nx/step,ny/step,.18,obstacles)){seen.add(key);queue.push([nx,ny]);}
 }
}
const aspect=390/844;const verticalFov=Math.min(110,2*Math.atan(Math.tan(70*Math.PI/360)/aspect)*180/Math.PI);const phoneHalfFov=Math.atan(Math.tan(verticalFov*Math.PI/360)*aspect)*.9;
const pointFor=(object,condition=()=>true)=>queue.find(([xi,yi])=>{
 const x=xi/step,y=yi/step;if(!condition(x,y))return false;
 const angle=Math.atan2(object.y-y,object.x-x);
 return nearestReachable(map,{x,y,angle},objects,1.35,phoneHalfFov,obstacles)?.id===object.id;
});
for(const id of ['shelf','notebook','drawer','bench','window']){
 const o=objects.find(x=>x.id===id);assert.ok(o,`missing ${id}`);const p=pointFor(o);assert.ok(p,`${id} inaccessible from spawn with collision and LOS`);console.log(id,'reachable at',p.map(v=>v/step).join(','));
}
const target=objects.find(x=>x.id==='bench');
const backlit=pointFor(target,(x,y)=>{const vx=x-bench.x,vy=y-bench.y,lx=lamp.x-bench.x,ly=lamp.y-bench.y;const cos=(vx*lx+vy*ly)/(Math.hypot(vx,vy)*Math.hypot(lx,ly)||1);const visibility=Math.max(0,Math.min(1,(-cos-bias)/scale));return visibility>=required;});
assert.ok(backlit,'bench shadow-side location must be reachable and interactable');
console.log('Backlit bench reachable at',backlit.map(v=>v/step).join(','),`; ${queue.length} reachable lattice positions.`);
