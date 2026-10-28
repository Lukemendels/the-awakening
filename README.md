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
