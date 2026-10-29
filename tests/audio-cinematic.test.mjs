import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Exercise the actual opening functions with delayed Web Audio unlock and TTS.
const source=readFileSync(new URL('../dist/immersive/opening.mjs',import.meta.url),'utf8');
const pick=prefix=>{const line=source.split('\n').find(line=>line.startsWith(prefix));assert.ok(line,`missing ${prefix}`);return line;};
const functions=['let speechEpoch=','function speak(','function stopSpeech(','function playCinematic('].map(pick).join('\n');
function harness(){
  let unlock;const pending=new Promise(resolve=>unlock=resolve),cues=[];
  const audio={enabled:false,enable:()=>pending,cinematic:(...args)=>cues.push(args),setNarrating:()=>{}};
  const state={sound:true,narration:true};
  const window={speechSynthesis:{cancel(){},speak(){}}};
  class SpeechSynthesisUtterance {constructor(text){this.text=text;}}
  const api=runInNewContext(`${functions}\n({speak,stopSpeech,playCinematic})`,{audio,state,window,SpeechSynthesisUtterance,setTimeout:()=>1,clearTimeout:()=>{}});
  return {api,audio,cues,unlock};
}
{
  const h=harness();h.api.stopSpeech();h.api.playCinematic(1,'intro',0);h.api.speak('Opening narration');
  h.audio.enabled=true;h.unlock(true);await Promise.resolve();
  assert.deepEqual(h.cues,[[1,'intro',0]],'same-screen narration preserves the deferred opening cue');
}
{
  const h=harness();h.api.stopSpeech();h.api.playCinematic(1,'intro',0);h.api.speak('First');
  h.api.stopSpeech();h.api.playCinematic(12,'intro',0);h.api.speak('Next');
  h.audio.enabled=true;h.unlock(true);await Promise.resolve();
  assert.deepEqual(h.cues,[[12,'intro',0]],'advancing suppresses the previous cue');
}
{
  const h=harness();h.api.stopSpeech();h.api.playCinematic(1,'intro',0);h.api.speak('First');h.api.stopSpeech();
  h.audio.enabled=true;h.unlock(true);await Promise.resolve();
  assert.deepEqual(h.cues,[],'skipping suppresses the pending cue');
}
console.log('Deferred cinematic cue survives narration but not next or skip.');
