# Handoff: Rehearsal Band Tutorial Voiceover

**Audience:** Voice / audio generation agent  
**Goal:** Produce spoken tutorial WAV files for first-time hosts of the **Rehearsal Band** Specs Lens.  
**Out of scope for this handoff:** Wiring playback into scene scripts (integration is a separate task). Deliver assets + a short delivery checklist only.

---

## Product context (read once)

**Rehearsal Band** is a Specs (Spectacles) AR host tool for improv workshops. It shows:

| Surface | What the user sees | Interaction |
|---------|-------------------|-------------|
| **Wristband** (follows tracked hand) | Block + exercise name + timer `M:SS` + **Next** button | Pinch/release UIKit buttons |
| **Palm menu** (14 cm above wristband) | **Suggestion**, **Start Timer**, **Reset Timer**, **Place Table**, **Place Wall** | Pinch/release |
| **Suggestion card** (table-height floating card) | Kind (`Location` / `Relationship` / `Word`) + prompt body + hint *“Pinch card to change”* + **New Suggestion** | Pinch/release |
| **Workshop Agenda** (wall panel) | Full exercise list; current row marked with **▶** | Read-only |

**Agenda (fixed order):**

1. Warm-up — Zip Zap Zop (3:00)
2. Warm-up — Yes And Circle (4:00)
3. Scene Work — Location Freeze (5:00)
4. Scene Work — Relationship Swap (5:00)
5. Showcase — Open Scenes (8:00)

**Important runtime facts for accurate VO:**

- Timer does **not** run until the host pinches **Start Timer**.
- Timer reaching zero does **not** auto-advance the agenda; host must pinch **Next**.
- Suggestion card is **already visible** at lens start (first pool entry).
- Interactions are **pinch then release** (UIKit `onTriggerUp`), not “tap and hold.”
- Placement: **Place Table** / **Place Wall** → aim at surface → **release pinch** to confirm.
- Existing SFX only (do not replace): `ButtonClick.wav`, `AdvanceChime.wav`, `SuggestionSwap.wav` under `Assets/GeneratedSFX/`. Tutorial VO is **new** content.

---

## Delivery requirements

### Output folder

```text
Assets/TutorialVO/
```

Create the folder if missing. Do **not** put VO in `GeneratedSFX/` (that folder is for short UI SFX).

### File format (mandatory)

| Spec | Value |
|------|--------|
| Container | `.wav` |
| Sample rate | **44100 Hz** |
| Channels | **Mono** preferred (stereo OK if tool defaults to stereo) |
| Bit depth | 16-bit PCM |
| Loudness | Peak-normalize gently; leave ~−1 dB headroom; keep speech clear at Specs speaker distance |
| Silence | ~150–300 ms lead-in and lead-out; no abrupt cuts mid-word |
| Naming | Exact filenames in the cue table below (PascalCase + `.wav`) |

### Playback intent (for whoever integrates later)

- Tutorial VO → `Audio.PlaybackMode.LowPower` (narration can tolerate a little latency).
- Existing UI SFX stay `LowLatency`.
- Expected `requireAsset` path style from scripts: `"../TutorialVO/<FileName>.wav"`.

### Voice direction

- **Tone:** Warm workshop host — clear, calm, encouraging. Not robotic, not cartoonish.
- **Pace:** Conversational; slightly slower than podcast pace so hosts can look at UI while listening.
- **Accent / language:** Neutral American English unless the project owner overrides.
- **Consistency:** Same voice, same energy, across all cues.
- **Prosody:** Emphasize on-screen button labels when they appear (e.g. “Start Timer”, “Next”, “Place Table”).
- **Length:** Keep each cue under ~20 seconds when possible; welcome/close may be slightly longer.
- **Do not** invent UI labels that are not in the script. Labels below match the live Lens.

### Generation approach

Use whatever TTS / voice pipeline you have available (cloud TTS, local TTS, recorded VA, etc.).  
**Do not** use the project’s `/build-sfx` skill — that synthesizes UI/foley, not speech.

After writing each file, verify:

1. Path is under `Assets/TutorialVO/`.
2. File is valid WAV (readable header / non-zero size).
3. Spoken text matches the script (spot-check by listening or ASR).

---

## Cue list (ordered tutorial)

Generate **all 12 files**. Scripts are final unless the owner asks for a rewrite.

