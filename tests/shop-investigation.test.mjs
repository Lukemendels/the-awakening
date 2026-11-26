import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,restore,trace,holdCrate,reading,beam,sweep,profile,ticket,packets,manifest} from '../dist/immersive/shop/investigation.mjs';
import {stations,pathTo,walkable} from '../dist/immersive/shop/walk.mjs';

test('two same-endpoint paths separate at the rivet, and only the temple path and matching crate pass',()=>{
  for(const order of ['012','021','102','120','201','210']){
    for(const source of ['tray','drawerStone']){
      const s={...fresh(),order,[source]:true,sketch:true};
      for(const packet of packets){
        s.packet=packet;sweep(s,0);
        assert.equal(holdCrate(s,ticket(packet).crate),'missing');
        sweep(s,.5);assert.deepEqual(restore(s),s);sweep(s,1);
      }
      const both=packets.filter(id=>reading(s,id,0)==='round'&&reading(s,id,1)==='square');
      assert.equal(both.length,2);
      assert.deepEqual(both.map(id=>Math.sign(beam(profile(s,id),.5).y)).sort(),[-1,1]);
      for(const packet of packets)for(const entry of manifest){
        const attempt=restore({...s,packet,book:true});
        const expected=profile(s,packet)===2?'path':reading(s,packet,1)!=='square'?'turn':ticket(packet)!==entry?'ticket':'held';
        assert.equal(holdCrate(attempt,entry.crate),expected);
        assert.deepEqual(restore(attempt),attempt);
        assert.equal(attempt.phase,expected==='held'?'film':'shop');
      }
    }
  }
});
test('old checkpoints and incomplete tracings survive a bench revision safely',()=>{
  assert.equal(restore({phase:'dock',sketch:true,tray:true}).phase,'dock');
  assert.equal(restore(null,{solved:true}).phase,'film');
  assert.deepEqual(restore({phase:'shop',sketch:true,tray:true,featherSeen:true,clearSeen:true}).tracings,{});
  const s={...fresh(),sketch:true};assert.equal(trace(s),false);
  s.drawerStone=true;s.notch=1;trace(s);assert.equal(holdCrate(s,'14'),'missing');
  assert.deepEqual(restore(s),s);
  assert.deepEqual(restore({...s,tracings:{A:12,B:-1}}).tracings,{});
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

test('cargo footprints stop free walking and each crate is reachable from the common viewing position',async()=>{
  const {cargo,freightStations,loadingWalkable}=await import('../dist/immersive/shop/freight.mjs');
  for(const item of cargo){
    assert.equal(loadingWalkable(item.x,item.z),false);
    const approach=freightStations['crate-'+item.crate].approach;
    assert.ok(pathTo([4.54,4.52],approach,loadingWalkable));
    assert.ok(pathTo(approach,freightStations.window.approach,loadingWalkable));
  }
});
