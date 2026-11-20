/**
 * RehearsalBandAudioController — SFX + tutorial VO playback helpers.
 * Owns: AudioComponents for click / advance / suggestion cues and LowPower VO.
 * Must not: own workshop state or UI.
 */

@component
export class RehearsalBandAudioController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandAudioController – host SFX + VO</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(0, 1, 0.05))
  @hint("Volume for interactive host cues")
  sfxVolume: number = 0.85

  @input
  @widget(new SliderWidget(0, 1, 0.05))
  @hint("Volume for tutorial / hint narration")
  voVolume: number = 0.95
  @ui.group_end

  private clickAudio: AudioComponent | null = null
  private advanceAudio: AudioComponent | null = null
  private suggestionAudio: AudioComponent | null = null
  private voAudio: AudioComponent | null = null
  private voFinishedHandler: (() => void) | null = null

  onAwake(): void {
    this.clickAudio = this.makePlayer(
      "ClickAudio",
      requireAsset("../GeneratedSFX/ButtonClick.wav") as AudioTrackAsset,
      Audio.PlaybackMode.LowLatency,
    )
    this.advanceAudio = this.makePlayer(
      "AdvanceAudio",
      requireAsset("../GeneratedSFX/AdvanceChime.wav") as AudioTrackAsset,
      Audio.PlaybackMode.LowLatency,
    )
    this.suggestionAudio = this.makePlayer(
      "SuggestionAudio",
      requireAsset("../GeneratedSFX/SuggestionSwap.wav") as AudioTrackAsset,
      Audio.PlaybackMode.LowLatency,
    )
    this.voAudio = this.makePlayer("TutorialVoAudio", null, Audio.PlaybackMode.LowPower)
    this.createEvent("OnStartEvent").bind(() => {
      this.applyPlaybackModes()
      if (this.voAudio) {
        this.voAudio.setOnFinish(() => {
          if (this.voFinishedHandler) {
            this.voFinishedHandler()
          }
        })
      }
    })
  }

  playClick(): void {
    this.play(this.clickAudio, this.sfxVolume)
  }

  playAdvance(): void {
    this.play(this.advanceAudio, this.sfxVolume)
  }

  playSuggestion(): void {
    this.play(this.suggestionAudio, this.sfxVolume)
  }

  /** Play narration on the LowPower VO channel (stops any prior VO). */
  playVo(track: AudioTrackAsset): void {
    if (!this.voAudio || !track) {
      return
    }
    if (this.voAudio.isPlaying()) {
      this.voAudio.stop(false)
    }
    this.voAudio.audioTrack = track
    this.voAudio.volume = this.voVolume
    this.voAudio.playbackMode = Audio.PlaybackMode.LowPower
    this.voAudio.play(1)
  }

  stopVo(): void {
    if (!this.voAudio) {
      return
    }
    if (this.voAudio.isPlaying()) {
      this.voAudio.stop(false)
    }
  }

  isVoPlaying(): boolean {
    return !!(this.voAudio && this.voAudio.isPlaying())
  }

  setVoFinishedHandler(handler: (() => void) | null): void {
    this.voFinishedHandler = handler
  }

  private applyPlaybackModes(): void {
    if (this.clickAudio) {
      this.clickAudio.playbackMode = Audio.PlaybackMode.LowLatency
    }
    if (this.advanceAudio) {
      this.advanceAudio.playbackMode = Audio.PlaybackMode.LowLatency
    }
    if (this.suggestionAudio) {
      this.suggestionAudio.playbackMode = Audio.PlaybackMode.LowLatency
    }
    if (this.voAudio) {
      this.voAudio.playbackMode = Audio.PlaybackMode.LowPower
    }
  }

  private makePlayer(
    name: string,
    track: AudioTrackAsset | null,
    mode: Audio.PlaybackMode,
  ): AudioComponent {
    const so = global.scene.createSceneObject(name)
    so.setParent(this.getSceneObject())
    const audio = so.createComponent("Component.AudioComponent") as AudioComponent
    if (track) {
      audio.audioTrack = track
    }
    audio.playbackMode = mode
    audio.volume = mode === Audio.PlaybackMode.LowPower ? this.voVolume : this.sfxVolume
    return audio
  }

  private play(audio: AudioComponent | null, volume: number): void {
    if (!audio) {
      return
    }
    audio.volume = volume
    audio.play(1)
  }
}
