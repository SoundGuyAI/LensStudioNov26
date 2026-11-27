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
import {RehearsalBandLearnModeController} from "./RehearsalBandLearnModeController"
import {RehearsalBandPalmMenuUI} from "./RehearsalBandPalmMenuUI"
import {RehearsalBandState} from "./RehearsalBandState"
import {PlacementHit, RehearsalBandSurfacePlacer} from "./RehearsalBandSurfacePlacer"
import {RehearsalBandSuggestionUI} from "./RehearsalBandSuggestionUI"
import {RehearsalBandTutorialController} from "./RehearsalBandTutorialController"
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
  @hint("Host tutorial VO controller (Tutorial_01..12)")
  tutorialController!: RehearsalBandTutorialController

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

  @input
  @hint("Learn Mode shell controller")
  learnModeController!: RehearsalBandLearnModeController

  @input
  @hint("World anchor for the Learn Mode shell (picker + mode stubs)")
  learnModeAnchor!: SceneObject
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
  @hint("Offset of Learn Mode above the table/suggestion surface (cm). Y is world-up.")
  learnModeTableOffset: vec3 = new vec3(0, 24, 0)

  @input
  @hint("Camera fallback offset if no table/suggestion anchor (cm): forward, right, up")
  learnModeCameraFallbackOffset: vec3 = new vec3(70, -8, 8)

  @input
  @hint("When true, hand UI stays visible even if not looking at the hand")
  forceShowHandUI: boolean = true

  @input
  @hint("When true, wall agenda stays visible even if not looking at the wall")
  forceShowAgenda: boolean = true

  @input
  @hint("Spawn pretend wooden table/easel meshes. Leave OFF — use Interactive Preview room instead.")
  showStandInRoomMeshes: boolean = false

  @input
  @hint("Place table/wall/hand anchors in front of the live DeviceTracking camera (needed for Interactive Preview rooms)")
  placeAnchorsInFrontOfCamera: boolean = true

  @input
  @hint("Wireframe every collider for hit-zone diagnosis")
  debugColliders: boolean = false
  @ui.group_end

  private state = new RehearsalBandState()
  private handProvider = HandInputData.getInstance()
  private cameraProvider = WorldCameraFinderProvider.getInstance()
  private surfacePlacer = new RehearsalBandSurfacePlacer()
  private lastTimerLabel = ""
  private anchorPlaceFramesLeft = 0
  private tablePlacedByUser = false
  private wallPlacedByUser = false

  onAwake(): void {
    if (
      !this.wristbandUI ||
      !this.palmMenuUI ||
      !this.suggestionUI ||
      !this.agendaUI ||
      !this.audioController ||
      !this.tutorialController ||
      !this.suggestionAnchor ||
      !this.agendaAnchor ||
      !this.handUiRoot ||
      !this.learnModeController ||
      !this.learnModeAnchor
    ) {
      print("RehearsalBandMain: required @input not wired. Check Phase B bootstrap.")
      return
    }

    this.instantiateRoomProps()
    this.bindUiEvents()
    this.bindDemoHotkeys()

    // Child UI ScriptComponents awake after this parent — defer first push to OnStart.
    this.createEvent("OnStartEvent").bind(() => {
      // DeviceTracking needs a few frames to settle in Interactive Preview rooms.
      this.anchorPlaceFramesLeft = this.placeAnchorsInFrontOfCamera ? 12 : 0
      this.placeWorldAnchorsFromCamera()
      const first = this.state.openSuggestion()
      this.suggestionUI.showSuggestion(first.kind, first.text)
      this.pushAllUi()
      if (this.debugColliders) {
        this.setColliderDebugAll(this.getSceneObject(), true)
      }
    })

    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /**
   * Interactive Preview (Sunlit Room etc.) drives the Lens camera via DeviceTracking.
   * Authored scene-origin positions are often outside that tracked frustum — place
   * product UI relative to the live camera so panels appear in front of the user.
   */
  private placeWorldAnchorsFromCamera(): void {
    if (!this.placeAnchorsInFrontOfCamera) {
      return
    }
    const camTransform = this.cameraProvider.getComponent().getTransform()
    const camPos = camTransform.getWorldPosition()
    // Camera with identity rotation faces world -Z; Transform.forward is +Z.
    // Content in front of the user must use -forward (look direction).
    const look = camTransform.forward.uniformScale(-1)
    const right = camTransform.right
    const up = camTransform.up

    const faceCamera = (anchor: SceneObject, worldPos: vec3): void => {
      anchor.getTransform().setWorldPosition(worldPos)
      this.faceAnchorTowardCamera(anchor)
    }

    // Only auto-place anchors the user has not pinned yet.
    if (!this.tablePlacedByUser && this.surfacePlacer.getMode() !== "table") {
      faceCamera(
        this.suggestionAnchor,
        camPos.add(look.uniformScale(80)).add(up.uniformScale(-8)),
      )
    }
    if (!this.wallPlacedByUser && this.surfacePlacer.getMode() !== "wall") {
      faceCamera(
        this.agendaAnchor,
        camPos.add(look.uniformScale(100)).add(right.uniformScale(25)).add(up.uniformScale(5)),
      )
    }
    // Hand UI fallback when no tracked hand yet.
    faceCamera(
      this.handUiRoot,
      camPos.add(look.uniformScale(55)).add(right.uniformScale(12)).add(up.uniformScale(-10)),
    )
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
      this.palmMenuUI.onPlaceTable.add(() => this.beginTablePlacement())
      this.palmMenuUI.onPlaceWall.add(() => this.beginWallPlacement())
      this.palmMenuUI.onOpenInstructions.add(() => this.handleOpenInstructions())
      this.suggestionUI.onChangeSuggestion.add(() => this.handleSuggestionFromTable())
      // Close restores host UI only — never starts/stops the workshop timer.
      this.learnModeController.onClosed.add(() => {
        this.audioController.playClick()
        // Resume host onboarding VO if the tour was still in progress.
        this.tutorialController.resumeTutorial()
      })
    })
  }

  private onUpdate(): void {
    if (this.anchorPlaceFramesLeft > 0 && !this.surfacePlacer.isPlacing()) {
      this.anchorPlaceFramesLeft -= 1
      this.placeWorldAnchorsFromCamera()
    }
    this.surfacePlacer.update()
    const dt = getDeltaTime()
    this.state.tick(dt)
    this.updateTimerLabel()
    this.updateHandFollowAndGating()
    this.updateAgendaLookGating()
    this.updateLearnModePlacement()
  }

  private beginTablePlacement(): void {
    this.audioController.playClick()
    this.surfacePlacer.begin(
      "table",
      (_mode, hit) => {
        if (hit) {
          this.applySuggestionPlacement(hit, false)
        }
      },
      (_mode, hit) => {
        this.tablePlacedByUser = true
        this.applySuggestionPlacement(hit, true)
        this.audioController.playSuggestion()
        print("RehearsalBand: suggestion card placed on table surface")
      },
    )
  }

  private beginWallPlacement(): void {
    this.audioController.playClick()
    this.surfacePlacer.begin(
      "wall",
      (_mode, hit) => {
        if (hit) {
          this.applyAgendaPlacement(hit, false)
        }
      },
      (_mode, hit) => {
        this.wallPlacedByUser = true
        this.applyAgendaPlacement(hit, true)
        this.audioController.playAdvance()
        print("RehearsalBand: agenda placed on wall")
      },
    )
  }

  /** Preview demo aids (InjectPreviewGesture key One/Two/Three) — same paths without SIK Interact agent. */
  private bindDemoHotkeys(): void {
    this.createEvent("KeyPressEvent").bind((e: KeyPressEvent) => {
      if (e.key === Keys.One) {
        this.demoPlaceSuggestionOnTable()
      } else if (e.key === Keys.Two) {
        this.demoPlaceAgendaOnWall()
      } else if (e.key === Keys.Three) {
        // Package E — open Learn Mode Aim Practice without pinching Instructions.
        this.handleOpenInstructions()
        this.learnModeController.setMode("handAim")
        print("RehearsalBand: demo hotkey Three → Learn Mode Aim Practice")
      } else if (e.key === Keys.Four || e.key === Keys.Five) {
        // Package E demo throws (A=Four, B=Five) — primary path is SIK aim + pinch.
        const handAim = this.learnModeController.getHandAim()
        if (handAim && this.learnModeController.getActiveMode() === "handAim") {
          handAim.demoAimAndThrow(e.key === Keys.Four ? 0 : 1)
        }
      }
    })
  }

  private demoPlaceSuggestionOnTable(): void {
    const cam = this.cameraProvider.getComponent().getTransform()
    const camPos = cam.getWorldPosition()
    const fwd = cam.forward
    const flat = new vec3(fwd.x, 0, fwd.z)
    const dir = flat.length > 0.01 ? flat.normalize() : new vec3(0, 0, -1)
    const hit: PlacementHit = {
      position: new vec3(camPos.x + dir.x * 90, camPos.y - 70, camPos.z + dir.z * 90),
      normal: vec3.up(),
    }
    this.audioController.playClick()
    this.tablePlacedByUser = true
    this.applySuggestionPlacement(hit, true)
    this.audioController.playSuggestion()
    print("RehearsalBand: suggestion card placed on table surface")
  }

  private demoPlaceAgendaOnWall(): void {
    const cam = this.cameraProvider.getComponent().getTransform()
    const camPos = cam.getWorldPosition()
    const fwd = cam.forward
    const flat = new vec3(fwd.x, 0, fwd.z)
    const dir = flat.length > 0.01 ? flat.normalize() : new vec3(0, 0, -1)
    const hit: PlacementHit = {
      position: new vec3(camPos.x + dir.x * 140, camPos.y - 10, camPos.z + dir.z * 140),
      normal: dir.uniformScale(-1),
    }
    this.audioController.playClick()
    this.wallPlacedByUser = true
    this.applyAgendaPlacement(hit, true)
    this.audioController.playAdvance()
    print("RehearsalBand: agenda placed on wall")
  }

  private applySuggestionPlacement(hit: PlacementHit, _final: boolean): void {
    // Lift slightly off the surface so the BackPlate doesn't z-fight.
    const pos = hit.position.add(hit.normal.uniformScale(3))
    this.suggestionAnchor.getTransform().setWorldPosition(pos)
    this.faceAnchorTowardCamera(this.suggestionAnchor)
    this.suggestionUI.getSceneObject().enabled = true
  }

  private applyAgendaPlacement(hit: PlacementHit, _final: boolean): void {
    const pos = hit.position.add(hit.normal.uniformScale(3))
    this.agendaAnchor.getTransform().setWorldPosition(pos)
    // Face into the room along the wall normal (BackPlate +Z toward user).
    const n = hit.normal.normalize()
    const yaw = Math.atan2(n.x, -n.z)
    this.agendaAnchor.getTransform().setWorldRotation(quat.fromEulerAngles(0, yaw, 0))
    this.agendaUI.getSceneObject().enabled = true
  }

  private faceAnchorTowardCamera(anchor: SceneObject): void {
    const camPos = this.cameraProvider.getComponent().getTransform().getWorldPosition()
    const worldPos = anchor.getTransform().getWorldPosition()
    const fromCam = worldPos.sub(camPos)
    if (fromCam.length > 0.01) {
      const n = fromCam.normalize()
      const yaw = Math.atan2(n.x, -n.z)
      anchor.getTransform().setWorldRotation(quat.fromEulerAngles(0, yaw, 0))
    }
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

    // Billboard hand UI so BackPlate +Z faces the camera
    const fromCam = this.handUiRoot.getTransform().getWorldPosition().sub(camPos)
    if (fromCam.length > 0.01) {
      const n = fromCam.normalize()
      const yaw = Math.atan2(n.x, -n.z)
      this.handUiRoot.getTransform().setWorldRotation(quat.fromEulerAngles(0, yaw, 0))
    }

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

  private handleOpenInstructions(): void {
    this.audioController.playClick()
    // Pause onboarding VO while Learn Mode is open so narrations do not stack.
    this.tutorialController.pauseTutorial()
    const exercise = this.state.getCurrentExercise()
    this.learnModeController.openForExercise(exercise)
    this.updateLearnModePlacement()
  }

  private updateLearnModePlacement(): void {
    if (!this.learnModeController.isOpen()) {
      return
    }

    // Prefer the table / suggestion surface so Instructions is not head-locked.
    // User Place Table moves suggestionAnchor; auto room place also puts it at table height.
    if (this.suggestionAnchor) {
      const tablePos = this.suggestionAnchor.getTransform().getWorldPosition()
      const pos = tablePos.add(
        new vec3(
          this.learnModeTableOffset.x,
          this.learnModeTableOffset.y,
          this.learnModeTableOffset.z,
        ),
      )
      this.learnModeAnchor.getTransform().setWorldPosition(pos)
      this.faceAnchorTowardCamera(this.learnModeAnchor)
      return
    }

    const camTransform = this.cameraProvider.getComponent().getTransform()
    const camPos = camTransform.getWorldPosition()
    const look = camTransform.forward.uniformScale(-1)
    const right = camTransform.right
    const up = camTransform.up
    const fallback = camPos
      .add(look.uniformScale(this.learnModeCameraFallbackOffset.x))
      .add(right.uniformScale(this.learnModeCameraFallbackOffset.y))
      .add(up.uniformScale(this.learnModeCameraFallbackOffset.z))
    this.learnModeAnchor.getTransform().setWorldPosition(fallback)
    this.faceAnchorTowardCamera(this.learnModeAnchor)
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
