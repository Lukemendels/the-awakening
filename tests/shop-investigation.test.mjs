import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,restore,expose,sunsetAngle,crystalAngle} from '../dist/immersive/shop/investigation.mjs';
import {stations,pathTo,walkable} from '../dist/immersive/shop/walk.mjs';

test('the first focused pulse commits the inspector scene without a control specimen',()=>{
  const s={...fresh(),tray:true,sketch:true};
  assert.equal(expose(s),false);
  s.lamp=sunsetAngle;assert.equal(expose(s),false);
  s.turn=crystalAngle+4;assert.equal(expose(s),true);
  assert.equal(s.clearSeen,false);assert.equal(s.phase,'film');assert.equal(s.shot,0);
  assert.equal(expose(s),false);
  assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
});
test('equipment, sketch, lighting and the actual condemned specimen all matter',()=>{
  for(const change of [{tray:false},{sketch:false},{lamp:-30},{turn:22},{specimen:'approved'}]){
    const s={...fresh(),sketch:true,tray:true,lamp:sunsetAngle,turn:crystalAngle,...change};
    assert.equal(expose(s),false);assert.equal(s.phase,'shop');
    if(s.specimen==='approved')assert.equal(s.clearSeen,true);
  }
  assert.equal(restore({phase:'dock'}).phase,'shop');
  assert.equal(restore(null,{solved:true}).phase,'film');
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

test('dragging the lamp by its visible travel reproduces the sketched shadow',async()=>{
  const {lampPosition,dragLamp,propAt}=await import('../dist/immersive/shop/optics.mjs');
  const s=fresh(),foot=lampPosition(s.lamp),target=lampPosition(sunsetAngle);
  assert.equal(propAt(foot.x,foot.y-65,s),'lamp');
  assert.equal(propAt(450,215,s),'turn');
  assert.equal(propAt(870,20,s),null);
  assert.equal(dragLamp(s.lamp,target.y-foot.y),sunsetAngle);
  assert.equal(dragLamp(0,999),45);
  assert.equal(dragLamp(0,-999),-45);
});
