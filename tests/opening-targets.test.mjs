import assert from 'node:assert/strict';
import {nearestReachable} from '../dist/immersive/engine.mjs';
const map=[[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],p={x:1.5,y:2,angle:0},objects=[{id:'closer',x:2,y:2.2},{id:'reticle',x:2.6,y:2}];
assert.equal(nearestReachable(map,p,objects,1.35,.72).id,'reticle','alignment takes priority over distance');
assert.equal(nearestReachable(map,p,[{id:'a',x:2.5,y:2},{id:'b',x:2.5,y:2.03}],1.35,.72,[],'b').id,'b','small alignment changes retain current target');
const shop=[[1,1,1,1,1,1,1,1,1],...[1,2,3,4,5,6].map(()=>[1,0,0,0,0,0,0,0,1]),[1,1,1,1,1,1,1,1,1]];const door={id:'door',x:4.5,y:6.82};assert.equal(nearestReachable(shop,{x:4.5,y:5.8,angle:Math.PI/2},[door]).id,'door');
console.log('Reticle priority, target stability, and a reachable door passed.');
