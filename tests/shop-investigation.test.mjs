import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,restore,observe,compare} from '../dist/immersive/shop/investigation.mjs';
import {stations,pathTo,walkable} from '../dist/immersive/shop/walk.mjs';

test('the alignment needs the sketch, a backlit control and matching specimen',()=>{
  const state=fresh();
  for(const setup of [{},{tray:true},{sketch:true},{lamp:2,specimen:'condemned'},{turn:0}]){
    Object.assign(state,setup);observe(state);compare(state);assert.equal(state.solved,false);
  }
  state.specimen='approved';observe(state);compare(state);assert.equal(state.solved,false);
  state.specimen='condemned';observe(state);compare(state);
  assert.equal(state.solved,true);
  assert.deepEqual(restore(JSON.parse(JSON.stringify(state))),state);
  assert.equal(restore({solved:true}).solved,false);
});
test('every station and the floor behind the bench have collision-free routes',()=>{
  const points=[[4.5,5.75],[6.5,2],...Object.values(stations).map(s=>s.approach)];
  for(const from of points)for(const to of points){
    const path=pathTo(from,to);assert.ok(path);
    let p=from;
    for(const q of path){
      for(let i=0;i<=100;i++)assert.ok(walkable(p[0]+(q[0]-p[0])*i/100,p[1]+(q[1]-p[1])*i/100));
      p=q;
    }
    assert.deepEqual(p,to);
  }
  assert.equal(pathTo(points[0],[6.5,3.1]),null);
});
