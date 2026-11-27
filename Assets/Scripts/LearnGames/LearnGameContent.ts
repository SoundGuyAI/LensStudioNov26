/**
 * LearnGameContent — data packs for Learn Mode teach surfaces.
 * Owns: game ids, teleprompter lines, canonical rules, reference URLs.
 * Must not: own UI, scene objects, or timer logic.
 */

export type LearnGameId =
  | "zip_zap_zop"
  | "yes_and_circle"
  | "location_freeze"
  | "relationship_swap"
  | "open_scenes"

export interface LearnGamePack {
  id: LearnGameId
  displayName: string
  teleprompterLines: string[]
  videoAssetPath?: string
  /** Optional path to Package D demo assets (actors/ball helpers). */
  demo3dRootPath?: string
  voCueIds?: string[]
  canonicalRulesSummary: string
  referencesUsed: string[]
}

/** Map agenda exercise display names → content pack ids. */
const DISPLAY_NAME_TO_ID: Record<string, LearnGameId> = {
  "Zip Zap Zop": "zip_zap_zop",
  "Yes And Circle": "yes_and_circle",
  "Location Freeze": "location_freeze",
  "Relationship Swap": "relationship_swap",
  "Open Scenes": "open_scenes",
}

/**
 * Canonical Rehearsal Band Zip Zap Zop (v1): energy-pass cycle Zip→Zap→Zop.
 * Locked from pedagogy sources; deliberately excludes the Zip Zap Zoop variant
 * (different word meanings / mechanics) documented on improwiki.
 */
const ZIP_ZAP_ZOP: LearnGamePack = {
  id: "zip_zap_zop",
  displayName: "Zip Zap Zop",
  teleprompterLines: [
    "Pass an energy ball",
    "Say one word each pass",
    "Zip",
    "Zap",
    "Zop",
    "Repeat the cycle",
    "Eye contact before you pass",
  ],
  demo3dRootPath: "LearnGames/ZipZapZop/Demo3D",
  voCueIds: [],
  canonicalRulesSummary:
    "Players stand in a circle and pass an energy impulse with clear eye contact and a committed gesture (point or clap). Word order always cycles Zip → Zap → Zop → Zip. Focus on receiving before sending and shared rhythm; on a mistake, celebrate briefly and restart from Zip. Speed comes after clarity — energy should never hit the floor.",
  referencesUsed: [
    "https://allimprov.com/learn/games/zip-zap-zop/",
    "https://improvcollective.com/games/zip-zap-zop-classic",
    "https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop",
    "https://www.hooplaimpro.com/resource/zip-zap-zop",
    "https://www.oneruleimprov.com/2016/09/20/zip-zap-zop/",
    "https://theatreforlifelonglearning.org/improv-for-everyone-zip-zap-zop/",
    "https://www.vastage.org/blog/edu-zip-zap-zop",
    "https://www.unicef.org/adolescentkit/activity-box/energizer/zip-zap-zop",
  ],
}

function stubPack(id: LearnGameId, displayName: string): LearnGamePack {
  return {
    id,
    displayName,
    teleprompterLines: [],
    voCueIds: [],
    canonicalRulesSummary: "",
    referencesUsed: [],
  }
}

const PACKS: Record<LearnGameId, LearnGamePack> = {
  zip_zap_zop: ZIP_ZAP_ZOP,
  yes_and_circle: stubPack("yes_and_circle", "Yes And Circle"),
  location_freeze: stubPack("location_freeze", "Location Freeze"),
  relationship_swap: stubPack("relationship_swap", "Relationship Swap"),
  open_scenes: stubPack("open_scenes", "Open Scenes"),
}

export function learnGameIdFromExerciseName(exerciseName: string): LearnGameId | null {
  return DISPLAY_NAME_TO_ID[exerciseName] ?? null
}

export function getLearnGamePack(id: LearnGameId): LearnGamePack {
  return PACKS[id]
}

export function getLearnGamePackForExercise(exerciseName: string): LearnGamePack | null {
  const id = learnGameIdFromExerciseName(exerciseName)
  return id ? PACKS[id] : null
}