| # | Filename | Approx length | Exact spoken script |
|---|----------|---------------|---------------------|
| 01 | `Tutorial_01_Welcome.wav` | 8–12 s | Welcome to Rehearsal Band—your AR host for improv workshops. You’ll see a suggestion card, a wall agenda, and controls on your wrist. |
| 02 | `Tutorial_02_Wristband.wav` | 12–16 s | Raise your hand. On your wrist you’ll see the current exercise, a timer, and Next. We’re starting with Warm-up — Zip Zap Zop. The timer shows three minutes, but it won’t run until you start it. |
| 03 | `Tutorial_03_PalmMenu.wav` | 10–14 s | Above your wristband is the palm menu: Suggestion, Start Timer, Reset Timer, Place Table, and Place Wall. |
| 04 | `Tutorial_04_SuggestionCard.wav` | 8–12 s | In front of you is the suggestion card. Use it to spark scenes—it shows a Location, Relationship, or Word prompt. |
| 05 | `Tutorial_05_ChangeSuggestion.wav` | 8–12 s | To swap prompts, pinch New Suggestion on the card—or follow the on-screen hint: pinch the card to change. |
| 06 | `Tutorial_06_PalmSuggestion.wav` | 6–10 s | You can also pinch Suggestion on your palm to cycle prompts without reaching the table. |
| 07 | `Tutorial_07_Timer.wav` | 10–14 s | When you’re ready to time the exercise, pinch Start Timer. Reset Timer puts the countdown back to the full length for this game. |
| 08 | `Tutorial_08_Agenda.wav` | 10–14 s | Turn toward the Workshop Agenda on the wall. The arrow marks what you’re on now. The list updates when you hit Next on your wrist. |
| 09 | `Tutorial_09_Next.wav` | 8–12 s | Finished the game? Pinch Next on your wrist. The agenda advances, the timer loads the next exercise, and you’ll hear a short chime. |
| 10 | `Tutorial_10_PlaceTable.wav` | 10–14 s | To pin the suggestion card on a real table, open the palm menu and choose Place Table. Aim at the surface, then release your pinch to place. |
| 11 | `Tutorial_11_PlaceWall.wav` | 10–14 s | Same for the agenda: pinch Place Wall, aim at a wall, then release to set Workshop Agenda where your group can see it. |
| 12 | `Tutorial_12_Close.wav` | 8–12 s | You’re set—run the warm-ups, use suggestions for scene work, and advance with Next when each exercise ends. Break a leg. |

### Optional shorter “hint” pack (generate only if easy / requested)

Same voice, punchier lines for contextual tips (not the main linear tutorial):

| Filename | Exact spoken script |
|----------|---------------------|
| `Hint_LookAtWrist.wav` | Glance at your wrist for the exercise and timer. |
| `Hint_StartTimer.wav` | Pinch Start Timer when the exercise begins. |
| `Hint_NextExercise.wav` | Pinch Next when you’re ready for the next exercise. |
| `Hint_NewSuggestion.wav` | Pinch New Suggestion for a fresh prompt. |
| `Hint_PlaceSurfaces.wav` | Use Place Table or Place Wall to re-anchor the UI in your room. |

---

## Reference paths (do not modify unless integrating)

```text
Project root:
  c:\UnityProj\Specs\SpecsLensNov26\SpecsLensNov2026

Existing SFX (leave alone):
  Assets/GeneratedSFX/ButtonClick.wav
  Assets/GeneratedSFX/AdvanceChime.wav
  Assets/GeneratedSFX/SuggestionSwap.wav

Audio playback pattern today:
  Assets/Scripts/RehearsalBandAudioController.ts
  Assets/Scripts/RehearsalBandAssetManifest.ts

UX source of truth:
  Assets/Scripts/RehearsalBandMain.ts
  Assets/Scripts/RehearsalBandWristbandUI.ts
  Assets/Scripts/RehearsalBandPalmMenuUI.ts
  Assets/Scripts/RehearsalBandSuggestionUI.ts
  Assets/Scripts/RehearsalBandAgendaUI.ts
  Assets/Scripts/RehearsalBandSurfacePlacer.ts
  Assets/Scripts/RehearsalBandState.ts
```

---

## Acceptance checklist

- [ ] `Assets/TutorialVO/` exists
- [ ] All 12 `Tutorial_XX_*.wav` files present with exact names
- [ ] Each file is 44.1 kHz WAV, speech-intelligible, no clipping
- [ ] Scripts match the table (no renamed buttons, no invented features)
- [ ] Optional hints generated **or** explicitly skipped with a note in the delivery report
- [ ] Short delivery report written at `docs/VOICE_TUTORIAL_DELIVERY.md` listing:
  - tool/voice used
  - files written (absolute or project-relative paths)
  - any script deviations (should be none)
  - known quality issues

---

## Integration note (not this agent’s job)

A later coding pass should:

1. Add path constants in `RehearsalBandAssetManifest.ts` (e.g. `VO_TUTORIAL_01 = "../TutorialVO/Tutorial_01_Welcome.wav"`).
2. Extend audio (new controller or methods) to play VO with `LowPower`.
3. Drive cue order from a small tutorial state machine (first-run or manual “Replay tutorial”), without blocking host controls forever.

Until that lands, these WAVs are assets-only.

---

## Prompt stub for the voice agent

Copy-paste start:

> Read `docs/VOICE_TUTORIAL_HANDOFF.md`. Generate every required tutorial WAV into `Assets/TutorialVO/` using the exact filenames and scripts. Match Specs delivery specs (44.1 kHz WAV). Do not edit Lens scripts or replace `GeneratedSFX`. When done, write `docs/VOICE_TUTORIAL_DELIVERY.md` with the acceptance checklist results.
