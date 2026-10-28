import assert from 'node:assert/strict';
import * as T from '../dist/immersive/vendor/three.module.js';
import {FinalArcRooms} from '../dist/immersive/final-arc-rooms.mjs';
import {arc1417Scenes} from '../dist/immersive/arc1417.mjs';
import {arc1820Scenes} from '../dist/immersive/arc1820.mjs';
import {arc2124Scenes} from '../dist/immersive/arc2124.mjs';
import {canOccupy,nearestReachable} from '../dist/immersive/engine.mjs';
const map=[[1,1,1,1,1,1,1,1,1],...Array.from({length:6},()=>[1,0,0,0,0,0,0,0,1]),[1,1,1,1,1,1,1,1,1]],scene=new T.Scene(),shop=new T.Group();scene.add(shop);
let renders=0;const sets=new FinalArcRooms({scene,shop,camera:new T.PerspectiveCamera(),renderer:{},render(){renders++;}});
for(const sc of [...arc1417Scenes,...arc1820Scenes,...arc2124Scenes]){
 const obstacles=sets.setScene(sc.roomId||sc.id,sc.objects),start=sc.start;
 assert.equal(shop.visible,false,`${sc.episode}: opening shop hidden`);assert.equal(obstacles.length,sc.objects.length,`${sc.episode}: station obstacle count`);
 assert.ok(canOccupy(map,start.x,start.y,.18,obstacles),`${sc.episode}: start collision`);
 const queue=[[Math.round(start.x*10),Math.round(start.y*10)]],seen=new Set([queue[0].join(',')]);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=`${a},${b}`;if(!seen.has(key)&&canOccupy(map,a/10,b/10,.18,obstacles)){seen.add(key);queue.push([a,b]);}}}
 for(const target of sc.objects){const ok=queue.some(([xi,yi])=>{const x=xi/10,y=yi/10,angle=Math.atan2(target.y-y,target.x-x);return nearestReachable(map,{x,y,angle},sc.objects,1.35,.6,obstacles)?.id===target.id;});assert.ok(ok,`${sc.episode}: ${target.id} not reachable`);}
 const copy=sets.getObstacles();copy[0].x0=999;assert.notEqual(sets.getObstacles()[0].x0,999);sets.render({});
}
const c=arc1417Scenes.find(s=>s.episode===14);sets.setScene('chamber',c.objects,{placement:'bench'});assert.equal(sets.placements.bench.visible,true);assert.equal(sets.placements.channel.visible,false);sets.setWorldState({placement:'carried'});assert.equal(sets.placements.bench.visible,false);assert.equal(sets.placements.channel.visible,false);sets.setWorldState({placement:'channel'});assert.equal(sets.placements.channel.visible,true);assert.equal(sets.placements.bench.visible,false);const city=arc2124Scenes.find(s=>s.episode===23);sets.setScene('restoration',city.objects,{distribution:'center'});assert.equal(sets.placements.center.visible,true);assert.equal(sets.placements.outer.visible,false);sets.setWorldState({distribution:'carried'});assert.equal(sets.placements.center.visible,false);assert.equal(sets.placements.outer.visible,false);sets.setWorldState({distribution:'outer'});assert.equal(sets.placements.outer.visible,true);sets.setScene('chamber',[]);sets.motion={matches:false};sets.render({},1000);assert.notEqual(sets.water.position.y,0);sets.motion.matches=true;sets.render({},2000);assert.equal(sets.water.position.y,0);sets.setScene('opening');assert.equal(shop.visible,true);assert.equal(sets.getObstacles().length,0);sets.dispose();
console.log('Ep14–24 scene start collision, station reachability/LOS, reduced-motion water and disposal pass; no WebGL/device visual QA.');
