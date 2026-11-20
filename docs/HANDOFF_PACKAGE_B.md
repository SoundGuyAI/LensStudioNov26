# Handoff — Package B (Teleprompter + Zip Zap Zop content)

**Branch:** `feature/learn-mode-package-b`  
**Audience:** You (or a builder agent) continuing on another machine  
**Depends on:** Package A (Learn Mode shell) — already on this branch  
**Do not implement:** Packages C–F (wall video, 3D demo, hand-aim, Learn Mode VO)

---

## What landed on this branch

| File | Role |
|------|------|
| `Assets/Scripts/LearnGames/LearnGameContent.ts` | Content packs keyed by game id; filled `zip_zap_zop`; other agenda games stubbed |
| `Assets/Scripts/RehearsalBandTeleprompterUI.ts` | Stacked few-word host cues (content-driven via `setLines`) |
| `Assets/Scripts/RehearsalBandLearnModeController.ts` | On Learn Mode open, loads pack for current exercise and fills teleprompter |
| `Assets/Scene.scene` | Teleprompter panel height bumped to 22 cm for 7 lines |

**Canonical rules locked:** Zip → Zap → Zop → Zip energy-pass cycle with eye contact + gesture. **Do not** use the improwiki Zip Zap Zoop variant (different Zip/Zap/Zop meanings).

**Source of truth:** [`docs/LEARN_GAME_FEATURE.md`](./LEARN_GAME_FEATURE.md)

---

## What you should do next (pick one track)

### 1. Verify Package B (do this first)

1. Open this project in Lens Studio 5.22+ (signed in; MCP on if using an agent).
2. Interactive Preview → pinch palm **Instructions**.
3. Confirm default mode is **Teleprompter** and cues read at a glance:
   - Pass an energy ball
   - Say one word each pass
   - Zip / Zap / Zop
   - Repeat the cycle
   - Eye contact before you pass
4. Close Learn Mode; confirm workshop timer was **not** auto-started.
5. Optional: advance agenda past Zip Zap Zop → Instructions → teleprompter should show empty / “No cues…” stub.

If preview/MCP was mid-flight elsewhere, recompile TS then refresh preview before judging.

### 2. Continue product work (Packages C–F)

Paste the matching prompt from the bottom of `LEARN_GAME_FEATURE.md`:

| Next | Prompt |
|------|--------|
| Wall / motion explainer | **Prompt C** |
| Table 3D demo | **Prompt D** |
| Hand-aim Phase 2 | **Prompt E** |
| Learn Mode VO (Instinct) | **Prompt F** |

C and D can run in parallel after B is verified. Keep content pack edits coordinated with B’s schema in `LearnGameContent.ts`.

### 3. Fix / polish Package B only

Tell the agent something like:

> Stay on Package B. Re-read `docs/LEARN_GAME_FEATURE.md` and `docs/HANDOFF_PACKAGE_B.md`. Fix teleprompter readability / content wiring only. Do not start Packages C–F.

Useful polish if needed: head-relative placement, cue font size, cycling one-line-at-a-time, or mapping other exercise stubs.

---

## Agent paste prompt (verify + resume)

```
Read docs/HANDOFF_PACKAGE_B.md and docs/LEARN_GAME_FEATURE.md.

You are continuing Rehearsal Band Learn Mode after Package B landed on branch feature/learn-mode-package-b.

First: verify Teleprompter in Interactive Preview (Instructions → default Teleprompter shows zip_zap_zop lines from LearnGameContent). Cite any issues.

Then: wait for my next instruction — either polish Package B, or run Prompt C/D/E/F from LEARN_GAME_FEATURE.md. Do not invent Packages C–F unless I ask.
```

---

## References used (Package B research)

- https://allimprov.com/learn/games/zip-zap-zop/
- https://improvcollective.com/games/zip-zap-zop-classic
- https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop
- https://www.hooplaimpro.com/resource/zip-zap-zop
- https://www.oneruleimprov.com/2016/09/20/zip-zap-zop/
- https://theatreforlifelonglearning.org/improv-for-everyone-zip-zap-zop/
- https://ecrs.org/activities/zip-zap-zop
- https://improwiki.com/en/wiki/zip-zap-zoop *(variant warning only — not used for v1 rules)*

---

## Out of scope reminders

- Do not change workshop plan timings in `RehearsalBandState.ts`
- Do not generate Learn Mode VO WAVs here (Instinct / Prompt F)
- Do not replace `docs/VOICE_TUTORIAL_HANDOFF.md` onboarding VO
