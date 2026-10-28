import assert from 'node:assert/strict';import {freshArc,restoreArc,arcAction,beginOutro,advanceArc,sceneFor} from '../dist/immersive/arc-progress.mjs';
let a=freshArc();assert.equal(a.episode,3);a.phase='room';let early=beginOutro(a);assert.equal(early.phase,'room');
for(const [id,choice] of [['near_view','observe'],['far_view','observe'],['chart','inspect'],['reflection','corresponds']])a=arcAction(a,{type:'interact',id,choice}).arc;
a=beginOutro(a);assert.equal(a.phase,'outro');a=advanceArc(a);assert.equal(a.episode,4);assert.equal(sceneFor(a).id,'workshop');assert.equal(restoreArc(JSON.parse(JSON.stringify(a))).episode,4);
assert.equal(restoreArc({version:1,episode:7,phase:'room',story35:{}}).episode,3);assert.equal(advanceArc(freshArc()).episode,3);
console.log('Arc progression guards, transitions and resumable state passed.');
// Full authored continuation, wrong-action checks and save/reload at every chapter.
let journey=freshArc();const paths={3:[['near_view','observe'],['far_view','observe'],['chart','inspect'],['reflection','corresponds']],4:[['canal_light','observe'],['old_wall','expose'],['research','conceal']],5:[['price','read'],['volume','read'],['comparison','manufactured'],['keeper','speak'],['western_stacks','open'],['lamp','oblique']],6:[['mounting','isolated'],['channel','coupled'],['mount-notebook','mount-channel']],7:[['workshop-record','ordinary'],['workshop-record','aligned'],['bell-record','bell-aligned'],['kai-notebook','shared-alignment']]};
for(let ep=3;ep<=7;ep++){
 assert.equal(journey.episode,ep);journey.phase='room';assert.equal(beginOutro(journey).phase,'room','cannot advance before evidence');
 for(const [id,choice] of paths[ep]){journey=arcAction(journey,{type:'interact',id,choice}).arc;journey=restoreArc(JSON.parse(JSON.stringify(journey)));}
 journey=beginOutro(journey);assert.equal(journey.phase,'outro');journey=restoreArc(JSON.parse(JSON.stringify(journey)));journey=advanceArc(journey);
}
assert.equal(journey.phase,'done');assert.equal(journey.episode,7);console.log('Episodes 3–7 continuous journey, evidence gates and reload checkpoints passed.');
const {canResumeArc}=await import('../dist/immersive/arc-progress.mjs');
assert.equal(canResumeArc(freshArc()),true);assert.equal(canResumeArc({version:2,episode:3,phase:'room',story35:{}}),false);assert.equal(canResumeArc({version:1,episode:3,phase:'room',story35:{version:1,episode:3}}),false);
// The continuation is nested in the existing immersive save; old v1 and original v4 survive.
const {freshSave,writeSave,loadSave,SAVE_KEY}=await import('../dist/immersive/save.mjs');let store={'awakening-v4':'legacy-bytes'};const storage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};let existing=freshSave();existing.scene='complete';existing.flags={solved:true,specimen:'condemned'};existing.arc=journey;assert.ok(writeSave(storage,existing));const restored=loadSave(storage);assert.equal(restored.flags.solved,true);assert.equal(restored.arc.phase,'done');assert.equal(store['awakening-v4'],'legacy-bytes');assert.ok(store[SAVE_KEY]);
let valid6=freshArc();for(let ep=3;ep<6;ep++){valid6.phase='room';for(const [id,choice] of paths[ep])valid6=arcAction(valid6,{type:'interact',id,choice}).arc;valid6=advanceArc(beginOutro(valid6));}assert.ok(canResumeArc(valid6));let bad6=structuredClone(valid6);bad6.story67.observations.isolated='yes';assert.equal(canResumeArc(bad6),false);bad6=structuredClone(valid6);bad6.story67.observations.unknown=true;assert.equal(canResumeArc(bad6),false);
let malformed=freshArc();malformed.story35.hints={'3':4};assert.equal(canResumeArc(malformed),false);malformed=freshArc();malformed.story35.journal=Array(9).fill('entry');assert.equal(canResumeArc(malformed),false);malformed=freshArc();malformed.story67={version:1};assert.equal(canResumeArc(malformed),false);
