# Learn Mode VO wiring (Package F) — delivery note

Wired the 11 Zip Zap Zop Learn Mode VO clips into the teleprompter flow. `Assets/TutorialVO/` and `Assets/GeneratedSFX/` untouched.

## Files touched

- `Assets/Scripts/RehearsalBandAssetManifest.ts` — 11 `VO_ZIPZAPZOP_*` path constants
- `Assets/Scripts/LearnGames/LearnGameContent.ts` — filled `voCueIds` (11 ids)
- `Assets/Scripts/RehearsalBandLearnModeVoPlayer.ts` — new LowPower one-at-a-time VO player
- `Assets/Scripts/RehearsalBandTeleprompterUI.ts` — `setActiveLineIndex` highlight sync
- `Assets/Scripts/RehearsalBandLearnModeController.ts` — start/stop VO with teleprompter mode + close
- `Assets/Scripts/RehearsalBandLearnModePickerUI.ts` — Replay / Mute VO controls
- `Assets/Scripts/RehearsalBandMain.ts` — preview demo hotkeys Six (open Teleprompter+VO) / Seven (close)
- `Assets/Scene.scene` — `LearnModeVoPlayer` object + controller wiring
- `.gitignore` — ignore broken local `AiPreviewAgentInteract` reinstalls

## Preview checks (Interactive)

- Open Teleprompter (hotkey Six): cues 1→N log in order; teleprompter lines highlight with cues 02–08
- `LearnModeVoAudio.playbackMode === LowPower` (0)
- Mode switch to Aim Practice stops further Learn VO cues
- Close (hotkey Seven) stops VO; workshop timer unchanged
