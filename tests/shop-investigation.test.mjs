import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,restore,testSpecimen,keepSpecimen,sunsetAngle,crystalAngle} from '../dist/immersive/shop/investigation.mjs';
import {stations,pathTo,walkable} from '../dist/immersive/shop/walk.mjs';

test('either pair and either test order lead to a deliberate, recoverable decision',()=>{
  for(const source of ['tray','drawerStone'])for(const first of ['approved','condemned']){
    let s={...fresh(),[source]:true,sketch:true};
    assert.equal(keepSpecimen(s,'condemned'),false);
    assert.ok(testSpecimen(s,first));
    assert.equal(keepSpecimen(s,'condemned'),false);
    s=restore(JSON.parse(JSON.stringify(s)));
    assert.ok(testSpecimen(s,first==='approved'?'condemned':'approved'));
    assert.deepEqual([s.lamp,s.turn],[sunsetAngle,crystalAngle]);
    assert.equal(keepSpecimen(s,'approved'),false);
    assert.equal(s.phase,'shop');
    assert.ok(keepSpecimen(s,'condemned'));
    assert.deepEqual(restore(s),s);
    assert.equal(testSpecimen(s,'approved'),false);
  }
});
test('an empty bench and missing sketch cannot produce a result; old finished scenes resume',()=>{
  for(const s of [fresh(),{...fresh(),sketch:true},{...fresh(),tray:true}]){
    assert.equal(testSpecimen(s,'approved'),false);
    assert.equal(s.clearSeen,false);
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

test('returning from the quay uses the original shop floor and reachable fittings',async()=>{
  const {workshopLayout}=await import('../dist/immersive/season/workshop.mjs');
  const layout=workshopLayout({objects:['old_wall','research','canal_light'].map(id=>({id,label:id}))});
  assert.equal(layout.walkable,walkable);
  for(const station of Object.values(layout.stations)){
    assert.ok(pathTo(layout.start,station.approach));
    assert.ok(Math.hypot(station.point[0]-station.approach[0],station.point[2]-station.approach[1])<1.35);
  }
});
test('archive and temple furniture have fixed depth and an independently movable crystal',async()=>{
  const T=await import('../dist/immersive/vendor/three.module.js');
  const {furnishRoom}=await import('../dist/immersive/season/furnishings.mjs');
  const build=furnishRoom(()=>null);
  for(const kind of ['desk','plan','window-bench','city','plinth','scope','mount','basin','cargo','arch','shutter','robe']){
    const {root,token}=build(kind);
    const sides=new T.Box3().setFromObject(root).getSize(new T.Vector3());
    assert.ok(sides.x>.4&&sides.y>.45&&sides.z>.1,kind);
    if(kind==='plinth'){token.visible=false;assert.ok(root.children.some(part=>part.visible));}
  }
});
