# Season One investigation and pacing review

Season One runs from the temple ceremony to the answering harbor. For a fresh playtest, open `dist/immersive/index.html?run=season-one`. The link resumes its own checkpoint on later visits. A regular journey on the same device keeps its own progress.

| Episode | Story contribution | Player experience to preserve or test |
| --- | --- | --- |
| 1 · City of Light and Sound | The ceremony fails in public. | Let players see the temple mark clearly enough to recognize it later. Time how long it takes to reach the first meaningful action. |
| 2 · The Warning | The grading rules threaten Kaelan’s family. | Turn a cloudy stone and compare the whole light path with the temple scratch. Carry the matching ticket to a real crate. |
| 3 · Night’s Secrets | Condemned cargo carries the mystery beyond the shop. | Compare two views of the barge reflection. Check whether the branching relationship is readable when the water changes. |
| 4 · Hidden Patterns | The workshop hides older markings and guards approach. | Let players expose the wall and protect the drawings. Keep those two actions close together. |
| 5 · Hidden Records | Altered grading standards emerge in the archive. | Show price and rejection records together. Check whether players can explain why the numbers challenge the scarcity story. |
| 6 · The Crystal Artisan | Mira introduces an experiment and becomes an ally. | Keep one mounted specimen visible as its position changes. Ask which variable changed. |
| 7 · The Interpreter | Kai connects the workshop evidence to the temple tower. | Let players compare the same rhythm at different strengths before Kai explains its significance. |
| 8 · Night Navigation | The disposal route and its watchers become a risk. | Show the route evidence together and allow immediate reconsideration of a poor route. |
| 9 · The Warehouse | A safer base makes paired-crystal experiments possible. | Show a previous setup beside the current result so players can distinguish changes in location and crystal count. |
| 10 · Patterns of Power | Separate discoveries become a theory about the whole city. | Let players predict a connection using two records before revealing the ring network. |
| 11 · Escalation | Arrests and Thalor’s warning scrolls raise the cost. | Let the player linger at a vision or move on immediately. |
| 12 · Discovery | The trio finds an escape as the warehouse is breached. | Can the player pin the junction, see the masonry move, and walk into the revealed passage? |
| 13 · The Chamber | The passage seals and the trio enters a much older place. | Make crossing the threshold one clear action, with space to look back at the companions. |
| 14 · Ancient Resonance | Mira and Kaelan discover a chamber memory and grow closer. | Reward a chamber alignment with the memory and a quiet character beat. |
| 15 · The Hunt | The search above closes in and unexpected help appears. | Make the sweep visible long enough to infer a route. Check that tension survives a deliberate pause. |
| 16 · Ascending Powers | The trio uses its combined knowledge to ascend. | Show continuity of water across landings. Let a wrong turn be readable and reversible. |
| 17 · The Price | Arrests make the personal cost visible. | Give players control over which visions to linger on and a clear way forward. |
| 18 · The High Temple | Evidence of instrument tampering appears at the summit. | Fit the tracing over both notches, then ask what the displaced pointer shows. |
| 19 · Ancient Guardians | The Order appears and changes the balance of power. | Give the entrance room to land. Approach or observe at the player’s pace. |
| 20 · Memories of Catastrophe | The Order reveals the technology’s original purpose. | Let players pause the water-memory at a detail and resume the account. |
| 21 · Hidden Paths | Kaelan sees his father safe and learns who helped. | Keep the rescue visible even for players who skip optional stations. |
| 22 · Truth and Power | Thalor must answer for who controlled access. | Let players challenge his account with a relevant vault record and explain the connection. |
| 23 · Awakening | Restoring distribution changes the city. | Show which rings gain light when the player changes a route. Pay off the early city-model discovery. |
| 24 · Seeds of Legacy | Initiation closes the season and opens a larger mission. | Let the player witness the harbor, accept initiation and recognize that Season One is complete. |

## Opening review loop

The shop-to-quay slice is the unit under review. Its promise is that a player can discover why a supposedly worthless stone matters to Father and leave the shop curious about the rest of the shipment.

