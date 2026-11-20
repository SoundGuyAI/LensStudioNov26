/**
 * RehearsalBandMain — host-tool orchestrator for Rehearsal Band.
 * Owns: lifecycle, hand/wall look-gating, wiring UI events ↔ state.
 * Product UI lives at world anchors (suggestion at table height, agenda on wall).
 * Optional stand-in furniture meshes are OFF by default — use Interactive Preview's room.
 * Must not: author UIKit surfaces (those live in *UI.ts modules).
 */

import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {RehearsalBandAgendaUI} from "./RehearsalBandAgendaUI"
import {RehearsalBandAudioController} from "./RehearsalBandAudioController"
import {RehearsalBandPalmMenuUI} from "./RehearsalBandPalmMenuUI"
import {RehearsalBandState} from "./RehearsalBandState"
import {RehearsalBandSuggestionUI} from "./RehearsalBandSuggestionUI"
import {RehearsalBandWristbandUI} from "./RehearsalBandWristbandUI"

// requireAsset paths MUST be string literals (Lens bundler resolves at compile time).
const tablePrefab = requireAsset("../GeneratedMeshes/RehearsalTable.glb") as ObjectPrefab
const wallPrefab = requireAsset("../GeneratedMeshes/AgendaWall.glb") as ObjectPrefab

