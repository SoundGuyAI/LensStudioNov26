/**
 * RehearsalBandTutorialController — first-run / replay host onboarding VO.
 * Owns: ordered Tutorial_01..12 cue playback with gaps; does not block host controls.
 * Must not: mute UI SFX or own workshop state.
 */

import {RehearsalBandAudioController} from "./RehearsalBandAudioController"

// requireAsset paths MUST be string literals (Lens bundler resolves at compile time).
const VO_01 = requireAsset("../TutorialVO/Tutorial_01_Welcome.wav") as AudioTrackAsset
const VO_02 = requireAsset("../TutorialVO/Tutorial_02_Wristband.wav") as AudioTrackAsset
const VO_03 = requireAsset("../TutorialVO/Tutorial_03_PalmMenu.wav") as AudioTrackAsset
const VO_04 = requireAsset("../TutorialVO/Tutorial_04_SuggestionCard.wav") as AudioTrackAsset
const VO_05 = requireAsset("../TutorialVO/Tutorial_05_ChangeSuggestion.wav") as AudioTrackAsset
const VO_06 = requireAsset("../TutorialVO/Tutorial_06_PalmSuggestion.wav") as AudioTrackAsset
const VO_07 = requireAsset("../TutorialVO/Tutorial_07_Timer.wav") as AudioTrackAsset
const VO_08 = requireAsset("../TutorialVO/Tutorial_08_Agenda.wav") as AudioTrackAsset
const VO_09 = requireAsset("../TutorialVO/Tutorial_09_Next.wav") as AudioTrackAsset
const VO_10 = requireAsset("../TutorialVO/Tutorial_10_PlaceTable.wav") as AudioTrackAsset
const VO_11 = requireAsset("../TutorialVO/Tutorial_11_PlaceWall.wav") as AudioTrackAsset
const VO_12 = requireAsset("../TutorialVO/Tutorial_12_Close.wav") as AudioTrackAsset

const HINT_LOOK_AT_WRIST = requireAsset("../TutorialVO/Hint_LookAtWrist.wav") as AudioTrackAsset
const HINT_START_TIMER = requireAsset("../TutorialVO/Hint_StartTimer.wav") as AudioTrackAsset
const HINT_NEXT_EXERCISE = requireAsset("../TutorialVO/Hint_NextExercise.wav") as AudioTrackAsset
const HINT_NEW_SUGGESTION = requireAsset("../TutorialVO/Hint_NewSuggestion.wav") as AudioTrackAsset
const HINT_PLACE_SURFACES = requireAsset("../TutorialVO/Hint_PlaceSurfaces.wav") as AudioTrackAsset

const TUTORIAL_CUES: AudioTrackAsset[] = [
  VO_01,
  VO_02,
  VO_03,
  VO_04,
  VO_05,
  VO_06,
  VO_07,
  VO_08,
  VO_09,
  VO_10,
  VO_11,
  VO_12,
]

@component
export class RehearsalBandTutorialController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandTutorialController – host VO tour</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Shared audio controller (VO uses LowPower channel)")
  audioController!: RehearsalBandAudioController
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @hint("Play Tutorial_01..12 once after lens start")
  autoPlayOnStart: boolean = true

  @input
  @widget(new SliderWidget(0.2, 2.5, 0.1))
  @hint("Silence between cues (seconds)")
  gapBetweenCuesSec: number = 0.7

  @input
  @widget(new SliderWidget(0.5, 4, 0.1))
  @hint("Delay before Welcome starts (lets anchors settle)")
  startDelaySec: number = 1.2
  @ui.group_end

  private cueIndex = 0
  private running = false
  private paused = false
  private waitingForFinish = false
  private gapLeft = 0
  private startDelayLeft = 0
  private finishedOnce = false

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      if (!this.audioController) {
        print("RehearsalBandTutorialController: audioController not wired.")
        return
      }
      this.audioController.setVoFinishedHandler(() => this.onVoFinished())
      if (this.autoPlayOnStart) {
        this.startTutorial()
      }
    })
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /** Begin (or restart) the 12-cue host tour. Host controls stay usable. */
  startTutorial(): void {
    if (!this.audioController) {
      return
    }
    this.stopTutorial()
    this.cueIndex = 0
    this.running = true
    this.paused = false
    this.waitingForFinish = false
    this.gapLeft = 0
    this.startDelayLeft = Math.max(0, this.startDelaySec)
    print("RehearsalBand: tutorial VO starting")
  }

  /** Alias for a manual “Replay tutorial” entry point. */
  replayTutorial(): void {
    this.startTutorial()
  }

  stopTutorial(): void {
    this.running = false
    this.paused = false
    this.waitingForFinish = false
    this.gapLeft = 0
    this.startDelayLeft = 0
    if (this.audioController) {
      this.audioController.stopVo()
    }
  }

  /** Pause linear tour (e.g. Learn Mode open) without resetting progress. */
  pauseTutorial(): void {
    if (!this.running || this.paused) {
      return
    }
    this.paused = true
    if (this.audioController) {
      this.audioController.stopVo()
    }
    this.waitingForFinish = false
  }

  /** Resume after pause; continues from the next pending cue. */
  resumeTutorial(): void {
    if (!this.running || !this.paused) {
      return
    }
    this.paused = false
    this.gapLeft = Math.max(this.gapLeft, 0.35)
  }

  isRunning(): boolean {
    return this.running
  }

  hasFinishedOnce(): boolean {
    return this.finishedOnce
  }

  playHintLookAtWrist(): void {
    this.playHint(HINT_LOOK_AT_WRIST)
  }

  playHintStartTimer(): void {
    this.playHint(HINT_START_TIMER)
  }

  playHintNextExercise(): void {
    this.playHint(HINT_NEXT_EXERCISE)
  }

  playHintNewSuggestion(): void {
    this.playHint(HINT_NEW_SUGGESTION)
  }

  playHintPlaceSurfaces(): void {
    this.playHint(HINT_PLACE_SURFACES)
  }

  private playHint(track: AudioTrackAsset): void {
    if (!this.audioController) {
      return
    }
    // Hints only when the linear tour is idle so they do not stack over Welcome..Close.
    if (this.running && !this.paused) {
      return
    }
    this.audioController.playVo(track)
  }

  private onUpdate(): void {
    if (!this.running || this.paused || this.waitingForFinish) {
      return
    }
    const dt = getDeltaTime()
    if (this.startDelayLeft > 0) {
      this.startDelayLeft -= dt
      return
    }
    if (this.gapLeft > 0) {
      this.gapLeft -= dt
      return
    }
    this.playCurrentCue()
  }

  private playCurrentCue(): void {
    if (this.cueIndex >= TUTORIAL_CUES.length) {
      this.running = false
      this.finishedOnce = true
      print("RehearsalBand: tutorial VO complete")
      return
    }
    const track = TUTORIAL_CUES[this.cueIndex]
    this.waitingForFinish = true
    this.audioController.playVo(track)
    print(`RehearsalBand: tutorial cue ${this.cueIndex + 1}/${TUTORIAL_CUES.length}`)
  }

  private onVoFinished(): void {
    if (!this.running || this.paused) {
      this.waitingForFinish = false
      return
    }
    if (!this.waitingForFinish) {
      return
    }
    this.waitingForFinish = false
    this.cueIndex += 1
    if (this.cueIndex >= TUTORIAL_CUES.length) {
      this.running = false
      this.finishedOnce = true
      print("RehearsalBand: tutorial VO complete")
      return
    }
    this.gapLeft = Math.max(0, this.gapBetweenCuesSec)
  }
}
