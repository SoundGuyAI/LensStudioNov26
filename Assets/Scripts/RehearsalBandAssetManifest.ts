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
