import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../dist/immersive/opening.mjs',import.meta.url),'utf8');
const start=source.indexOf('let soundToggleEpoch=0;'),end=source.indexOf('\nfunction settings()',start);
assert.ok(start>=0&&end>start);
function harness(){
 let resolve;const pending=new Promise(r=>resolve=r);let saves=0;
 const audio={enabling:null,enable(){this.enabling=pending;return pending},mute(){this.enabling=null}};
 const state={sound:false},control={textContent:''},status={textContent:''};
 const api=runInNewContext(source.slice(start,end)+'\n({toggleSound})',{audio,state,save:()=>saves++});
 return {api,audio,state,control,status,resolve,get saves(){return saves}};
}
{
 const h=harness(),first=h.api.toggleSound(h.control,h.status);assert.match(h.control.textContent,/Starting/);
 await h.api.toggleSound(h.control,h.status);assert.equal(h.state.sound,false);h.resolve(true);await first;
 assert.equal(h.state.sound,false,'late enable cannot undo a user cancellation');assert.match(h.status.textContent,/off/i);
}
{
 const h=harness(),first=h.api.toggleSound(h.control,h.status);h.resolve(true);await first;
 assert.equal(h.state.sound,true);assert.match(h.status.textContent,/Try sound/);await h.api.toggleSound(h.control,h.status);assert.equal(h.state.sound,false);
}
{
 const h=harness(),first=h.api.toggleSound(h.control,h.status);h.resolve(false);await first;
 assert.equal(h.state.sound,false);assert.match(h.status.textContent,/could not start/);
}
console.log('Sound toggle success, failure and pending cancellation passed.');
