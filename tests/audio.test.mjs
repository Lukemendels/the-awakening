import assert from 'node:assert/strict';
import {ImmersiveAudio} from '../dist/immersive/audio.mjs';
const a=new ImmersiveAudio();a.setListener(0,0,0);
assert.ok(Math.abs(a.spatial(1,0).pan)<1e-9,'source directly ahead remains centered');
assert.ok(a.spatial(0,1).pan>.99,'source to the right pans right');
a.setListener(0,0,Math.PI/2);assert.ok(Math.abs(a.spatial(0,1).pan)<1e-9,'panning follows heading');
assert.ok(a.spatial(1,0).pan<-.99,'turning moves source to the left');
assert.ok(a.spatial(10,0).attenuation<a.spatial(1,0).attenuation,'distance reduces level');
a.cue('step');a.mute();await a.dispose();assert.equal(await a.enable(),false,'disposed engine does not restart');console.log('Spatial panning, attenuation and silent lifecycle checks passed; audible mix is not tested.');
