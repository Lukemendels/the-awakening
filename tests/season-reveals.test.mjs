import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {chapter} from '../dist/immersive/season/chapters.mjs';
import {sequence} from '../dist/immersive/season/reveals.mjs';
import {arc1113Scenes} from '../dist/immersive/arc1113.mjs';
import {floorPlan} from '../dist/immersive/season/layout.mjs';
import {pathTo} from '../dist/immersive/shop/walk.mjs';

test('every finding has usable shots, captions, and an intentional handoff',async()=>{
  for(let ep=4;ep<=24;ep++){
    const c=chapter(ep),beats=sequence(ep,c,c.meaning);
    for(const beat of beats){
      await access(new URL(beat.art));
      assert.ok(beat.title&&beat.line&&beat.next);
    }
  }
  const scene=ep=>sequence(ep,chapter(ep),chapter(ep).meaning);
  assert.deepEqual(scene(12).map(s=>s.effect),['match','seam']);
  assert.deepEqual(scene(23).map(s=>s.effect),['circuit','beacon']);
  assert.match(scene(21)[0].title,/father/);assert.match(scene(21)[0].lead,/safe/);
  assert.match(scene(24).at(-1).line,/rejected crystal/);
  assert.equal(scene(24).at(-1).next,'Finish Season One');
});
test('the opened doorway is reachable from every warehouse station, with solid masonry beside it',()=>{
  const room=arc1113Scenes.find(s=>s.episode===12);
  const closed=floorPlan(room),open=floorPlan(room,true);
  const passage=open.stations.passage;
  assert.ok(!closed.walkable(...passage.approach));
  assert.ok(open.walkable(...passage.approach));
  assert.ok(!open.walkable(passage.approach[0],passage.approach[1]+.8));
  for(const station of Object.values(closed.stations)){
    assert.ok(pathTo(station.approach,passage.approach,open.walkable),station.label);
  }
});
test('the fresh playtest carries a separate save through relative chapter links and hashes',async()=>{
  const saved=globalThis.location;
  try{
    globalThis.location=new URL('https://game.example/dist/immersive/canal/index.html?run=season-one');
    const {journeyUrl,loadSave,writeSave,freshSave,SAVE_KEY}=await import('../dist/immersive/save.mjs?isolated-test');
    const disk=new Map([[SAVE_KEY,'existing progress']]);
    const storage={getItem:k=>disk.get(k),setItem:(k,v)=>disk.set(k,v)};
    const checkpoint={...freshSave(),x:6};writeSave(storage,checkpoint);
    assert.equal(loadSave(storage).x,6);assert.equal(disk.get(SAVE_KEY),'existing progress');
    assert.equal(journeyUrl('../index.html#continue-journey'),'https://game.example/dist/immersive/index.html?run=season-one#continue-journey');
  }finally{if(saved)globalThis.location=saved;else delete globalThis.location;}
});
