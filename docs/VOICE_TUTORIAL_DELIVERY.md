# Delivery: Rehearsal Band Tutorial Voiceover

Follows `docs/VOICE_TUTORIAL_HANDOFF.md`. Assets only; no Lens scripts touched,
nothing in `Assets/GeneratedSFX/` changed.

## Tool and voice

- Generator: Instinct's built-in Gemini TTS (the same engine and voice catalog
  used for the Wall Tones narration and Cypher voices).
- Voice: **Sulafat** (Gemini prebuilt), enthusiastic host style, approved by
  Oded on a Welcome-line sample ("perfect").
- Style instruction used for every clip: "An upbeat, delighted game narrator
  welcoming a new player: bright vocal smile, lively varied pitch, quick
  energetic pace, lots of warmth and excitement, neutral American English."
- Same voice and style across all 17 clips, one generation per cue.
- Standing preference honored: no Microsoft/edge-tts or other low-quality
  voices; only high-quality voices (Gemini or similar) for this project.

## Files written (all under `Assets/TutorialVO/`)

| File | Duration | Peak |
|------|----------|------|
| Tutorial_01_Welcome.wav | 9.3 s | -1.0 dBFS |
| Tutorial_02_Wristband.wav | 12.8 s | -1.0 dBFS |
| Tutorial_03_PalmMenu.wav | 8.7 s | -1.0 dBFS |
| Tutorial_04_SuggestionCard.wav | 7.7 s | -1.0 dBFS |
| Tutorial_05_ChangeSuggestion.wav | 7.1 s | -1.0 dBFS |
| Tutorial_06_PalmSuggestion.wav | 6.4 s | -1.0 dBFS |
| Tutorial_07_Timer.wav | 8.3 s | -1.0 dBFS |
| Tutorial_08_Agenda.wav | 7.7 s | -1.0 dBFS |
| Tutorial_09_Next.wav | 8.6 s | -1.0 dBFS |
| Tutorial_10_PlaceTable.wav | 9.7 s | -1.0 dBFS |
| Tutorial_11_PlaceWall.wav | 7.5 s | -1.0 dBTP (resample-safe chain) |
| Tutorial_12_Close.wav | 8.9 s | -1.0 dBFS |
| Hint_LookAtWrist.wav | 3.4 s | -1.0 dBFS |
| Hint_StartTimer.wav | 3.7 s | -1.0 dBFS |
| Hint_NextExercise.wav | 4.0 s | -1.0 dBFS |
| Hint_NewSuggestion.wav | 3.2 s | -1.0 dBFS |
| Hint_PlaceSurfaces.wav | 5.0 s | -1.0 dBFS |

## Format (verified per file with ffprobe)

- Container WAV, 44100 Hz, mono, 16-bit PCM.
- Peak-normalized to -1.0 dBFS (about 1 dB headroom; no clipping).
- ~200 ms lead-in and ~250 ms lead-out silence on every file.

## Script verification

Every file was ASR-transcribed after generation and matched the handoff cue
table (no renamed buttons, no invented features, no script deviations).

## Acceptance checklist

- [x] `Assets/TutorialVO/` exists
- [x] All 12 `Tutorial_XX_*.wav` files present with exact names
- [x] Each file is 44.1 kHz WAV, speech-intelligible, no clipping
- [x] Scripts match the handoff table
- [x] Optional hint pack generated (all 5)
- [x] This delivery report written

## Known quality notes

- The approved enthusiastic style runs briskly, so several cues land under the
  handoff's approximate duration bands; all are well under the 20 s ceiling.
- A first pass of this batch used a Microsoft edge-tts voice and was rejected
  by the owner; it has been fully replaced by the Gemini Sulafat batch above.
