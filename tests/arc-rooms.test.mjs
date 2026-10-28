import assert from 'node:assert/strict';
import * as T from '../dist/immersive/vendor/three.module.js';
import {ArcRooms} from '../dist/immersive/arc-rooms.mjs';
import {arc35Scenes} from '../dist/immersive/arc35.mjs';
import {arc67Scenes} from '../dist/immersive/arc67.mjs';
import {canOccupy,nearestReachable} from '../dist/immersive/engine.mjs';
const map=[[1,1,1,1,1,1,1,1,1],...Array.from({length:6},()=>[1,0,0,0,0,0,0,0,1]),[1,1,1,1,1,1,1,1,1]],scene=new T.Scene(),shop=new T.Group();scene.add(shop);
let renders=0;const sets=new ArcRooms({scene,shop,camera:new T.PerspectiveCamera(),renderer:{},render(){renders++;}});
for(const sc of [...arc35Scenes,...arc67Scenes]){
 const objects=sc.objects,obstacles=sets.setScene(sc.roomId||sc.id,objects),start=sc.start;
 assert.equal(shop.visible,false,`${sc.episode}: shop hidden`);assert.equal(obstacles.length,objects.length,`${sc.episode}: each target has an obstacle`);
 assert.ok(canOccupy(map,start.x,start.y,.18,obstacles),`${sc.episode}: start is clear`);
 const queue=[[Math.round(start.x*10),Math.round(start.y*10)]],seen=new Set([queue[0].join(',')]);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=`${a},${b}`;if(!seen.has(key)&&canOccupy(map,a/10,b/10,.18,obstacles)){seen.add(key);queue.push([a,b]);}}}
 for(const target of objects){const ok=queue.some(([xi,yi])=>{const x=xi/10,y=yi/10,angle=Math.atan2(target.y-y,target.x-x);return nearestReachable(map,{x,y,angle},objects,1.35,.6,obstacles)?.id===target.id;});assert.ok(ok,`${sc.episode}: ${target.id} reachable with collision and line of sight`);}
 sets.render({});
}
sets.setScene('mira-workshop',[{id:'mounting',label:'Mira’s mounting',x:3.4,y:3},{id:'channel',label:'Water channel',x:6.6,y:2}]);
const visibility=()=>[sets.mountVisuals.mounting.visible,sets.mountVisuals.channel.visible];assert.deepEqual(visibility(),[true,false]);sets.setMountingState('carried');assert.deepEqual(visibility(),[false,false]);sets.setMountingState('coupled');assert.deepEqual(visibility(),[false,true]);sets.setMountingState('isolated');assert.deepEqual(visibility(),[true,false]);assert.equal(sets.setMountingState('bad'),false);
sets.setScene('opening');assert.equal(shop.visible,true);assert.equal(sets.getObstacles().length,0);assert.equal(renders,5);
sets.setScene('canal',[]);const barge=sets.barge;assert.ok(barge,'canal has a physical barge group');sets.motionQuery={matches:false};sets.render({},0);const startX=barge.position.x;sets.render({},5500);assert.ok(barge.position.x>startX+.5,'barge visibly drifts without advancing puzzle state');const frozenX=barge.position.x,frozenY=barge.position.y;sets.motionQuery.matches=true;sets.render({},11000);assert.equal(barge.position.x,frozenX,'reduced motion freezes the barge in place');assert.equal(barge.position.y,frozenY);sets.setScene('opening');assert.equal(sets.barge,null);sets.dispose();
console.log('Five authored sets and every station reachable; mount visuals move between positions; barge drift and reduced motion passed; shop restoration passed. Source-level only, no WebGL visual QA.');
