# Feature: Learn an Improv Game (Learn Mode)

**Audience:** Builder agents (UI, content, media, 3D, interaction) and Instinct (VO only)  
**Goal:** Let the host open **Instructions** from the palm / wristband menu and teach the current agenda game via three teach surfaces: wall motion explainer, table 3D demo, and a short teleprompter.  
**This doc is the source of truth.** Copy a handoff prompt from the bottom into a new agent chat. Do not invent a parallel brief.

**Out of scope for Lens builder agents:** Learn Mode voiceover WAV generation (Instinct — Prompt F). Do not replace [`docs/VOICE_TUTORIAL_HANDOFF.md`](./VOICE_TUTORIAL_HANDOFF.md).

---

## Product context (read once)

**Rehearsal Band** is a Specs (Spectacles) AR host tool for improv workshops.

| Surface | What the user sees | Interaction |
|---------|-------------------|-------------|
| **Wristband** (follows tracked hand) | Block + exercise name + timer `M:SS` + **Next** | Pinch/release UIKit buttons |
| **Palm menu** (above wristband) | **Suggestion**, **Start Timer**, **Reset Timer**, **Place Table**, **Place Wall** — plus new **Instructions** | Pinch/release |
| **Suggestion card** (table height) | Location / Relationship / Word prompt | Pinch to change |
| **Workshop Agenda** (wall) | Full exercise list; current row marked **▶** | Read-only |

**Agenda (fixed order today):**

1. Warm-up — Zip Zap Zop (3:00) ← **v1 Learn Mode content pack**
2. Warm-up — Yes And Circle (4:00) — stub later
3. Scene Work — Location Freeze (5:00) — stub later
4. Scene Work — Relationship Swap (5:00) — stub later
5. Showcase — Open Scenes (8:00) — stub later

**Key scripts today:**

- [`Assets/Scripts/RehearsalBandPalmMenuUI.ts`](../Assets/Scripts/RehearsalBandPalmMenuUI.ts) — palm buttons
- [`Assets/Scripts/RehearsalBandMain.ts`](../Assets/Scripts/RehearsalBandMain.ts) — orchestrator
- [`Assets/Scripts/RehearsalBandState.ts`](../Assets/Scripts/RehearsalBandState.ts) — workshop plan / timer / suggestions

Learn Mode is a **host teaching aid** for the *current* exercise. It does **not** replace the agenda, timer, or suggestion card. Opening Learn Mode must **not** auto-start the timer.

---

## Mandatory: look online before authoring game content

Before writing rules, teleprompter lines, video storyboards, or 3D demo choreography for **any** learnable game:

1. **Search the web** for that game’s teaching references (improv / drama pedagogy / workshop sites).
2. Prefer **multiple sources**. When rule variants disagree, note them and **lock one canonical Rehearsal Band version** in the content pack.
3. Cite URLs in a short **References used** note in your delivery report.
4. Do **not** invent rules from memory alone when online refs exist.

### Canonical Zip Zap Zop (Rehearsal Band v1)

Players stand in a circle and pass an **energy** impulse with clear **eye contact** + gesture (point / clap). Word order always cycles:

**Zip → Zap → Zop → Zip**

Goals: focus, receiving before sending, shared rhythm. On a mistake, celebrate briefly and **restart from Zip**. Speed comes after clarity. Energy should never “hit the floor.”

Do **not** mix in the alternate “Zip Zap Zoop” mechanic set (different Zip/Zap/Zop meanings) unless product later adopts that variant explicitly.

### Seed references (re-open + search beyond these)

