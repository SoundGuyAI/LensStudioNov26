/**
 * RehearsalBandAssetManifest — stable asset paths and authored scene contract names.
 * Owns: path constants for generated meshes/SFX/icons.
 * Must not: create scene objects or hold runtime state.
 *
 * MESH_TABLE / MESH_WALL are optional stand-ins only (RehearsalBandMain.showStandInRoomMeshes).
 * Default product placement uses SuggestionAnchor / AgendaAnchor in Interactive Preview.
 */

export const MESH_TABLE = "../GeneratedMeshes/RehearsalTable.glb"
export const MESH_WALL = "../GeneratedMeshes/AgendaWall.glb"

export const SFX_CLICK = "../GeneratedSFX/ButtonClick.wav"
export const SFX_ADVANCE = "../GeneratedSFX/AdvanceChime.wav"
export const SFX_SUGGESTION = "../GeneratedSFX/SuggestionSwap.wav"

export const VO_TUTORIAL_01 = "../TutorialVO/Tutorial_01_Welcome.wav"
export const VO_TUTORIAL_02 = "../TutorialVO/Tutorial_02_Wristband.wav"
export const VO_TUTORIAL_03 = "../TutorialVO/Tutorial_03_PalmMenu.wav"
export const VO_TUTORIAL_04 = "../TutorialVO/Tutorial_04_SuggestionCard.wav"
export const VO_TUTORIAL_05 = "../TutorialVO/Tutorial_05_ChangeSuggestion.wav"
export const VO_TUTORIAL_06 = "../TutorialVO/Tutorial_06_PalmSuggestion.wav"
export const VO_TUTORIAL_07 = "../TutorialVO/Tutorial_07_Timer.wav"
export const VO_TUTORIAL_08 = "../TutorialVO/Tutorial_08_Agenda.wav"
export const VO_TUTORIAL_09 = "../TutorialVO/Tutorial_09_Next.wav"
export const VO_TUTORIAL_10 = "../TutorialVO/Tutorial_10_PlaceTable.wav"
export const VO_TUTORIAL_11 = "../TutorialVO/Tutorial_11_PlaceWall.wav"
export const VO_TUTORIAL_12 = "../TutorialVO/Tutorial_12_Close.wav"

export const VO_HINT_LOOK_AT_WRIST = "../TutorialVO/Hint_LookAtWrist.wav"
export const VO_HINT_START_TIMER = "../TutorialVO/Hint_StartTimer.wav"
export const VO_HINT_NEXT_EXERCISE = "../TutorialVO/Hint_NextExercise.wav"
export const VO_HINT_NEW_SUGGESTION = "../TutorialVO/Hint_NewSuggestion.wav"
export const VO_HINT_PLACE_SURFACES = "../TutorialVO/Hint_PlaceSurfaces.wav"

/** Learn Mode Zip Zap Zop VO (Package F) — LowPower cues under LearnGames/. */
export const VO_ZIPZAPZOP_01 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_01_Intro.wav"
export const VO_ZIPZAPZOP_02 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_02_EnergyBall.wav"
export const VO_ZIPZAPZOP_03 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_03_OneWord.wav"
export const VO_ZIPZAPZOP_04 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_04_Zip.wav"
export const VO_ZIPZAPZOP_05 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_05_Zap.wav"
export const VO_ZIPZAPZOP_06 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_06_Zop.wav"
export const VO_ZIPZAPZOP_07 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_07_Cycle.wav"
export const VO_ZIPZAPZOP_08 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_08_EyeContact.wav"
export const VO_ZIPZAPZOP_09 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_09_Mistake.wav"
export const VO_ZIPZAPZOP_10 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_10_ClarityFirst.wav"
export const VO_ZIPZAPZOP_11 = "../LearnGames/ZipZapZop/VO/ZipZapZop_VO_11_Close.wav"

export const ICON_NEXT = "../Icons/skip_next.png"
export const ICON_BULB = "../Icons/lightbulb.png"
export const ICON_TIMER = "../Icons/timer.png"
export const ICON_RESET = "../Icons/restart_alt.png"

export const SCENE_ROOT = "RehearsalBand"
export const SCENE_CONTENT = "Content"
export const SCENE_UI = "UI"
export const SCENE_TABLE_SLOT = "TableSlot"
export const SCENE_WALL_SLOT = "WallSlot"
export const SCENE_SUGGESTION_ANCHOR = "SuggestionAnchor"
export const SCENE_AGENDA_ANCHOR = "AgendaAnchor"
export const SCENE_WRISTBAND = "WristbandUI"
export const SCENE_PALM = "PalmMenuUI"
export const SCENE_SUGGESTION_UI = "SuggestionUI"
export const SCENE_AGENDA_UI = "AgendaUI"
