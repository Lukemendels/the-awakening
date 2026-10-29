import assert from 'node:assert/strict';
import {OpeningTrack} from '../dist/immersive/opening-track.mjs';
import {OPENING_FULL_TRACK} from '../dist/immersive/opening-media.mjs';
assert.equal(OPENING_FULL_TRACK.url,null,'absent recording must not be requested');
assert.deepEqual(OPENING_FULL_TRACK.cues,[0,6.088,15.009,19.048,19.801,24.405,30.534]);
class Media {
 constructor(){this.currentTime=0;this.listeners={};this.paused=true;this.reject=null;}
 addEventListener(n,f){this.listeners[n]=f}
 removeEventListener(n){delete this.listeners[n]}
 fire(n){this.listeners[n]?.()}
 play(){this.paused=false;return new Promise((_,reject)=>{this.reject=reject})}
 pause(){this.paused=true}
}
let shown=[],finished=0,failed=0,timers=new Map(),id=0;
const media=new Media(),track=new OpeningTrack({media,cues:[0,2,4],onShot:i=>shown.push(i),onFinish:()=>finished++,onFailure:()=>failed++,setTimer:f=>{timers.set(++id,f);return id},clearTimer:n=>timers.delete(n)});
track.play();assert.equal(track.status,'waiting');media.fire('playing');assert.equal(track.status,'playing');
media.currentTime=2.1;media.fire('timeupdate');assert.deepEqual(shown,[1]);
const staleTimer=[...timers.values()][0];track.pause();staleTimer();assert.equal(failed,0,'a stale watchdog cannot fail a paused track');media.fire('ended');assert.equal(finished,0,'a queued ended event cannot complete while paused');const reject=media.reject;track.play();reject(new Error('interrupted'));await Promise.resolve();assert.equal(failed,0,'stale play rejection must not fail resumed track');
track.setMode('read');assert.equal(track.paused,true);track.play();media.currentTime=4.1;media.fire('timeupdate');assert.equal(track.paused,true,'read mode pauses at next cue');assert.deepEqual(shown,[1,2]);
track.back();assert.equal(media.currentTime,2);track.next();assert.equal(media.currentTime,4);track.next();track.next();assert.equal(finished,1);assert.equal(timers.size,0);
const broken=new Media();let watchdog;const stalled=new OpeningTrack({media:broken,cues:[0],onShot:()=>{},onFinish:()=>{},onFailure:()=>failed++,setTimer:f=>{watchdog=f;return 1},clearTimer:()=>{}});stalled.play();broken.fire('waiting');watchdog();assert.equal(failed,1,'stall has bounded fallback');broken.fire('ended');assert.equal(failed,1);
console.log('Whole-track media time, pause, seek, read, stale promise and stall fallback passed.');
