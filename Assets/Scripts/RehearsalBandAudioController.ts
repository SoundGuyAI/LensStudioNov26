/**
 * RehearsalBandAudioController — SFX playback helpers.
 * Owns: AudioComponents for click / advance / suggestion cues.
 * Must not: own workshop state or UI.
 */

@component
export class RehearsalBandAudioController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandAudioController – host SFX</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(0, 1, 0.05))
  @hint("Volume for interactive host cues")
  sfxVolume: number = 0.85
  @ui.group_end

  private clickAudio: AudioComponent | null = null
  private advanceAudio: AudioComponent | null = null
  private suggestionAudio: AudioComponent | null = null

  onAwake(): void {
    this.clickAudio = this.makePlayer(
      "ClickAudio",
      requireAsset("../GeneratedSFX/ButtonClick.wav") as AudioTrackAsset,
    )
    this.advanceAudio = this.makePlayer(
      "AdvanceAudio",
      requireAsset("../GeneratedSFX/AdvanceChime.wav") as AudioTrackAsset,
    )
    this.suggestionAudio = this.makePlayer(
      "SuggestionAudio",
      requireAsset("../GeneratedSFX/SuggestionSwap.wav") as AudioTrackAsset,
    )
  }

  playClick(): void {
    this.play(this.clickAudio)
  }

  playAdvance(): void {
    this.play(this.advanceAudio)
  }

  playSuggestion(): void {
    this.play(this.suggestionAudio)
  }

  private makePlayer(name: string, track: AudioTrackAsset): AudioComponent {
    const so = global.scene.createSceneObject(name)
    so.setParent(this.getSceneObject())
    const audio = so.createComponent("Component.AudioComponent") as AudioComponent
    audio.audioTrack = track
    audio.playbackMode = Audio.PlaybackMode.LowLatency
    audio.volume = this.sfxVolume
    return audio
  }

  private play(audio: AudioComponent | null): void {
    if (!audio) {
      return
    }
    audio.volume = this.sfxVolume
    audio.play(1)
  }
}
