import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {chapters,artUrl} from '../dist/novel/panels.mjs';
import {scores} from '../dist/novel/sound.mjs';
import {offsets} from '../dist/immersive/foley/offsets.mjs';
import {episodes} from '../dist/episodes.mjs';

test('each episode is readable and each cut references playable art and Foley',async()=>{
  assert.deepEqual(chapters.map(c=>c.title),episodes.map(e=>e.title));
  const wav=await readFile(new URL('../dist/immersive/foley/materials.wav',import.meta.url));
  const duration=wav.readUInt32LE(40)/wav.readUInt32LE(28);
  for(const c of chapters){
    assert.ok(c.panels.length>=2);
    for(const p of c.panels){
      assert.ok(p.caption&&Boolean(p.speaker)===Boolean(p.line));
      await access(new URL(artUrl(p.art)));
      assert.ok(scores[p.sound].hits.length);
      for(const hit of scores[p.sound].hits){
        const [at,length]=offsets[hit.name];
        assert.ok(at>=0&&at+length<=duration&&length>0);
        assert.ok(hit.rate>0&&hit.gain>0&&Math.abs(hit.pan)<=1&&hit.at>=0);
      }
    }
  }
});
