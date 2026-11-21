### Inspiration

Improv hosts already juggle a plan, a timer, and “give me a suggestion” energy while staying present with the group. The usual tools — laptop, phone notes, printed agenda — pull eyes down and break the room’s focus.

Glasses are a better fit: the host keeps looking at people, and the workshop tools sit in the world where they belong — a glanceable band on the wrist, a prompt on the table, a full agenda on the wall.

### What it does

Rehearsal Band is a hands-free workshop host for SPECS:

- Wristband — current block + exercise name, countdown timer (M:SS), and a big Next control
- Palm menu — Suggestion, Start Timer, Reset Timer, Place Table, Place Wall
- Suggestion card — Location / Relationship / Word prompts on a table-height card; pinch to change
- Workshop Agenda — full session list on a wall panel, with ▶ marking the current exercise

Sample workshop plan (hard-coded for the preview):
1. Warm-up — Zip Zap Zop (3:00)
2. Warm-up — Yes And Circle (4:00)
3. Scene Work — Location Freeze (5:00)
4. Scene Work — Relationship Swap (5:00)
5. Showcase — Open Scenes (8:00)

The timer does not auto-advance the agenda. The host starts it when ready and pinches Next when the exercise is done. Place Table / Place Wall let the host re-anchor the UI on real surfaces in the room.

### How we built it

1. Plan — Ran the Devpost Learn plan-lens skill. It interviewed the idea, checked it against AR design rules (shared view, content in the world, hands free), and wrote the approved design brief in /devpost.
2. Build — An AI coding agent built the Lens in Lens Studio through CLAD and the Lens Studio MCP from that brief.
3. Interaction — Spectacles Interaction Kit (SIK) + UI Kit so pinches work in Interactive Preview (and on device later).
4. State — Modular TypeScript: session state, wristband / palm / suggestion / agenda UIs, surface placement, and audio feedback.
5. Verify — LEAF scenarios cover the design-brief done criteria (wristband visible, Next advances agenda, suggestion change, agenda visible).

### Challenges we ran into

- Designing for “look at the hand / table / wall” without real glasses — solved by anchoring UI in world space and proving the flow in Interactive Preview with mouse look + pinch.
- Keeping additive AR UI readable (dark content disappears on SPECS) — light text, large targets, glanceable labels.
- Separating host attention: wristband and palm stay with the hand; agenda and suggestions only compete when the host turns toward them.
- Surface placement UX: aim, then release pinch to confirm Place Table / Place Wall.

### Accomplishments that we're proud of

- A complete host product loop in preview — not just a floating panel: wrist → table → wall.
- Design brief done criteria mapped to LEAF tests.
- Content that stays out of the way until the host looks for it.
- A spatial story that wouldn’t be “just as good on a phone.”

### What we learned

- Good glasses design starts with one spatial moment, not a feature list.
- The skill pack’s questions (“Does it use what I’m looking at? Does it put something where it belongs? Does it free my hands?”) are a better filter than “can we render UI in AR?”
- Preview + LEAF can prove logic and placement; comfort on real SPECS is still “feel unproven” until worn.
- Agents are fast at building when the brief is specific about anchors, sizes (cm), and done criteria.

### What's next for Rehearsal Band

- Optional voice “next” with pinch always as fallback
- Swap the hard-coded plan/suggestions for a live workshop dashboard
- On-device pass for wristband comfort and real hand tracking feel
- Tutorial voiceover cues for first-time hosts
- (Future) shared session features — out of scope for this round
