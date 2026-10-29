import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {OPENING_IMAGES,OPENING_VOICES,openingImage,openingVoice} from '../dist/immersive/opening-media.mjs';
assert.equal(Object.keys(OPENING_IMAGES).length,5);assert.equal(Object.keys(OPENING_VOICES).length,7);
for(const id of Object.keys(OPENING_IMAGES))assert.equal(openingImage(id,'existing.webp'),'existing.webp');
for(const id of Object.keys(OPENING_VOICES))assert.equal(openingVoice(id),null);
const source=readFileSync(new URL('../dist/immersive/opening.mjs',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function speakOpening('),source.indexOf('function activateAudioIfWanted()'));
let created=0,spoken=0,instance,route=null;
class AudioMock{constructor(path){created++;this.path=path;instance=this}play(){return Promise.resolve()}pause(){}}
const ctx={state:{narration:true},openingVoice:()=>route,speak:()=>spoken++,audio:{setNarrating(){}},Audio:AudioMock,setTimeout:()=>1,clearTimeout:()=>{}};
const api=runInNewContext(`let speechEpoch=0,voicePlayer=null,narrationPending=false,speechTimer=null;${fn}\n({speakOpening})`,ctx);
api.speakOpening('caption','ep1-intro-1');assert.equal(created,0);assert.equal(spoken,1);
route='./voice/ep1-intro-1.mp3';api.speakOpening('caption','ep1-intro-1');assert.equal(created,1);instance.onerror();instance.onerror();assert.equal(spoken,2);
ctx.state.narration=false;api.speakOpening('caption','ep1-intro-2');assert.equal(created,1);
console.log('Optional opening media slots, narration preference and voice fallback passed.');