- [AllImprov — Zip Zap Zop](https://allimprov.com/learn/games/zip-zap-zop/)
- [The Improv Collective — Zip Zap Zop Classic](https://improvcollective.com/games/zip-zap-zop-classic)
- [UT Austin Drama-Based Pedagogy — Zip Zap Zop](https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop)
- [Hoopla Impro — Zip Zap Zop](https://www.hooplaimpro.com/resource/zip-zap-zop)
- [One Rule Improv — ZIP-ZAP-ZOP](https://www.oneruleimprov.com/2016/09/20/zip-zap-zop/)
- [Theatre for Lifelong Learning — Zip Zap Zop](https://theatreforlifelonglearning.org/improv-for-everyone-zip-zap-zop/)
- **Variant warning (do not use for v1 rules):** [improwiki — Zip Zap Zoop](https://improwiki.com/en/wiki/zip-zap-zoop)

---

## Entry UX

1. Palm menu adds **Instructions** (icon + label).
2. Pinch opens Learn Mode for `state.getCurrentExercise().name` (v1 content = Zip Zap Zop).
3. Mode picker: **Video** | **3D Demo** | **Teleprompter**.
4. Default open: **Teleprompter** (glanceable host teach cues).
5. Host may switch modes; combining (e.g. teleprompter + 3D) is allowed if cheap — otherwise one active teach surface at a time is fine for v1.
6. **Close** returns to normal host UI. Timer unchanged unless the host uses existing timer controls.

---

## Mode A — Motion video explainer (wall / front plane)

- Short looping motion-graphics / infographic explainer (or sequenced billboard frames if full video pipeline is deferred).
- Anchored on the agenda wall plane or a dedicated teaching plane ~1–2 m ahead.
- Zip Zap Zop beats: circle → clear pass → Zip / Zap / Zop labels → cycle repeat; optional “eye contact” callout.
- Assets: `Assets/LearnGames/ZipZapZop/Video/` (clip or frame sequence).

## Mode B — 3D table demonstration

- Three stylized **mock** actors on the table / suggestion surface (clear or dim suggestion card while demo is active).
- Animated energy ball passes between them; **3D arrows** show pass direction.
- Word label above the active speaker (Zip / Zap / Zop).
- Assets: `Assets/LearnGames/ZipZapZop/Demo3D/` (actors, ball, arrows).
- Mock people are props — **no real person recognition**.

## Mode C — Teleprompter (host teach script)

Few-word lines only (not paragraphs). v1 Zip Zap Zop copy:

1. Pass an energy ball
2. Say one word each pass
3. Zip
4. Zap
5. Zop
6. Repeat the cycle
7. Eye contact before you pass

Placement: head-relative or near-hand glanceable strip so the host can coach while looking at the room. Copy is data-driven by game id.

---

## Phase 2 — Hand-aim practice (same feature, later package)

- Host aims / “throws” Zip→Zap→Zop toward two **mock** people in the room.
- Spatial arrows update toward the aimed target.
- Preview stand-in: SIK hand + mock targets. **Feel unproven** on device.
- Explicitly **not** real participant tracking.

---

## Content pack schema (shared contract)

```ts
type LearnGameId =
  | "zip_zap_zop"
  | "yes_and_circle"
  | "location_freeze"
  | "relationship_swap"
  | "open_scenes"

interface LearnGamePack {
  id: LearnGameId
  displayName: string // must match agenda exercise name when possible
  teleprompterLines: string[] // short lines
  videoAssetPath?: string // under Assets/LearnGames/...
  demo3dRootPath?: string
  voCueIds?: string[] // reserved for Instinct; empty until Prompt F
  canonicalRulesSummary: string // 2–4 sentences locked after online research
  referencesUsed: string[] // URLs
}
```

**v1:** fill `zip_zap_zop` only. Other agenda games may exist as stubs with empty teleprompter arrays.

Suggested module: `Assets/Scripts/LearnGames/LearnGameContent.ts` (or equivalent) consumed by Learn Mode UI.

---

## Suggested new modules (builders may refine names)

| Module | Owns |
|--------|------|
| `RehearsalBandLearnModeController.ts` | Open/close, active mode, wiring to Main |
| `RehearsalBandLearnModePickerUI.ts` | Video / 3D / Teleprompter / Close |
| `RehearsalBandTeleprompterUI.ts` | Short-line host strip |
| `RehearsalBandLearnVideoPlayer.ts` | Wall/plane media |
| `RehearsalBandLearnDemo3D.ts` | Table actors / ball / arrows |
| `RehearsalBandLearnHandAim.ts` | Phase 2 only |

Wire **Instructions** from `RehearsalBandPalmMenuUI` → event → Main → Learn Mode controller.

---

## Work packages (order)

| ID | Package | Depends on |
|----|---------|------------|
| A | Learn Mode shell + Instructions button | — |
| B | Teleprompter + Zip Zap Zop copy | A |
| C | Wall video / motion explainer | A |
| D | Table 3D demo | A |
| E | Phase 2 hand-aim | A (+ ideally D) |
| F | Learn Mode VO (Instinct) | Content locked in B |

---

## Explicit out of scope

- Learn Mode / tutorial voice WAV generation and delivery (Instinct — Prompt F)
- Real person, face, or room participant recognition
- Live Firebase / Improv Dashboard sync of instructions
- Replacing product onboarding VO in `VOICE_TUTORIAL_HANDOFF.md`
- Connected Lenses / shared multiplayer learn sessions

---

## Handoff prompts (paste into a new agent)

Use **Prompt A first**. Then B (teleprompter), then C/D in parallel if desired, then E, then F for Instinct.

### Prompt A — Learn Mode shell + Instructions button

```
Read docs/LEARN_GAME_FEATURE.md end-to-end (especially Entry UX, Content pack schema, Suggested new modules, Out of scope).

You are Package A only: Learn Mode shell + palm Instructions button.

Goal:
1. Add an Instructions button to the palm menu (Assets/Scripts/RehearsalBandPalmMenuUI.ts) that emits an event (e.g. onOpenInstructions).
2. Wire RehearsalBandMain.ts so that event opens a Learn Mode shell for the current exercise (state.getCurrentExercise()).
3. Implement a minimal Learn Mode UI: mode picker Video | 3D Demo | Teleprompter, plus Close. Default mode = Teleprompter. Closing restores normal host UI and must NOT start/stop the workshop timer.
4. Stub the three mode panels (empty placeholders OK) so Packages B/C/D can fill them. Prefer new scripts under Assets/Scripts/ as listed in LEARN_GAME_FEATURE.md.

Out of scope for you: teleprompter copy, video assets, 3D actors, hand-aim, any voice/WAV work, other agenda games’ content.

Acceptance:
- Pinch Instructions opens Learn Mode; Close exits.
- Mode picker switches which stub panel is active.
- Existing Suggestion / Timer / Place Table / Place Wall / Next still work.
- Short delivery note listing files touched.

Do not implement Packages B–F.
```

### Prompt B — Teleprompter + Zip Zap Zop copy

```
Read docs/LEARN_GAME_FEATURE.md. Search online for Zip Zap Zop teaching references (use the seed links in that doc AND a fresh web search). Lock the canonical Rehearsal Band rules (Zip→Zap→Zop energy-pass cycle; do NOT use the improwiki Zip Zap Zoop variant). Cite URLs you used.

You are Package B only: Teleprompter UI + Zip Zap Zop content.

Depends on Package A (Learn Mode shell). If A is missing, stop and say so.

Goal:
1. Implement RehearsalBandTeleprompterUI (or equivalent) showing brief few-word lines for the host.
2. Add LearnGameContent (or equivalent) with a filled zip_zap_zop pack: teleprompterLines, canonicalRulesSummary, referencesUsed. Stub other agenda game ids if needed.
3. When Learn Mode opens on Zip Zap Zop and Teleprompter is selected (default), show the lines from the content pack.
4. Keep lines short — host coaching cues, not paragraphs.

Out of scope: wall video, 3D demo, hand-aim, VO/WAV, changing workshop plan timings.

Acceptance:
- Teleprompter readable at a glance in Interactive Preview.
- Content driven by game id, not hard-coded only in the UI component.
- Delivery note includes References used (URLs).

Do not implement Packages C–F.
```

### Prompt C — Wall video / motion explainer

```
Read docs/LEARN_GAME_FEATURE.md. Search online for Zip Zap Zop teaching references (seed links + fresh search). Align storyboard beats with the canonical Zip→Zap→Zop energy-pass cycle (not the Zip Zap Zoop variant). Cite URLs.

You are Package C only: wall / front-plane motion video (or frame-sequence) explainer.

Depends on Package A. If A is missing, stop and say so.

Goal:
1. Create assets under Assets/LearnGames/ZipZapZop/Video/ (short loop or sequenced frames with infographic labels Zip / Zap / Zop).
2. Implement a wall/plane player script that shows when Learn Mode Video is selected.
3. Anchor ~1–2 m ahead or on the agenda wall plane; keep additive Specs readability (no relying on black UI).

Out of scope: teleprompter copy authorship (B), 3D table demo (D), hand-aim (E), VO (F).

Acceptance:
- Selecting Video shows the explainer; Close / other modes hide it.
- Storyboard matches canonical rules.
- Delivery note lists assets + References used.

Do not implement Packages B/D/E/F unless required for a thin shared content path — prefer leaving content pack edits to B when possible.
```

### Prompt D — Table 3D demo (actors, ball, arrows)

```
Read docs/LEARN_GAME_FEATURE.md. Search online for Zip Zap Zop teaching references (seed links + fresh search). Choreograph the classic Zip→Zap→Zop cycle only (not Zip Zap Zoop variant). Cite URLs.

You are Package D only: table-top 3D demonstration.

Depends on Package A. If A is missing, stop and say so.

Goal:
1. Place three stylized mock actors on the table / suggestion surface when 3D Demo is selected (dim or hide suggestion card while active if needed).
2. Animate an energy ball passing between them; show 3D arrows for pass direction; label Zip / Zap / Zop on the active speaker.
3. Assets under Assets/LearnGames/ZipZapZop/Demo3D/.
4. Mock people are props only — no real person recognition.

Out of scope: wall video, teleprompter authorship, hand-aim Phase 2, VO.

Acceptance:
- 3D Demo mode shows looping pass cycle in preview.
- Arrows clearly show energy direction.
- Delivery note + References used.

Do not implement Packages B/C/E/F.
```

### Prompt E — Phase 2 hand-aim at mock people

```
Read docs/LEARN_GAME_FEATURE.md (Phase 2 section). Search online briefly to confirm Zip Zap Zop pass intent (eye contact + clear aim). Cite URLs if you used them for UX copy.

You are Package E only: hand-tracked aim practice toward mock people.

Depends on Package A (and ideally D). If A is missing, stop and say so.

Goal:
1. Spawn two mock people / targets in the room (props).
2. Use SIK hand tracking so the host can aim / “throw” the next Zip/Zap/Zop toward a target.
3. Update spatial arrows toward the aimed target.
4. Mark feel-unproven; preview must work with Interactive Preview hand + pinch where possible.

Out of scope: real participant tracking, VO, rewriting teleprompter/video/3D packages.

Acceptance:
- Host can complete at least one Zip→Zap→Zop aim cycle at mock targets in preview.
- Delivery note calls out what is logic proven vs feel unproven.

Do not implement Packages B/C/D/F.
```

### Prompt F — Learn Mode VO (Instinct only)

```
Read docs/LEARN_GAME_FEATURE.md and mirror the delivery style of docs/VOICE_TUTORIAL_HANDOFF.md.

You are Package F only (Instinct / voice): Learn Mode voiceover for teaching Zip Zap Zop to a host, aligned with the canonical Zip→Zap→Zop energy-pass rules in LEARN_GAME_FEATURE.md. Search online if needed to keep coaching accurate; cite URLs.

Goal:
1. Propose a short cue list (filenames + scripts + target durations) for Learn Mode VO under Assets/LearnGames/ZipZapZop/VO/ (or Assets/TutorialVO/Learn_ZipZapZop_* if that fits existing layout better — document the choice).
2. Generate Specs-friendly WAV assets (44.1 kHz) for those cues.
3. Write a short delivery checklist doc (e.g. docs/LEARN_GAME_VO_DELIVERY.md).

Out of scope: editing Lens scripts, replacing GeneratedSFX, replacing the product onboarding tutorial VO set in VOICE_TUTORIAL_HANDOFF.md.

Do not implement Packages A–E.
```
