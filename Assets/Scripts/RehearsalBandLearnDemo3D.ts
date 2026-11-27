/**
 * RehearsalBandLearnDemo3D — table Zip Zap Zop 3D energy-pass demo.
 * Owns: mock actors, energy ball, pass arrows, Zip/Zap/Zop labels, loop choreography.
 * Must not: wall video, teleprompter copy, VO, or suggestion pool logic.
 *
 * Canonical cycle: Zip → Zap → Zop → Zip (energy never hits the floor).
 * Improwiki Zip Zap Zoop variant intentionally NOT used.
 */

import {RehearsalBandSuggestionUI} from "./RehearsalBandSuggestionUI"
import {
  buildActorMesh,
  buildEnergyBall,
  buildPassArrow,
  Rgba,
} from "../LearnGames/ZipZapZop/Demo3D/DemoMeshBuilders"

const WORDS = ["Zip", "Zap", "Zop"] as const

const ACTOR_COLORS: Rgba[] = [
  [0.92, 0.42, 0.38, 1], // A coral
  [0.28, 0.72, 0.78, 1], // B teal
  [0.95, 0.72, 0.28, 1], // C amber
]

const BALL_COLOR: Rgba = [1.0, 0.88, 0.25, 1]
const ARROW_COLOR: Rgba = [1.0, 0.55, 0.15, 1]

interface PassHop {
  from: number
  to: number
  word: string
}

const HOPS: PassHop[] = [
  {from: 0, to: 1, word: "Zip"},
  {from: 1, to: 2, word: "Zap"},
  {from: 2, to: 0, word: "Zop"},
]

