# Opening media import contract

`dist/immersive/opening-media.mjs` is the single opt-in manifest. Image slots use the following paths relative to `dist/immersive/`; keep `enabled: false` until each verified WebP is present. A disabled entry makes no request; a missing enabled image falls back to the existing shot art. The crystal image is atmospheric only: the comparison's branching-ring geometry remains the deterministic drawing in the inspector.

| Shot | File in repository |
| --- | --- |
| ep1-intro-2 | dist/assets/generated/kaelan-loupe-v1.webp |
| ep1-intro-3 | dist/assets/generated/crystal-fracture-v1.webp |
| ep1-intro-5 | dist/assets/generated/plaza-aftermath-v1.webp |
| ep1-intro-6 | dist/assets/generated/thalor-address-v1.webp |
| ep1-intro-7 | dist/assets/generated/ceremony-shard-v1.webp |

Voice slots are `ep1-intro-1` through `ep1-intro-7`. Each is `null` until its verified recording is supplied. Set that entry to `./voice/ep1-intro-N.mp3` or `./voice/ep1-intro-N.wav` with the actual file at `dist/immersive/voice/ep1-intro-N.mp3` or `.wav`. Do not enable absent files. Recorded voice is only played when the player enables narration; if missing or unable to play, the optional device speech preview is used when available. Captions and manual progression remain available without either voice. Add rights and provenance to CREDITS.md when importing media.
