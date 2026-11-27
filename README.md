# The Awakening

A story-led, first-person browser game set in Atlantis. Play the complete Season One immersive story in landscape orientation. The earlier, non-immersive version remains available via the link in the game.

## Run locally

Serve this directory over HTTP (JavaScript modules generally cannot be opened reliably as a `file://` page):

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A WebGL-capable browser is needed. Progress is stored in the browser on the current device and origin. Audio is optional; device speech is an optional synthetic preview, not recorded voice acting.

## GitHub Pages

In repository settings, enable Pages using **Deploy from a branch**, select the default branch and repository root. The root page opens the game using relative paths, including on a project-site subpath. Publishing this repository makes its contents public.

## Tests

With a current Node.js installation:

```sh
node --test tests/*.test.mjs
```

## Licenses and credits

- **First-party executable code:** MIT, as set out in [LICENSE](LICENSE). This covers the first-party HTML, CSS and JavaScript implementation and tests, but does not change the license of creative content embedded in those files.
- **Story, dialogue and artwork:** [CC BY 4.0](LICENSE-CONTENT), to the extent Luke Mendelsohn holds and can grant copyright or similar rights. This includes story and dialogue strings and narrative data embedded in JavaScript, and the creative imagery in `dist/assets/`; embedding creative material in a code file does not relicense it as MIT. The license does not assert that AI-only output necessarily creates copyright or grant rights held by others.
- **Third-party code:** Three.js 0.186.1 is separately MIT licensed; its original notice is in `dist/immersive/vendor/THREE-LICENSE.txt`. No first-party license overrides third-party terms.

See [CREDITS.md](CREDITS.md) for attribution and artwork provenance. Suggested content attribution: “Based on *The Awakening* by Luke Mendelsohn, https://github.com/Lukemendels/the-awakening, licensed under CC BY 4.0.” Include a link to the license and indicate changes where required.

- **Optional opening voice recording:** Separate from the code and story/art licenses above. The ElevenLabs-generated recording is provided for the noncommercial playtest only; see [CREDITS.md](CREDITS.md).

## First-person opening

[View the playable bench artwork](dist/assets/generated/light-bench-study.webp).

Play Season One from the title, or [start at Kaelan’s shop](dist/immersive/shop/index.html). Walk and strafe with the left stick, look with the right stick, or use WASD and the arrow keys. Tap a station to approach it. Touch either stick to take over. In the [shop playtest](dist/immersive/shop/index.html?run=smoked-brass), drag the mounted stone, compare its light with the temple tracing and carry a hold ticket to the loading crates. Keyboard players can turn the focused stone with the arrow keys or Home and End. Tapping the ticket and then a crate also attaches it. The dock reflection leads directly into the water-gate investigation.

[Play the expanded opening](dist/immersive/shop/index.html?run=first-light) from the market through the introductions of Mira and Kai. This playtest has its own checkpoint. Each shot waits for you to advance.

The opening remembers the bench, cinematic shot, and dock on this device. Sound is optional, and the cutscene has captions and a pause control. Use **Replay the opening** on the season title to revisit the investigation while retaining later episode progress.

To package the season with captions and optional device narration, run
`python3 tools/package-season.py awakening-season-one.zip`. The archive contains the static game and its notices. The playtest recording is excluded. Extract the archive and serve its root over HTTP.
