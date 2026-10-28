import assert from 'node:assert/strict';
import {ImmersiveAudio,SCENE_SOUND} from '../dist/immersive/audio.mjs';
class Param{constructor(){this.value=0;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}setTargetAtTime(v){this.value=v;}cancelScheduledValues(){}}
class Node{constructor(){this.frequency=new Param();this.gain=new Param();this.pan=new Param();this.Q=new Param();}connect(n){return n;}start(){}stop(){this.onended?.();}disconnect(){}}
class Context{constructor(){this.currentTime=1;this.sampleRate=8000;this.state='running';this.destination=new Node();this.nodes=[];}async resume(){}async close(){this.state='closed';}make(){const n=new Node();this.nodes.push(n);return n;}createGain(){return this.make();}createOscillator(){return this.make();}createBiquadFilter(){return this.make();}createStereoPanner(){return this.make();}createBufferSource(){return this.make();}createBuffer(_,n){return {getChannelData:()=>new Float32Array(n)};}}
globalThis.AudioContext=Context;
const a=new ImmersiveAudio();assert.equal(await a.enable(),true);const count=a.context.nodes.length;
const profiles=['chamber','search','ascent','vigil','summit','revelation','memory','network','records','restoration','initiation'];
for(let i=0;i<profiles.length;i++){
 const profile=profiles[i],ep=`ep${i+14}`;assert.equal(a.setScene(ep),true);assert.equal(a.scene,profile);const c=SCENE_SOUND[profile];for(const v of [...c.bed,...c.levels,c.water,c.waterCut,c.air,c.airCut,c.shimmer,c.array,c.arrayHz])assert.ok(Number.isFinite(v)&&v>=0);assert.equal(a.sceneNodes.waterFilter.frequency.value,c.waterCut);assert.equal(a.sceneNodes.arrayOsc.frequency.value,c.arrayHz);
}
assert.equal(a.context.nodes.length,count,'profiles crossfade existing layers, not unbounded nodes');
a.setScene('ep14');a.setListener(4,4,0);a.setEmitter('water',4,7);a.setEmitter('array',4,1);a.setEmitter('wood',7,4);assert.ok(a.waterPan.pan.value>.99);assert.ok(a.sceneNodes.arrayPan.pan.value<-.99);assert.ok(a.waterGain.gain.value>0&&a.sceneNodes.arrayGain.gain.value>0);a.setNarrating(true);a.setScene('ep24');assert.equal(a.master.gain.value,.085,'ambience remains ducked while narration is active');a.setNarrating(false);assert.equal(a.master.gain.value,.24);a.mute();assert.equal(a.sceneNodes,null);await a.dispose();delete globalThis.AudioContext;
console.log('Ep14–24 profiles, positional layers and ducking pass mocked Web Audio checks; audible soundscape is not tested.');
