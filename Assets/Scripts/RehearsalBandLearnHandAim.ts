/**
 * RehearsalBandLearnHandAim — Phase 2 aim practice at mock people (Package E).
 *
 * Owns: two room-scale mock targets, SIK aim-ray selection, Zip→Zap→Zop throw cycle,
 * spatial pass arrows toward the aimed target.
 *
 * Must not: real participant / face tracking, VO, rewrite teleprompter / video / Demo3D.
 *
 * Feel: UNPROVEN on Specs device. Logic path is Interactive Preview–friendly via SIK
 * targeting interactors (MouseInteractor click/release ≈ pinch throw).
 *
 * Canonical pass intent (eye contact + clear aim):
 * - https://allimprov.com/learn/games/zip-zap-zop/
 * - https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop
 * - https://www.vastage.org/blog/edu-zip-zap-zop
 */

import {SIK} from "SpectaclesInteractionKit.lspkg/SIK"
import {InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import type {Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {
  buildActorMesh,
  buildEnergyBall,
  buildPassArrow,
  Rgba,
} from "../LearnGames/ZipZapZop/Demo3D/DemoMeshBuilders"

const WORDS = ["Zip", "Zap", "Zop"] as const

const TARGET_COLORS: Rgba[] = [
  [0.28, 0.72, 0.78, 1], // teal
  [0.95, 0.55, 0.28, 1], // amber
]

const AIMED_COLOR: Rgba = [0.45, 0.95, 0.55, 1]
const BALL_COLOR: Rgba = [1.0, 0.88, 0.25, 1]
const ARROW_COLOR: Rgba = [1.0, 0.55, 0.15, 1]

@component
export class RehearsalBandLearnHandAim extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnHandAim – Phase 2 aim practice (feel unproven)</span>')
  @ui.separator

  @ui.group_start("Assets")
  @input
  @hint("vertexBaseColorMaterial (SimpleVertexBaseColor.lspkg)")
  material!: Material
  @ui.group_end

  @ui.group_start("Layout (cm)")
  @input
  @widget(new SliderWidget(60, 140, 1))
  @hint("Mock person height")
  actorHeightCm: number = 100

  @input
  @widget(new SliderWidget(100, 220, 5))
  @hint("Distance in front of camera for targets")
  forwardDistanceCm: number = 150

  @input
  @widget(new SliderWidget(40, 120, 5))
  @hint("Half-separation left/right from look axis")
  sideSeparationCm: number = 70

  @input
  @widget(new SliderWidget(0.3, 1.0, 0.05))
  @hint("Aim cone: min forward·toTarget for a hit (higher = stricter)")
  aimDotThreshold: number = 0.82
  @ui.group_end

  @ui.group_start("Throw")
  @input
  @widget(new SliderWidget(0.2, 1.2, 0.05))
  flySeconds: number = 0.45

  @input
  @hint("Ignore first frames after enable so menu pinch does not throw")
  ignoreTriggerFrames: number = 10
  @ui.group_end

  private cameraProvider = WorldCameraFinderProvider.getInstance()
  private root: SceneObject | null = null
  private targets: SceneObject[] = []
  private targetCenters: vec3[] = []
  private ball: SceneObject | null = null
  private arrow: SceneObject | null = null
  private arrowLengthCm = 28
  private cueText: Text | null = null
  private cueRoot: SceneObject | null = null
  private hitRings: SceneObject[] = []

  private built = false
  private active = false
  private wordIndex = 0
  private aimedIndex = -1
  private ignoreFramesLeft = 0
  private wasTriggering = false

  private flying = false
  private flyT = 0
  private flyFrom = vec3.zero()
  private flyTo = vec3.zero()
  private flyTargetIndex = -1
  private cyclesCompleted = 0
  /** Re-place targets for a few frames while DeviceTracking settles. */
  private placeFramesLeft = 0

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      this.ensureBuilt()
      if (!this.getSceneObject().enabled) {
        this.setPracticeVisible(false)
      }
    })
    // Start/stop is owned by LearnModeController.setMode (avoids OnEnable race + double-start).
    this.createEvent("OnDisableEvent").bind(() => this.stopPractice())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /** Demo aid — aim at mock target and throw the next Zip/Zap/Zop word. */
  demoAimAndThrow(targetIndex: number): void {
    if (!this.active || this.flying || targetIndex < 0 || targetIndex > 1) {
      return
    }
    if (this.targetCenters.length < 2) {
      try {
        this.placeTargetsFromCamera()
      } catch (e) {
        print("RehearsalBandLearnHandAim: demo place failed — " + e)
        return
      }
    }
    this.setAimed(targetIndex)
    this.beginThrow(targetIndex)
  }

  private ensureBuilt(): void {
    if (this.built) {
      return
    }
    if (!this.material) {
      print("RehearsalBandLearnHandAim: material not wired — assign vertexBaseColorMaterial")
      return
    }

    this.root = global.scene.createSceneObject("ZipZapZopHandAimRoot")
    this.root.setParent(null)

    for (let i = 0; i < 2; i++) {
      const actor = buildActorMesh(this.material, TARGET_COLORS[i], this.actorHeightCm)
      actor.name = i === 0 ? "MockTarget_A" : "MockTarget_B"
      actor.setParent(this.root)
      this.targets.push(actor)

      const ring = buildEnergyBall(this.material, AIMED_COLOR, 4.5)
      ring.name = `AimRing_${i}`
      ring.setParent(this.root)
      ring.enabled = false
      this.hitRings.push(ring)
    }

    this.ball = buildEnergyBall(this.material, BALL_COLOR, 3.2)
    this.ball.name = "HandAimEnergyBall"
    this.ball.setParent(this.root)
    this.ball.enabled = false

    this.arrow = buildPassArrow(this.material, ARROW_COLOR, this.arrowLengthCm)
    this.arrow.name = "HandAimPassArrow"
    this.arrow.setParent(this.root)
    this.arrow.enabled = false

    this.cueRoot = global.scene.createSceneObject("HandAimCue")
    this.cueRoot.setParent(this.root)
    this.cueText = this.cueRoot.createComponent("Component.Text") as Text
    this.cueText.text = "Aim · Zip"
    this.cueText.size = 56
    this.cueText.depthTest = true
    this.cueText.horizontalAlignment = HorizontalAlignment.Center
    this.cueText.verticalAlignment = VerticalAlignment.Center
    this.cueText.horizontalOverflow = HorizontalOverflow.Overflow
    this.cueText.verticalOverflow = VerticalOverflow.Overflow
    this.cueText.layoutRect = Rect.create(-18, 18, -3, 3)

    this.built = true
    print(
      "RehearsalBandLearnHandAim: built (feel UNPROVEN on device; preview uses SIK aim + pinch/click)",
    )
  }

  /** Called from LearnModeController.setMode — do not rely on OnEnable alone (parent-enable race). */
  startPractice(): void {
    if (this.active) {
      return
    }
    this.ensureBuilt()
    if (!this.built || !this.root) {
      print("RehearsalBandLearnHandAim: startPractice aborted — not built")
      return
    }
    this.active = true
    this.wordIndex = 0
    this.aimedIndex = -1
    this.flying = false
    this.ignoreFramesLeft = this.ignoreTriggerFrames
    this.wasTriggering = false
    this.placeFramesLeft = 12
    this.setPracticeVisible(true)
    try {
      this.placeTargetsFromCamera()
    } catch (e) {
      print("RehearsalBandLearnHandAim: placeTargets failed — " + e)
    }
    this.refreshCue()
    print(
      "RehearsalBandLearnHandAim: practice ON — aim + pinch/click to throw Zip→Zap→Zop",
    )
  }

  stopPractice(): void {
    if (!this.active && this.placeFramesLeft === 0) {
      this.setPracticeVisible(false)
      return
    }
    this.active = false
    this.flying = false
    this.aimedIndex = -1
    this.placeFramesLeft = 0
    this.setPracticeVisible(false)
  }

  private setPracticeVisible(visible: boolean): void {
    if (this.root) {
      this.root.enabled = visible
    }
  }

  /**
   * Place two mock people in the room ahead of the host (camera look).
   * World-parented so Learn Mode table shell motion does not drag them.
   */
  private placeTargetsFromCamera(): void {
    if (!this.root || this.targets.length < 2) {
      return
    }
    const camComp = this.cameraProvider.getComponent()
    if (!camComp) {
      print("RehearsalBandLearnHandAim: no world camera — using scene-origin fallback placement")
      this.placeTargetsFallback()
      return
    }
    const cam = camComp.getTransform()
    const camPos = cam.getWorldPosition()
    // DeviceTracking may report (0,0,0) for a few frames in Interactive Preview.
    const look = cam.forward.uniformScale(-1)
    const right = cam.right
    const flatLook = new vec3(look.x, 0, look.z)
    const lookXZ = flatLook.length > 0.01 ? flatLook.normalize() : new vec3(0, 0, -1)
    const flatRight = new vec3(right.x, 0, right.z)
    const rightXZ = flatRight.length > 0.01 ? flatRight.normalize() : new vec3(1, 0, 0)

    // Feet near floor relative to standing host eye height (~160cm).
    const floorY = camPos.y - 155
    const base = new vec3(camPos.x, floorY, camPos.z).add(lookXZ.uniformScale(this.forwardDistanceCm))

    const offsets = [-this.sideSeparationCm, this.sideSeparationCm]
    this.targetCenters = []
    for (let i = 0; i < 2; i++) {
      const feet = base.add(rightXZ.uniformScale(offsets[i]))
      this.targets[i].getTransform().setWorldPosition(feet)
      // Face the host
      const toHost = new vec3(camPos.x - feet.x, 0, camPos.z - feet.z)
      if (toHost.length > 0.01) {
        this.targets[i].getTransform().setWorldRotation(quat.lookAt(toHost.normalize(), vec3.up()))
      }
      const center = feet.add(new vec3(0, this.actorHeightCm * 0.55, 0))
      this.targetCenters.push(center)
      this.hitRings[i].getTransform().setWorldPosition(center)
    }

    // Glanceable cue slightly above eye, forward
    if (this.cueRoot) {
      const cuePos = camPos.add(look.uniformScale(55)).add(new vec3(0, 8, 0))
      this.cueRoot.getTransform().setWorldPosition(cuePos)
      this.cueRoot.getTransform().setWorldRotation(quat.lookAt(look.uniformScale(-1), vec3.up()))
    }
    if (this.placeFramesLeft <= 1) {
      print(
        `RehearsalBandLearnHandAim: placed mock targets at floorY=${floorY.toFixed(0)} forward=${this.forwardDistanceCm}`,
      )
    }
  }

  /** Stable placement if camera transform is unavailable. */
  private placeTargetsFallback(): void {
    const floorY = -10
    const baseZ = -this.forwardDistanceCm
    const offsets = [-this.sideSeparationCm, this.sideSeparationCm]
    this.targetCenters = []
    for (let i = 0; i < 2; i++) {
      const feet = new vec3(offsets[i], floorY, baseZ)
      this.targets[i].getTransform().setWorldPosition(feet)
      this.targets[i].getTransform().setWorldRotation(quat.lookAt(new vec3(0, 0, 1), vec3.up()))
      const center = feet.add(new vec3(0, this.actorHeightCm * 0.55, 0))
      this.targetCenters.push(center)
      this.hitRings[i].getTransform().setWorldPosition(center)
    }
    if (this.cueRoot) {
      this.cueRoot.getTransform().setWorldPosition(new vec3(0, 40, -40))
    }
  }

  private onUpdate(): void {
    if (!this.active || !this.built) {
      return
    }
    if (this.placeFramesLeft > 0) {
      this.placeFramesLeft -= 1
      try {
        this.placeTargetsFromCamera()
      } catch (_e) {
        // keep trying while DeviceTracking settles
      }
    }
    if (this.ignoreFramesLeft > 0) {
      this.ignoreFramesLeft -= 1
    }

    if (this.flying) {
      this.updateFlight()
      return
    }

    this.updateAim()
    this.updateArrowTowardAimed()
    this.tryThrowOnRelease()
  }

  private updateAim(): void {
    const interactor = this.getInteractor()
    if (!interactor || !interactor.startPoint || !interactor.endPoint) {
      this.setAimed(-1)
      return
    }
    const start = interactor.startPoint
    const end = interactor.endPoint
    const delta = end.sub(start)
    if (delta.length < 0.01) {
      this.setAimed(-1)
      return
    }
    const dir = delta.normalize()

    let best = -1
    let bestScore = this.aimDotThreshold
    for (let i = 0; i < this.targetCenters.length; i++) {
      const toTarget = this.targetCenters[i].sub(start)
      const dist = toTarget.length
      if (dist < 20 || dist > 400) {
        continue
      }
      const score = dir.dot(toTarget.normalize())
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    }
    this.setAimed(best)
  }

  private setAimed(index: number): void {
    if (this.aimedIndex === index) {
      return
    }
    this.aimedIndex = index
    for (let i = 0; i < this.hitRings.length; i++) {
      this.hitRings[i].enabled = i === index
    }
    this.refreshCue()
  }

  private updateArrowTowardAimed(): void {
    if (!this.arrow) {
      return
    }
    if (this.aimedIndex < 0) {
      this.arrow.enabled = false
      return
    }
    const interactor = this.getInteractor()
    const from =
      interactor && interactor.startPoint
        ? interactor.startPoint
        : this.cameraProvider.getComponent().getTransform().getWorldPosition()
    const to = this.targetCenters[this.aimedIndex]
    const dir = to.sub(from)
    if (dir.length < 0.01) {
      this.arrow.enabled = false
      return
    }
    const forward = dir.normalize()
    const mid = from.add(to).uniformScale(0.5).add(new vec3(0, 6, 0))
    const origin = mid.sub(forward.uniformScale(this.arrowLengthCm * 0.5))
    this.arrow.enabled = true
    this.arrow.getTransform().setWorldPosition(origin)
    this.arrow.getTransform().setWorldRotation(quat.lookAt(forward, vec3.up()))
  }

  private tryThrowOnRelease(): void {
    if (this.ignoreFramesLeft > 0) {
      return
    }
    const interactor = this.getInteractor()
    if (!interactor) {
      this.wasTriggering = false
      return
    }
    const triggering = interactor.currentTrigger !== InteractorTriggerType.None
    const released = this.wasTriggering && !triggering
    this.wasTriggering = triggering

    if (!released) {
      return
    }
    if (this.aimedIndex < 0) {
      print("RehearsalBandLearnHandAim: throw ignored — aim at a mock person first (clear aim + eye contact)")
      return
    }
    this.beginThrow(this.aimedIndex)
  }

  private beginThrow(targetIndex: number): void {
    if (!this.ball) {
      return
    }
    const word = WORDS[this.wordIndex]
    const interactor = this.getInteractor()
    this.flyFrom =
      interactor && interactor.startPoint
        ? interactor.startPoint
        : this.cameraProvider.getComponent().getTransform().getWorldPosition()
    this.flyTo = this.targetCenters[targetIndex]
    this.flyTargetIndex = targetIndex
    this.flyT = 0
    this.flying = true
    this.ball.enabled = true
    this.ball.getTransform().setWorldPosition(this.flyFrom)
    if (this.arrow) {
      this.arrow.enabled = true
      this.updateArrowTowardAimed()
    }
    print(`RehearsalBandLearnHandAim: throw ${word} → MockTarget_${targetIndex === 0 ? "A" : "B"}`)
  }

  private updateFlight(): void {
    if (!this.ball) {
      return
    }
    this.flyT += getDeltaTime()
    const t = Math.min(1, this.flyT / this.flySeconds)
    const eased = t * t * (3 - 2 * t)
    const mid = this.flyFrom.add(this.flyTo).uniformScale(0.5).add(new vec3(0, 25, 0))
    const p = this.bezier2(this.flyFrom, mid, this.flyTo, eased)
    this.ball.getTransform().setWorldPosition(p)

    if (t >= 1) {
      this.flying = false
      this.ball.enabled = false
      this.onThrowLanded()
    }
  }

  private onThrowLanded(): void {
    const word = WORDS[this.wordIndex]
    print(`RehearsalBandLearnHandAim: ${word} received`)
    this.wordIndex += 1
    if (this.wordIndex >= WORDS.length) {
      this.cyclesCompleted += 1
      this.wordIndex = 0
      print(
        `RehearsalBandLearnHandAim: Zip→Zap→Zop cycle complete (#${this.cyclesCompleted}) — restart from Zip`,
      )
    }
    this.refreshCue()
  }

  private refreshCue(): void {
    if (!this.cueText) {
      return
    }
    const word = WORDS[this.wordIndex]
    if (this.aimedIndex >= 0) {
      const who = this.aimedIndex === 0 ? "A" : "B"
      this.cueText.text = `Aim ${who} · ${word}`
    } else {
      this.cueText.text = `Aim · ${word}`
    }
  }

  private bezier2(a: vec3, b: vec3, c: vec3, t: number): vec3 {
    const u = 1 - t
    return a
      .uniformScale(u * u)
      .add(b.uniformScale(2 * u * t))
      .add(c.uniformScale(t * t))
  }

  private getInteractor(): Interactor | null {
    const targeting = SIK.InteractionManager.getTargetingInteractors()
    if (targeting && targeting.length > 0) {
      return targeting[0]
    }
    return null
  }
}
