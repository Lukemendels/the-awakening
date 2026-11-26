import assert from 'node:assert/strict';
import {walkable,pathTo,stations} from '../dist/immersive/shop/walk.mjs';

// The guided camera approaches actual props from a clear spot with a view of the target.
for(const station of Object.values(stations)){
  const [x,z]=station.approach,[px,,pz]=station.point;
  assert.ok(walkable(x,z),station.label);
  assert.ok(pathTo([4.5,5.75],station.approach),station.label);
  assert.ok(Math.hypot(x-px,z-pz)<1.6,station.label);
}
