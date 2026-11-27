/**
 * RehearsalBandLearnModeController — open/close Learn Mode + active teach surface.
 * Owns: shell visibility, mode switching, wiring picker ↔ panels + content pack.
 * Must not: start/stop workshop timer; author Package C–D media.
 */

import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Exercise} from "./RehearsalBandState"
import {getLearnGamePackForExercise} from "./LearnGames/LearnGameContent"
import {LearnModeKind, RehearsalBandLearnModePickerUI} from "./RehearsalBandLearnModePickerUI"
import {RehearsalBandTeleprompterUI} from "./RehearsalBandTeleprompterUI"
import {RehearsalBandLearnVideoPlayer} from "./RehearsalBandLearnVideoPlayer"
import {RehearsalBandLearnDemo3D} from "./RehearsalBandLearnDemo3D"

@component
export class RehearsalBandLearnModeController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnModeController – Learn Mode shell</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Mode picker + Close chrome")
  pickerUI!: RehearsalBandLearnModePickerUI

  @input
  @hint("Teleprompter panel (content from LearnGameContent)")
  teleprompterUI!: RehearsalBandTeleprompterUI

  @input
  @hint("Video stub panel (Package C)")
  videoPlayer!: RehearsalBandLearnVideoPlayer

  @input
  @hint("3D Zip Zap Zop demo (Package D)")
  demo3d!: RehearsalBandLearnDemo3D
  @ui.group_end

  /** Fired after Close hides the shell. Timer is intentionally untouched. */
  public onClosed: Event<void> = new Event<void>()

  private isShellOpen = false
  private activeMode: LearnModeKind = "teleprompter"
  /** Parent OnStart runs before children — defer disable one frame so picker bindings land. */
  private pendingInitialHide = false

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      this.bindPickerEvents()
      this.pendingInitialHide = true
    })
    this.createEvent("UpdateEvent").bind(() => {
      if (this.pendingInitialHide && !this.isShellOpen) {
        this.pendingInitialHide = false
        this.getSceneObject().enabled = false
      }
    })
  }

  openForExercise(exercise: Exercise): void {
    if (!this.pickerUI || !this.teleprompterUI || !this.videoPlayer || !this.demo3d) {
      print("RehearsalBandLearnModeController: required @input not wired.")
      return
    }
    this.isShellOpen = true
    this.getSceneObject().enabled = true
    this.pickerUI.setExerciseTitle(exercise.name)
    this.applyContentForExercise(exercise.name)
    this.setMode("teleprompter")
    print(`RehearsalBand: Learn Mode open — ${exercise.name}`)
  }

  private applyContentForExercise(exerciseName: string): void {
    const pack = getLearnGamePackForExercise(exerciseName)
    const lines = pack ? pack.teleprompterLines : []
    this.teleprompterUI.setLines(lines)
    if (pack) {
      print(`RehearsalBand: Learn content loaded — ${pack.id} (${lines.length} cues)`)
    } else {
      print(`RehearsalBand: no LearnGamePack for "${exerciseName}"`)
    }
  }

  close(): void {
    if (!this.isShellOpen) {
      return
    }
    this.isShellOpen = false
    this.getSceneObject().enabled = false
    this.onClosed.invoke()
    print("RehearsalBand: Learn Mode closed (timer unchanged)")
  }

  isOpen(): boolean {
    return this.isShellOpen
  }

  getActiveMode(): LearnModeKind {
    return this.activeMode
  }

  setMode(mode: LearnModeKind): void {
    this.activeMode = mode
    if (this.pickerUI) {
      this.pickerUI.setActiveMode(mode)
    }
    if (this.teleprompterUI) {
      this.teleprompterUI.getSceneObject().enabled = mode === "teleprompter"
    }
    if (this.videoPlayer) {
      this.videoPlayer.getSceneObject().enabled = mode === "video"
    }
    if (this.demo3d) {
      this.demo3d.getSceneObject().enabled = mode === "demo3d"
    }
  }

  private bindPickerEvents(): void {
    if (!this.pickerUI) {
      return
    }
    this.pickerUI.onSelectVideo.add(() => this.setMode("video"))
    this.pickerUI.onSelectDemo3d.add(() => this.setMode("demo3d"))
    this.pickerUI.onSelectTeleprompter.add(() => this.setMode("teleprompter"))
    this.pickerUI.onClose.add(() => this.close())
  }
}
