/**
 * RehearsalBandState — pure workshop session state.
 * Owns: exercise list, current index, countdown timer, suggestion pool/index, suggestion visibility.
 * Must not: touch SceneObjects, UI, or audio.
 */

export type ExerciseBlock = "Warm-up" | "Scene Work" | "Showcase"

export interface Exercise {
  block: ExerciseBlock
  name: string
  durationSec: number
}

export type SuggestionKind = "Location" | "Relationship" | "Word"

export interface Suggestion {
  kind: SuggestionKind
  text: string
}

export const WORKSHOP_PLAN: Exercise[] = [
  {block: "Warm-up", name: "Zip Zap Zop", durationSec: 180},
  {block: "Warm-up", name: "Yes And Circle", durationSec: 240},
  {block: "Scene Work", name: "Location Freeze", durationSec: 300},
  {block: "Scene Work", name: "Relationship Swap", durationSec: 300},
  {block: "Showcase", name: "Open Scenes", durationSec: 480},
]

export const SUGGESTION_POOL: Suggestion[] = [
  {kind: "Location", text: "Laundromat at midnight"},
  {kind: "Location", text: "Submarine control room"},
  {kind: "Location", text: "Museum after hours"},
  {kind: "Relationship", text: "Estranged siblings"},
  {kind: "Relationship", text: "Rival pastry chefs"},
  {kind: "Relationship", text: "Former bandmates"},
  {kind: "Word", text: "Umbrella"},
  {kind: "Word", text: "Thunder"},
  {kind: "Word", text: "Passport"},
  {kind: "Word", text: "Mirage"},
]

export class RehearsalBandState {
  private exerciseIndex = 0
  private remainingSec = WORKSHOP_PLAN[0].durationSec
  private timerRunning = false
  private suggestionIndex = 0
  private suggestionVisible = false

  getExerciseIndex(): number {
    return this.exerciseIndex
  }

  getCurrentExercise(): Exercise {
    return WORKSHOP_PLAN[this.exerciseIndex]
  }

  getPlan(): Exercise[] {
    return WORKSHOP_PLAN
  }

  getRemainingSec(): number {
    return Math.max(0, Math.ceil(this.remainingSec))
  }

  isTimerRunning(): boolean {
    return this.timerRunning
  }

  isSuggestionVisible(): boolean {
    return this.suggestionVisible
  }

  getSuggestion(): Suggestion {
    return SUGGESTION_POOL[this.suggestionIndex]
  }

  formatTimer(): string {
    const total = this.getRemainingSec()
    const m = Math.floor(total / 60)
    const s = total % 60
    const ss = s < 10 ? `0${s}` : `${s}`
    return `${m}:${ss}`
  }

  advanceExercise(): Exercise {
    if (this.exerciseIndex < WORKSHOP_PLAN.length - 1) {
      this.exerciseIndex += 1
    }
    const ex = this.getCurrentExercise()
    this.remainingSec = ex.durationSec
    this.timerRunning = false
    return ex
  }

  startTimer(): void {
    if (this.remainingSec <= 0) {
      this.remainingSec = this.getCurrentExercise().durationSec
    }
    this.timerRunning = true
  }

  resetTimer(): void {
    this.remainingSec = this.getCurrentExercise().durationSec
    this.timerRunning = false
  }

  tick(dt: number): boolean {
    if (!this.timerRunning) {
      return false
    }
    if (this.remainingSec <= 0) {
      this.timerRunning = false
      this.remainingSec = 0
      return true
    }
    this.remainingSec -= dt
    if (this.remainingSec <= 0) {
      this.remainingSec = 0
      this.timerRunning = false
      return true
    }
    return false
  }

  openSuggestion(): Suggestion {
    this.suggestionVisible = true
    return this.getSuggestion()
  }

  nextSuggestion(): Suggestion {
    this.suggestionVisible = true
    this.suggestionIndex = (this.suggestionIndex + 1) % SUGGESTION_POOL.length
    return this.getSuggestion()
  }

  hideSuggestion(): void {
    this.suggestionVisible = false
  }
}
