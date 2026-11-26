import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {chapter,resultText} from '../dist/immersive/season/chapters.mjs';
import {currentBlock,advance,afterCanal} from '../dist/immersive/season/journey.mjs';
import {floorPlan} from '../dist/immersive/season/layout.mjs';
import {pathTo} from '../dist/immersive/shop/walk.mjs';

const route=[
  'canal_light:observe old_wall:expose research:conceal',
  'volume:read price:read comparison:manufactured keeper:speak western_stacks:open lamp:oblique',
  'mounting:isolated channel:coupled mount-notebook:mount-channel',
  'workshop-record:ordinary workshop-record:aligned bell-record:bell-aligned kai-notebook:shared-alignment',
  'vendor-signal:observe route-chart:canal',
  'specimen-setup:paired specimen-setup:take marked-wall:place marked-wall:observe marked-wall:take water-channel:place water-channel:observe experiment-notes:localized',
  'architecture-record:overlay water-record:overlay city-model:resonance','continue:continue',
  'array:take center:place junction:trace','doorway:follow','array:take grammar:place grammar:turn-a',
  'grid:observe route:wait route:move','lower:follow upper:follow ascent:follow','continue:continue',
  'original-markers:observe comparison:altered','leader:continue','continue-memory:continue','continue:continue',
  'altered-grid:read evidence-table:supply','central-channel:take outer-channel:place distribution:linked distribution:observe','initiation:accept'
];
test('every chapter has reachable stations, media, a valid finding checkpoint and a continuous handoff',async()=>{
  let save={arc:afterCanal()};
  for(let ep=4;ep<=24;ep++){
    const block=currentBlock(save),p=save[block.key];assert.equal(p.episode,ep);assert.ok(block.valid(p));
    const scene=block.scene(p),ch=chapter(ep),plan=floorPlan(scene);
    await access(new URL(ch.plate));
    await access(new URL('../dist/assets/generated/season/'+ch.world+'.webp',import.meta.url));
    await access(new URL('../dist/assets/generated/season/floor-'+ch.world+'.webp',import.meta.url));
    for(const person of plan.people)await access(new URL('../dist/assets/generated/season/person-'+person.name+'.webp',import.meta.url));
    for(const s of Object.values(plan.stations))assert.ok(s.approach&&pathTo(plan.start,s.approach,plan.walkable),ep+' '+s.label);
    p.phase='room';
    for(const pair of route[ep-4].split(' ')){
      const [id,choice]=pair.split(':');
      if(ep===6&&id==='channel')save.arc.mount='coupled';
      if(ep===18&&choice==='altered')save[block.key]=block.act(save[block.key],{type:'register',offset:0}).progress;
      const result=block.act(save[block.key],{type:'interact',id,choice});save[block.key]=result.arc??result.progress;
    }
    assert.ok(block.solved(save[block.key]),'ep '+ep);
    save[block.key]=block.outro(save[block.key]);assert.equal(save[block.key].phase,'outro');
    save=JSON.parse(JSON.stringify(save));advance(save);assert.ok(currentBlock(save).valid(save[currentBlock(save).key]));
    // Older releases stopped between blocks and waited on a separate chapter menu.
    if(ep===7||ep===13){
      const old=structuredClone(save);delete old[currentBlock(old).key];const complete=structuredClone(old[block.key]);
      advance(old);assert.equal(old[currentBlock(old).key].episode,ep+1);assert.deepEqual(old[block.key],complete);
    }
  }
  assert.equal(save.finalArc.phase,'done');assert.equal(save.arc.phase,'done');assert.equal(save.nextArc.phase,'done');
});

test('alternate evidence remains specific to the player’s route',()=>{
  assert.match(resultText(8,{route:'canal'}),/vendor/);
  assert.match(resultText(8,{route:'inner'}),/dock worker/);
  const finding=resultText(10,{flags:{water:true,astronomy:true}});
  assert.match(finding,/canal survey/);assert.doesNotMatch(finding,/building plans/);
  assert.match(resultText(22,{},'supply'),/authorized merchant houses/);
  assert.match(resultText(22,{},'archive'),/public copies/);
});