@component
export class RehearsalBandLearnDemo3D extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnDemo3D – Zip Zap Zop 3D demo</span>')
  @ui.separator

  @ui.group_start("Assets")
  @input
  @hint("vertexBaseColorMaterial (SimpleVertexBaseColor.lspkg)")
  material!: Material

  @input
  @allowUndefined
  @hint("Optional: dim suggestion card while demo runs")
  suggestionUI?: RehearsalBandSuggestionUI
  @ui.group_end

  @ui.group_start("Layout")
  @input
  @widget(new SliderWidget(8, 15, 0.5))
  @hint("Mock actor height in cm")
  actorHeightCm: number = 12

  @input
  @widget(new SliderWidget(6, 14, 0.5))
  @hint("Triangle circle radius in cm")
  circleRadiusCm: number = 9

  @input
  @hint("Local Y lift above Demo3DUI / table")
  surfaceLiftCm: number = 1.5
  @ui.group_end

  @ui.group_start("Timing")
  @input
  @widget(new SliderWidget(0.25, 1.5, 0.05))
  holdSeconds: number = 0.45

  @input
  @widget(new SliderWidget(0.35, 1.8, 0.05))
  flySeconds: number = 0.75
  @ui.group_end

  private root: SceneObject | null = null
  private actors: SceneObject[] = []
  private actorPositions: vec3[] = []
  private ball: SceneObject | null = null
  private arrow: SceneObject | null = null
  private arrowLengthCm = 5
  private wordLabels: Text[] = []
  private labelRoots: SceneObject[] = []

  private built = false
  private running = false
  private hopIndex = 0
  private phase: "hold" | "fly" = "hold"
  private phaseT = 0

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      // Build once so first enable is cheap; keep hidden until demo mode.
      this.ensureBuilt()
      if (!this.getSceneObject().enabled) {
        this.setDemoVisible(false)
      }
    })
    this.createEvent("OnEnableEvent").bind(() => this.startDemo())
    this.createEvent("OnDisableEvent").bind(() => this.stopDemo())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private ensureBuilt(): void {
    if (this.built) {
      return
    }
    if (!this.material) {
      print("RehearsalBandLearnDemo3D: material not wired — assign vertexBaseColorMaterial")
      return
    }

    this.root = global.scene.createSceneObject("ZipZapZopDemoRoot")
    this.root.setParent(this.getSceneObject())
    this.root.getTransform().setLocalPosition(new vec3(0, this.surfaceLiftCm, 0))

    const r = this.circleRadiusCm
    // Equilateral triangle on XZ (table plane), Y up
    const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
    for (let i = 0; i < 3; i++) {
      const pos = new vec3(Math.cos(angles[i]) * r, 0, Math.sin(angles[i]) * r)
      this.actorPositions.push(pos)

      const actor = buildActorMesh(this.material, ACTOR_COLORS[i], this.actorHeightCm)
      actor.name = `Actor_${WORDS[i]}`
      actor.setParent(this.root)
      actor.getTransform().setLocalPosition(pos)
      // Face center of circle
      const inward = new vec3(-pos.x, 0, -pos.z).normalize()
      actor.getTransform().setLocalRotation(quat.lookAt(inward, vec3.up()))
      this.actors.push(actor)

      const labelSo = global.scene.createSceneObject(`Word_${WORDS[i]}`)
      labelSo.setParent(this.root)
      labelSo.getTransform().setLocalPosition(new vec3(pos.x, this.actorHeightCm + 1.8, pos.z))
      const text = labelSo.createComponent("Component.Text") as Text
      text.text = WORDS[i]
      text.size = 48
      text.depthTest = true
      text.horizontalAlignment = HorizontalAlignment.Center
      text.verticalAlignment = VerticalAlignment.Center
      text.horizontalOverflow = HorizontalOverflow.Overflow
      text.verticalOverflow = VerticalOverflow.Overflow
      text.layoutRect = Rect.create(-4, 4, -1.2, 1.2)
      labelSo.enabled = false
      this.wordLabels.push(text)
      this.labelRoots.push(labelSo)
    }

    this.ball = buildEnergyBall(this.material, BALL_COLOR, 0.85)
    this.ball.setParent(this.root)
    this.ball.getTransform().setLocalPosition(this.handPos(0))

    const chord = this.actorPositions[0].distance(this.actorPositions[1])
    this.arrowLengthCm = Math.max(4, chord * 0.55)
    this.arrow = buildPassArrow(this.material, ARROW_COLOR, this.arrowLengthCm)
    this.arrow.setParent(this.root)
    this.arrow.enabled = false

    this.built = true
    print("RehearsalBandLearnDemo3D: Zip Zap Zop demo built (A→B Zip, B→C Zap, C→A Zop)")
  }

  private handPos(actorIndex: number): vec3 {
    const p = this.actorPositions[actorIndex]
    return new vec3(p.x, this.actorHeightCm * 0.62, p.z)
  }

  private startDemo(): void {
    this.ensureBuilt()
    if (!this.built || !this.root) {
      return
    }
    this.running = true
    this.hopIndex = 0
    this.phase = "hold"
    this.phaseT = 0
    this.setDemoVisible(true)
    this.applyHoldVisuals()
    if (this.suggestionUI) {
      this.suggestionUI.setDimmed(true)
    }
    print("RehearsalBandLearnDemo3D: demo started")
  }

  private stopDemo(): void {
    this.running = false
    this.setDemoVisible(false)
    if (this.suggestionUI) {
      this.suggestionUI.setDimmed(false)
    }
  }

  private setDemoVisible(visible: boolean): void {
    if (this.root) {
      this.root.enabled = visible
    }
  }

  private onUpdate(): void {
    if (!this.running || !this.built || !this.ball || !this.arrow) {
      return
    }
    const dt = getDeltaTime()
    this.phaseT += dt

    if (this.phase === "hold") {
      if (this.phaseT >= this.holdSeconds) {
        this.phase = "fly"
        this.phaseT = 0
        this.arrow.enabled = true
        this.placeArrowForCurrentHop()
      }
      return
    }

    // fly
    const hop = HOPS[this.hopIndex]
    const t = Math.min(1, this.phaseT / this.flySeconds)
    const eased = t * t * (3 - 2 * t)
    const from = this.handPos(hop.from)
    const to = this.handPos(hop.to)
    const mid = from.add(to).uniformScale(0.5)
    const arc = mid.add(new vec3(0, 3.5, 0))
    // Quadratic Bezier
    const p = this.bezier2(from, arc, to, eased)
    this.ball.getTransform().setLocalPosition(p)

    if (t >= 1) {
      this.hopIndex = (this.hopIndex + 1) % HOPS.length
      this.phase = "hold"
      this.phaseT = 0
      this.arrow.enabled = false
      this.applyHoldVisuals()
    }
  }

  private bezier2(a: vec3, b: vec3, c: vec3, t: number): vec3 {
    const u = 1 - t
    return a
      .uniformScale(u * u)
      .add(b.uniformScale(2 * u * t))
      .add(c.uniformScale(t * t))
  }

  private applyHoldVisuals(): void {
    if (!this.ball) {
      return
    }
    const hop = HOPS[this.hopIndex]
    this.ball.getTransform().setLocalPosition(this.handPos(hop.from))
    for (let i = 0; i < this.labelRoots.length; i++) {
      const active = i === hop.from
      this.labelRoots[i].enabled = active
      if (active) {
        this.wordLabels[i].text = hop.word
      }
    }
  }

  private placeArrowForCurrentHop(): void {
    if (!this.arrow) {
      return
    }
    const hop = HOPS[this.hopIndex]
    const from = this.handPos(hop.from)
    const to = this.handPos(hop.to)
    const dir = to.sub(from)
    const len = dir.length
    if (len < 0.01) {
      return
    }
    const forward = dir.normalize()
    // Mesh spans local z=0..L; put visual center on the pass chord, slightly above.
    const mid = from.add(to).uniformScale(0.5).add(new vec3(0, 1.2, 0))
    const origin = mid.sub(forward.uniformScale(this.arrowLengthCm * 0.5))
    this.arrow.getTransform().setLocalPosition(origin)
    this.arrow.getTransform().setLocalRotation(quat.lookAt(forward, vec3.up()))
  }
}