@component
export class RehearsalBandMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandMain – improv host orchestrator</span>')
  @ui.separator

  @ui.group_start("References")
  @input
  @hint("Wristband UI ScriptComponent")
  wristbandUI!: RehearsalBandWristbandUI

  @input
  @hint("Palm menu UI ScriptComponent")
  palmMenuUI!: RehearsalBandPalmMenuUI

  @input
  @hint("Table suggestion card UI ScriptComponent")
  suggestionUI!: RehearsalBandSuggestionUI

  @input
  @hint("Wall agenda UI ScriptComponent")
  agendaUI!: RehearsalBandAgendaUI

  @input
  @hint("Audio controller ScriptComponent")
  audioController!: RehearsalBandAudioController

  @input
  @allowUndefined
  @hint("Optional slot for stand-in table mesh (only used if Show Stand-In Room Meshes)")
  tableSlot?: SceneObject

  @input
  @allowUndefined
  @hint("Optional slot for stand-in wall mesh (only used if Show Stand-In Room Meshes)")
  wallSlot?: SceneObject

  @input
  @hint("World anchor for the suggestion card (table-surface height in the preview room)")
  suggestionAnchor!: SceneObject

  @input
  @hint("World anchor for the agenda panel (wall position in the preview room)")
  agendaAnchor!: SceneObject

  @input
  @hint("Hand-followed root for wristband + palm menu")
  handUiRoot!: SceneObject
  @ui.group_end

  @ui.separator
  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(0.2, 0.95, 0.05))
  @hint("Dot threshold for looking at hand / wall (higher = stricter)")
  lookDotThreshold: number = 0.45

  @input
  @hint("Prefer right hand for the wristband; falls back to left")
  preferRightHand: boolean = true

  @input
  @hint("Offset of wristband from wrist joint (cm, local-ish world offset)")
  wristbandOffset: vec3 = new vec3(0, 6, 4)

  @input
  @hint("Offset of palm menu from wrist (cm)")
  palmMenuOffset: vec3 = new vec3(0, 14, 2)

  @input
  @hint("When true, hand UI stays visible even if not looking at the hand")
  forceShowHandUI: boolean = false

  @input
  @hint("When true, wall agenda stays visible even if not looking at the wall")
  forceShowAgenda: boolean = false

  @input
  @hint("Spawn pretend wooden table/easel meshes. Leave OFF — use Interactive Preview room instead.")
  showStandInRoomMeshes: boolean = false

  @input
  @hint("Wireframe every collider for hit-zone diagnosis")
  debugColliders: boolean = false
  @ui.group_end

  private state = new RehearsalBandState()
  private handProvider = HandInputData.getInstance()
  private cameraProvider = WorldCameraFinderProvider.getInstance()
  private lastTimerLabel = ""

  onAwake(): void {
    if (
      !this.wristbandUI ||
      !this.palmMenuUI ||
      !this.suggestionUI ||
      !this.agendaUI ||
      !this.audioController ||
      !this.suggestionAnchor ||
      !this.agendaAnchor ||
      !this.handUiRoot
    ) {
      print("RehearsalBandMain: required @input not wired. Check Phase B bootstrap.")
      return
    }

    this.instantiateRoomProps()
    this.bindUiEvents()

    // Child UI ScriptComponents awake after this parent — defer first push to OnStart.
    this.createEvent("OnStartEvent").bind(() => {
      const first = this.state.openSuggestion()
      this.suggestionUI.showSuggestion(first.kind, first.text)
      this.pushAllUi()
      if (this.debugColliders) {
        this.setColliderDebugAll(this.getSceneObject(), true)
      }
    })

    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private instantiateRoomProps(): void {
    // Product content is the floating suggestion card + wall agenda at world anchors.
    // Stand-in furniture was only a placement cue and fights Interactive Preview's room.
    if (!this.showStandInRoomMeshes) {
      return
    }
    if (!this.tableSlot || !this.wallSlot) {
      print("RehearsalBandMain: showStandInRoomMeshes is on but tableSlot/wallSlot are unwired.")
      return
    }
    const table = tablePrefab.instantiate(this.tableSlot)
    table.name = "RehearsalTableVisual"
    table.getTransform().setLocalPosition(new vec3(0, 0, 0))

    const wall = wallPrefab.instantiate(this.wallSlot)
    wall.name = "AgendaWallVisual"
    wall.getTransform().setLocalPosition(new vec3(0, 0, 0))
  }

  private bindUiEvents(): void {
    this.createEvent("OnStartEvent").bind(() => {
      this.wristbandUI.onNext.add(() => this.handleNext())
      this.palmMenuUI.onRequestSuggestion.add(() => this.handleSuggestionFromPalm())
      this.palmMenuUI.onStartTimer.add(() => this.handleStartTimer())
      this.palmMenuUI.onResetTimer.add(() => this.handleResetTimer())
      this.suggestionUI.onChangeSuggestion.add(() => this.handleSuggestionFromTable())
    })
  }

  private onUpdate(): void {
    const dt = getDeltaTime()
    this.state.tick(dt)
    this.updateTimerLabel()
    this.updateHandFollowAndGating()
    this.updateAgendaLookGating()
  }

  private updateTimerLabel(): void {
    const label = this.state.formatTimer()
    if (label !== this.lastTimerLabel) {
      this.lastTimerLabel = label
      this.wristbandUI.setTimer(label)
    }
  }

  private updateHandFollowAndGating(): void {
    const hand = this.getTrackedHand()
    const camTransform = this.cameraProvider.getComponent().getTransform()
    const camPos = camTransform.getWorldPosition()
    const camFwd = camTransform.forward

    if (!hand || !hand.isTracked()) {
      this.handUiRoot.enabled = this.forceShowHandUI
      return
    }

    const wristPos = hand.wrist.position
    this.handUiRoot.getTransform().setWorldPosition(
      wristPos.add(this.wristbandOffset),
    )

    // Billboard hand UI toward camera
    const toCam = camPos.sub(this.handUiRoot.getTransform().getWorldPosition()).normalize()
    const yaw = Math.atan2(toCam.x, -toCam.z)
    this.handUiRoot.getTransform().setWorldRotation(quat.fromEulerAngles(0, yaw, 0))

    // Place palm menu slightly above wristband locally
    this.palmMenuUI.getSceneObject().getTransform().setLocalPosition(this.palmMenuOffset)
    this.wristbandUI.getSceneObject().getTransform().setLocalPosition(new vec3(0, 0, 0))

    const toHand = wristPos.sub(camPos).normalize()
    const lookingAtHand = camFwd.dot(toHand) >= this.lookDotThreshold
    this.handUiRoot.enabled = this.forceShowHandUI || lookingAtHand
  }

  private updateAgendaLookGating(): void {
    const camTransform = this.cameraProvider.getComponent().getTransform()
    const camPos = camTransform.getWorldPosition()
    const camFwd = camTransform.forward
    const agendaPos = this.agendaAnchor.getTransform().getWorldPosition()
    const toAgenda = agendaPos.sub(camPos).normalize()
    const lookingAtWall = camFwd.dot(toAgenda) >= this.lookDotThreshold
    this.agendaUI.getSceneObject().enabled = this.forceShowAgenda || lookingAtWall
  }

  private getTrackedHand(): any {
    const primary = this.preferRightHand ? "right" : "left"
    const fallback = this.preferRightHand ? "left" : "right"
    const first = this.handProvider.getHand(primary)
    if (first && first.isTracked()) {
      return first
    }
    const second = this.handProvider.getHand(fallback)
    if (second && second.isTracked()) {
      return second
    }
    return first
  }

  private handleNext(): void {
    this.audioController.playAdvance()
    this.state.advanceExercise()
    this.pushAllUi()
  }

  private handleStartTimer(): void {
    this.audioController.playClick()
    this.state.startTimer()
    this.updateTimerLabel()
  }

  private handleResetTimer(): void {
    this.audioController.playClick()
    this.state.resetTimer()
    this.updateTimerLabel()
  }

  private handleSuggestionFromPalm(): void {
    this.audioController.playSuggestion()
    const suggestion = this.state.isSuggestionVisible()
      ? this.state.nextSuggestion()
      : this.state.openSuggestion()
    this.suggestionUI.showSuggestion(suggestion.kind, suggestion.text)
  }

  private handleSuggestionFromTable(): void {
    this.audioController.playSuggestion()
    const suggestion = this.state.nextSuggestion()
    this.suggestionUI.showSuggestion(suggestion.kind, suggestion.text)
  }

  private pushAllUi(): void {
    const ex = this.state.getCurrentExercise()
    this.wristbandUI.setExercise(ex.block, ex.name)
    this.wristbandUI.setTimer(this.state.formatTimer())
    this.agendaUI.setCurrentIndex(this.state.getExerciseIndex())
    if (this.state.isSuggestionVisible()) {
      const s = this.state.getSuggestion()
      this.suggestionUI.showSuggestion(s.kind, s.text)
    }
  }

  private setColliderDebugAll(root: SceneObject, enabled: boolean): void {
    const collider = root.getComponent("Physics.ColliderComponent") as ColliderComponent
    if (collider) {
      collider.debugDrawEnabled = enabled
    }
    const body = root.getComponent("Physics.BodyComponent") as BodyComponent
    if (body) {
      body.debugDrawEnabled = enabled
    }
    const count = root.getChildrenCount()
    for (let i = 0; i < count; i++) {
      this.setColliderDebugAll(root.getChild(i), enabled)
    }
  }
}
