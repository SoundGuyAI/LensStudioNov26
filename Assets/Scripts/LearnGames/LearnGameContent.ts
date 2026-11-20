/**
 * LearnGameContent — data-driven Learn Mode packs keyed by game id.
 * Owns: teleprompter lines, locked rules summary, reference URLs.
 * Must not: render UI or start/stop the workshop timer.
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
  demo3dRootPath?: string
  voCueIds?: string[]
  canonicalRulesSummary: string
  referencesUsed: string[]
}

/** Map agenda exercise display names → LearnGameId. */
const EXERCISE_NAME_TO_ID: Record<string, LearnGameId> = {
  "Zip Zap Zop": "zip_zap_zop",
  "Yes And Circle": "yes_and_circle",
  "Location Freeze": "location_freeze",
  "Relationship Swap": "relationship_swap",
  "Open Scenes": "open_scenes",
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

/**
 * Canonical Rehearsal Band Zip Zap Zop: Zip→Zap→Zop energy-pass cycle.
 * Locked against the classic teaching sources below — NOT the improwiki
 * Zip Zap Zoop variant (where Zip/Zap/Zop mean different impulse actions).
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
  voCueIds: [],
  canonicalRulesSummary:
    "Players stand in a circle and pass an energy impulse with clear eye contact plus a point or clap. Word order always cycles Zip → Zap → Zop → Zip. Goals are focus, receiving before sending, and shared rhythm. On a mistake, celebrate briefly and restart from Zip; speed comes after clarity, and energy should never hit the floor.",
  referencesUsed: [
    "https://allimprov.com/learn/games/zip-zap-zop/",
    "https://improvcollective.com/games/zip-zap-zop-classic",
    "https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop",
    "https://www.hooplaimpro.com/resource/zip-zap-zop",
    "https://www.oneruleimprov.com/2016/09/20/zip-zap-zop/",
    "https://theatreforlifelonglearning.org/improv-for-everyone-zip-zap-zop/",
    "https://ecrs.org/activities/zip-zap-zop",
    // Variant warning only — do not use for v1 rules:
    "https://improwiki.com/en/wiki/zip-zap-zoop",
  ],
}

const PACKS: Record<LearnGameId, LearnGamePack> = {
  zip_zap_zop: ZIP_ZAP_ZOP,
  yes_and_circle: stubPack("yes_and_circle", "Yes And Circle"),
  location_freeze: stubPack("location_freeze", "Location Freeze"),
  relationship_swap: stubPack("relationship_swap", "Relationship Swap"),
  open_scenes: stubPack("open_scenes", "Open Scenes"),
}

export function getLearnGamePack(id: LearnGameId): LearnGamePack {
  return PACKS[id]
}

export function learnGameIdFromExerciseName(exerciseName: string): LearnGameId | null {
  return EXERCISE_NAME_TO_ID[exerciseName] ?? null
}

export function getLearnGamePackForExercise(exerciseName: string): LearnGamePack | null {
  const id = learnGameIdFromExerciseName(exerciseName)
  return id ? PACKS[id] : null
}
