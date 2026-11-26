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

## Shop camera playtest

From the title, select **Try both shop cameras**, or open [Kaelan’s shop](dist/immersive/shop/). The trial has two independent local saves. **Journal → Replay this view** starts that camera again. The introductory scene, crystal experiment, journal and hints are shared by both views. The three-quarter version adds floor walking around the bench. The two camera links can also start a session directly: append `?view=first` or `?view=third` to the shop URL.

For the camera comparison, give three fresh players each starting view. Ask them to investigate the rejected shipment without explaining the controls. Watch the first destination they try, missed taps, requests for help, and whether they can tell you what the comparison proves. Then let each player try the other view and ask which one they would choose for another episode and why. Use first exposure to compare navigation; the second run benefits from knowing the puzzle. Record phone model, browser, and view order with the observations.

After choosing a camera, test the polished opening with five fresh players across iPhone Safari and Android Chrome. The target is four who reach the bench unaided, solve with at most the first hint, and explain their evidence. Test saving mid-experiment and resuming after the browser closes.
