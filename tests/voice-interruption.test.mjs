import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../dist/immersive/opening.mjs',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function speakOpening('),source.indexOf('function activateAudioIfWanted()'));
let rejectPlay,spoken=0;class MockAudio{play(){return new Promise((_,reject)=>{rejectPlay=reject})}pause(){}}
const ctx={state:{narration:true},openingVoice:()=>'./voice/test.mp3',speak:()=>spoken++,audio:{setNarrating(){}},Audio:MockAudio,setTimeout:()=>1,clearTimeout:()=>{}};
const api=runInNewContext(`let speechEpoch=0,voicePlayer=null,narrationPending=false,speechTimer=null,voicePlayEpoch=0;${fn}\n({speakOpening,pauseAndResume:()=>{voicePlayEpoch++}})`,ctx);
api.speakOpening('line','ep1-intro-1');api.pauseAndResume();rejectPlay(Object.assign(new Error('interrupted'),{name:'AbortError'}));await Promise.resolve();await Promise.resolve();
assert.equal(spoken,0,'a stale play rejection must not trigger TTS after pause or resume');
console.log('Per-clip pause/play promise race passed.');

