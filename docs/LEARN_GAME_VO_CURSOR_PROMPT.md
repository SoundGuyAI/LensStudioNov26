# Cursor prompt: wire Learn Mode Zip Zap Zop VO

Paste the block below into a new Cursor chat. Prerequisite: the 11 WAVs from `ZipZapZop_VO.zip` are committed under `Assets/LearnGames/ZipZapZop/VO/`.

```
Read docs/LEARN_GAME_FEATURE.md and docs/LEARN_GAME_VO_DELIVERY.md.

You are wiring the Learn Mode Zip Zap Zop voiceover only. Packages A and B (shell and teleprompter) must exist. If not, stop and say so. Use the Lens Studio MCP tools, not raw HTTP.

Assets: Assets/LearnGames/ZipZapZop/VO/ZipZapZop_VO_01..11_*.wav (already generated, 44.1 kHz). Do not regenerate, rename, or edit them. Do not touch Assets/TutorialVO/ or Assets/GeneratedSFX/.

Goal:
1. Add path constants in RehearsalBandAssetManifest.ts for the 11 cues (style: "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_01_Intro.wav").
2. Fill voCueIds on the zip_zap_zop pack in LearnGameContent with the 11 cue ids, in order.
3. Add a small Learn Mode VO player (extend the audio controller or add a new script) that plays cues with Audio.PlaybackMode.LowPower. One cue at a time; starting a new cue stops the current one.
4. Behavior: on Learn Mode open with Teleprompter, play 01 Intro then 02 to 08 as the matching teleprompter line is shown (cue 02 with line 1, 03 with line 2, 04 Zip, 05 Zap, 06 Zop, 07 with line 6, 08 with line 7). Cues 09 to 11 play after the last line (09, 10, 11 in order). Add a mute/replay toggle if cheap.
5. Close, or switching mode, stops any playing cue. Opening Learn Mode must not start the workshop timer, and VO must never block Next, Timer, Suggestion, or Place buttons.
6. No Lens scripts outside the Learn Mode wiring. Do not implement other packages.

Acceptance:
- In Interactive Preview, opening Instructions on Zip Zap Zop plays the cues in order, in sync with the teleprompter lines.
- Close stops audio. Existing SFX and tutorial VO unaffected.
- Short delivery note listing files touched.
```
