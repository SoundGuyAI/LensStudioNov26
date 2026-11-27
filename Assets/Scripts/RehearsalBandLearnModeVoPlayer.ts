/**
 * RehearsalBandLearnModeVoPlayer — Learn Mode Zip Zap Zop VO sequence.
 * Owns: LowPower one-at-a-time Learn VO channel + teleprompter step sync.
 * Must not: touch TutorialVO / GeneratedSFX channels or workshop timer.
 */

import {RehearsalBandTeleprompterUI} from "./RehearsalBandTeleprompterUI"

/** requireAsset paths must be string literals (Lens bundler). */
const LEARN_VO_CUES: AudioTrackAsset[] = [
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_01_Intro.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_02_EnergyBall.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_03_OneWord.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_04_Zip.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_05_Zap.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_06_Zop.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_07_Cycle.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_08_EyeContact.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_09_Mistake.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_10_ClarityFirst.wav") as AudioTrackAsset,
  requireAsset("../LearnGames/ZipZapZop/VO/ZipZapZop_VO_11_Close.wav") as AudioTrackAsset,
]

/** Cue 01 = intro (no line); 02–08 ↔ lines 0–6; 09–11 after last line. */
const FIRST_LINE_CUE_INDEX = 1
const LAST_LINE_CUE_INDEX = 7

@component
export class RehearsalBandLearnModeVoPlayer extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnModeVoPlayer – Learn Mode VO</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Teleprompter panel to highlight lines as cues play")
  teleprompterUI!: RehearsalBandTeleprompterUI
  @ui.group_end

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(0, 1, 0.05))
  @hint("Learn Mode narration volume")
  volume: number = 0.95
  @ui.group_end

  private audio: AudioComponent | null = null
  private running = false
  private waitingForFinish = false
  private muted = false
  private cueIndex = 0
  private gapLeft = 0
  private enabledCueCount = 0

  onAwake(): void {
    const so = global.scene.createSceneObject("LearnModeVoAudio")
    so.setParent(this.getSceneObject())
    this.audio = so.createComponent("Component.AudioComponent") as AudioComponent
    this.audio.playbackMode = Audio.PlaybackMode.LowPower
    this.audio.volume = this.volume

    this.createEvent("OnStartEvent").bind(() => {
      if (!this.audio) {
        return
      }
      this.audio.playbackMode = Audio.PlaybackMode.LowPower
      this.audio.setOnFinish(() => this.onVoFinished())
    })
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /**
   * Start the Learn VO sequence when the pack has cues.
   * cueCount should match pack.voCueIds.length (capped to available tracks).
   */
  startSequence(cueCount: number): void {
    this.stop()
    this.enabledCueCount = Math.min(Math.max(0, cueCount), LEARN_VO_CUES.length)
    if (this.enabledCueCount === 0) {
      return
    }
    this.running = true
    this.waitingForFinish = false
    this.cueIndex = 0
    this.gapLeft = 0.2
    this.applyTeleprompterForCue(0)
    print(`RehearsalBand: Learn VO sequence start (${this.enabledCueCount} cues)`)
  }

  stop(): void {
    this.running = false
    this.waitingForFinish = false
    this.gapLeft = 0
    if (this.audio && this.audio.isPlaying()) {
      this.audio.stop(false)
    }
  }

  replay(): void {
    if (this.enabledCueCount <= 0) {
      this.enabledCueCount = LEARN_VO_CUES.length
    }
    this.startSequence(this.enabledCueCount)
  }

  isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.volume
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  isPlaying(): boolean {
    return this.running && !!(this.audio && this.audio.isPlaying())
  }

  private onUpdate(): void {
    if (!this.running || this.waitingForFinish) {
      return
    }
    if (this.gapLeft > 0) {
      this.gapLeft -= getDeltaTime()
      return
    }
    this.playCurrentCue()
  }

  private playCurrentCue(): void {
    if (!this.audio) {
      this.running = false
      return
    }
    if (this.cueIndex >= this.enabledCueCount) {
      this.running = false
      print("RehearsalBand: Learn VO sequence complete")
      return
    }
    const track = LEARN_VO_CUES[this.cueIndex]
    if (!track) {
      this.running = false
      return
    }
    this.applyTeleprompterForCue(this.cueIndex)
    if (this.audio.isPlaying()) {
      this.audio.stop(false)
    }
    this.audio.audioTrack = track
    this.audio.playbackMode = Audio.PlaybackMode.LowPower
    this.audio.volume = this.muted ? 0 : this.volume
    this.waitingForFinish = true
    this.audio.play(1)
    print(`RehearsalBand: Learn VO cue ${this.cueIndex + 1}/${this.enabledCueCount}`)
  }

  private onVoFinished(): void {
    if (!this.running) {
      this.waitingForFinish = false
      return
    }
    if (!this.waitingForFinish) {
      return
    }
    this.waitingForFinish = false
    this.cueIndex += 1
    this.gapLeft = 0.25
  }

  private applyTeleprompterForCue(cueIndex: number): void {
    if (!this.teleprompterUI) {
      return
    }
    if (cueIndex < FIRST_LINE_CUE_INDEX) {
      // Intro: lines visible but none highlighted.
      this.teleprompterUI.setActiveLineIndex(-1)
      return
    }
    if (cueIndex <= LAST_LINE_CUE_INDEX) {
      this.teleprompterUI.setActiveLineIndex(cueIndex - FIRST_LINE_CUE_INDEX)
      return
    }
    // Coaching / close: keep last teleprompter line highlighted.
    this.teleprompterUI.setActiveLineIndex(LAST_LINE_CUE_INDEX - FIRST_LINE_CUE_INDEX)
  }
}
