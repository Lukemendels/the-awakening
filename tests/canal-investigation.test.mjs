import test from 'node:test';
import assert from 'node:assert/strict';
import {quay} from '../dist/immersive/canal/quay.mjs';
import {pathTo} from '../dist/immersive/shop/walk.mjs';
import {registered,sheetPose,initialSheet} from '../dist/immersive/canal/tracings.mjs';

test('registration needs both the position and the bearing of the traced rays',()=>{
  assert.equal(registered(initialSheet()),false);
  assert.equal(registered({x:441,y:236,angle:22}),false);
  assert.equal(registered({x:485,y:236,angle:0}),false);
  assert.equal(registered({x:443,y:233,angle:2}),true);
  assert.deepEqual(sheetPose({x:Infinity,y:-400,angle:89}),{x:326,y:105,angle:60});
});
test('both landings and the board can be approached in any order',()=>{
  const places=[quay.start,...Object.values(quay.stations).map(s=>s.approach)];
  for(const a of places)for(const b of places){
    const route=pathTo(a,b,quay.walkable);assert.ok(route);
    let prev=a;for(const end of route){
      for(let i=0;i<=50;i++)assert.ok(quay.walkable(prev[0]+(end[0]-prev[0])*i/50,prev[1]+(end[1]-prev[1])*i/50));
      prev=end;
    }
  }
  assert.equal(pathTo(places[0],[2,5.2],quay.walkable),null);
  assert.ok(quay.height(6.7)>quay.height(2.1));
});