1. Start with a fresh browser profile at the exact invitation URL. Include the host screen, loading, default motion, and audio unlock. On the first pass use only visible pixels, normal touch and the information available so far. Run the actual temple entry too before claiming readiness for the full game. A reviewer who knows the solution records that fact.
2. Save a frame at the first deliberate experiment, the first surprising result, an honest wrong inference, the visible consequence and the moment one could stop. At each, write what prompted the action, the prediction, what changed and the strongest reason to quit. Distinguish an observation from an inference. Technical regression tests may seed state or inspect labels. A sighted discoverability pass uses neither shortcut. Test assistive controls on a separate pass.
3. Reject a build internally if the first meaningful action is hidden behind errands, if the interface performs the inference, if button repetition can replace the experiment, if feedback tells the conclusion before the player can see the evidence, or if a solve advances a caption without a perceptible consequence. Ask whether the same story could be told just as well with a Continue button. A wrong hypothesis should give the player something to reconsider.
4. Change the smallest mechanic responsible for the earliest failure. Replay from the beginning and deliberately try a different first object, a plausible wrong answer and an interrupted solve. Check narrow landscape, portrait, sound off, keyboard input and saved state. A fix must improve the observed moment without moving the obstacle to the next beat. Keep the before and after, the build identifier, the device or emulator, and the remaining risk. Return a build to internal iteration while a rejection condition still holds.
5. Once the internal pass clears, offer the opening to five people unfamiliar with the project, individually on their own phones. Say only “Play for as long as you like. You can stop at any time.” Give no walkthrough, time quota, hints or prompt to follow the barge. Observe the first deliberate action, a change of mind, help needed, voluntary continuation and where they actually stop. After they stop, ask “What were you trying to find out?”, “What made you think that?” and “What would you want to see next?” Record help when it happens and exclude assisted steps from unaided results.
6. Our proposed pilot threshold is at least four of five who can describe Father's problem and point to their own evidence, and at least three of five who voluntarily enter the quay and investigate something there. Two people stuck or disengaging at the same beat sends that beat back through the loop. Count all starts, including early exits. Treat five people as a design signal. A change to the premise or central interaction warrants another fresh cohort.

For a repeatable internal capture, run `python tools/review-opening.py PLAY_URL /tmp/new-session` with Python Playwright and Chromium installed. Inspect each numbered frame before choosing the next touch. The local TSV records actions and elapsed session time, including reviewer deliberation. It measures neither human decision time nor enjoyment.

### What the reference games contribute

*The Room* makes handling an artifact the pleasure of investigating it. The shop adaptation puts the finger on the quartz itself and keeps the optical response visible during the turn. [Fireproof Games](https://www.fireproofgames.com/games/the-room)

*Return of the Obra Dinn* gives the investigator a concrete professional obligation and asks them to reconstruct an event from evidence. Here the player owns the claim about one shipment. Two samples reach the same final stud, so the route each took matters. [Lucas Pope](https://obradinn.com/)

*Outer Wilds* builds leads between discoveries. Mobius also tested whether players could understand those leads in a low-cost prototype. Here the cargo leaving the shop carries an echo of a phenomenon the player has just learned to recognize. Voluntary investigation at the quay is the test of that connection. [Mobius Digital](https://www.mobiusdigitalgames.com/news/demaking-outer-wilds)

### First application, November 26, 2026

The published Lot VII shop at `34427be` opened on a proxy warning in a clean browser. Tapping the visible lamp led to an empty rest and a destination button. The previous completion script activated hidden station controls, read the drawing's accessibility description and selected the crate with the matching label. It verified the implementation while bypassing visual discovery. The old trace control also supplied the reading, so a player could copy it into a decision.

In the revised shop, a screen-only touch pass reached the bench in one tap, turned two stones, distinguished the arcs, carried a ticket, tried the wrong crate, recovered by comparing the cuts and attached it to the matching crate. Father’s hold appeared on its wood. Turning towards the window and approaching it led to the barge. The first iteration walked directly up to crate 08 and suggested an answer through framing. The second stopped far enough back to see all three. Reviewing that view also exposed a marker covering the printed seal, and looking at the unfolded sketch exposed a low-contrast pencil line. Both were revised. No independent player data has been collected for this build. The open question is whether someone chooses to investigate the departing cargo once Father’s immediate problem is resolved.
