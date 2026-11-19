---
status: approved
---

# Design brief: Rehearsal Band

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
You're hosting an improv workshop or rehearsal. You glance your hand for the current exercise name and timer, turn to a table for a suggestion when you ask for one, and face the wall for the full agenda with a marker of where you are — without looking down at a laptop.

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free
- Why it's better than the phone or laptop version: you keep eyes on the group and hands available while the plan, timer, and suggestions live in the room (wrist, table, wall) instead of on a screen you have to look away to use

## Product or overlay
- Type: product — a host tool for running a structured improv session
- What the real version would sense: optional voice to advance ("next"); hand look / wrist glance for the band and palm menu
- Stand-in for the preview: hard-coded sample workshop plan and suggestion lists (no live Improv Dashboard / Firebase). Voice advance is optional; a big pinch **Next** always does the same job. Looking at the hand / table / wall is done by turning the preview camera toward those world or body anchors (no live person recognition)

## Where things live
- Where the user is looking during the main task: at the group / open floor in front of them; glancing down at the hand for status; turning to the table or wall when needed
- Wristband (current exercise name + timer): simulated band on the wrist, glanceable, roughly arm’s length when looking down at the hand; text large enough to read at a quick glance (default ~4–6 cm tall labels)
- Palm menu: opens on / above the hand when looking at the hand — controls beyond Next (e.g. request suggestion, timer actions) as a few big targets (default)
- Suggestion card: anchored on a table at the front of the space / toward the “audience” side of the room, on the table surface ~70–100 cm high, within ~1–1.5 m of where the host stands (default); big enough to read from host position (~20–30 cm wide card) (default)
- Wall agenda: full session agenda on a virtual wall panel ~1–2 m in front/side of the host space, a little below eye level at standing height, with a clear marker on the current exercise (default panel ~60–80 cm wide)

## Hands and input
- Advance exercise: pinch a big **Next** on the wristband (or palm menu); ideally also voice “next” when available
- Request / change suggestion: pinch on the table suggestion card or a **Suggestion** control in the palm menu (default: both available)
- Timer / other host controls: palm menu buttons (start/reset or similar) (default)
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: saying the advance out loud is the ideal; pinch **Next** always advances in the preview

## When things show
- Wristband and palm menu: when looking at the hand; otherwise not competing with the view of the group
- Suggestion on the table: present when the host has asked for / opened a suggestion; changeable by pinch; not always demanding attention
- Wall agenda: visible when looking at the wall; current-exercise marker updates when the session advances
- If something needs attention out of view: none required for this version (host chooses when to glance)

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Look at the hand and see the current exercise name and timer on the wristband.
2. Pinch **Next** and both the wristband name and the wall agenda marker move to the next exercise.
3. At the table, pinch to get a new / changed suggestion.
4. Face the wall and see the full agenda with the current exercise marked.

## Out of scope
- Multiplayer / Connected Lenses (names or character labels above participants’ heads; shared class guessing games)
- Porting the full Improv Dashboard web UI or live Firebase sync
- Recognizing real people, faces, or the real rehearsal room
- Voice-only control with no pinch fallback
- Custom two-hand or pose gestures that can’t be demoed with mouse pinch in preview

## Risks and open questions
- Wristband comfort and “look at hand” feel are **feel unproven** on real SPECS; preview proves logic and placement with mouse look + pinch
- Exact exercise list and suggestion categories pulled as a hard-coded sample from Improv Dashboard content (default) — learner can swap copy later
- Voice advance may not work in preview; demo relies on pinch **Next**

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.
- Content (default): ship a short hard-coded workshop plan (at least 4–5 named exercises across a few blocks) and a small pool of improv suggestions (e.g. location / relationship / word) so Next and suggestion-change are demonstrable without network.
- Scene (default): include a simple virtual table and wall in the preview room so agenda and suggestion anchors are obvious; wristband follows the preview hand / SIK hand.
- Do not attempt Connected Lenses or nameplates over people in this build.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
