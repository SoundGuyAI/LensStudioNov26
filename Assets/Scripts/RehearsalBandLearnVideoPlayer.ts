/**
 * RehearsalBandLearnVideoPlayer — Zip Zap Zop motion explainer (Package C).
 * Owns: frame-sequence billboard loop for Learn Mode Video.
 * Must not: author teleprompter copy, Demo3D, VO, or workshop timings.
 */

@component
export class RehearsalBandLearnVideoPlayer extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnVideoPlayer – Zip Zap Zop explainer</span>')
  @ui.separator

  @ui.group_start("Media")
  @input
  @hint("Storyboard frames in cycle order (Zip → Zap → Zop…)")
  @allowUndefined
  frames: Texture[] = []

  @input
  @hint("Plane mesh for the explainer billboard")
  @allowUndefined
  planeMesh!: RenderMesh

  @input
  @hint("Image/Unlit material with baseTex (cloned at runtime)")
  @allowUndefined
  frameMaterial!: Material
  @ui.group_end

  @ui.group_start("Layout")
  @input
  @widget(new SliderWidget(40, 100, 1))
  @hint("Billboard width in cm")
  panelWidth: number = 72

  @input
  @widget(new SliderWidget(24, 60, 1))
  @hint("Billboard height in cm")
  panelHeight: number = 42

  @input
  @widget(new SliderWidget(80, 220, 5))
  @hint("Local −Z offset toward front/wall (cm). BackPlate +Z faces user.")
  forwardOffsetCm: number = 150

  @input
  @widget(new SliderWidget(-20, 40, 1))
  @hint("Local Y lift above table shell content (cm)")
  verticalOffsetCm: number = 12

  @input
  @widget(new SliderWidget(0.4, 3.0, 0.1))
  @hint("Seconds per storyboard frame")
  secondsPerFrame: number = 1.4
  @ui.group_end

  private frameVisual: RenderMeshVisual | null = null
  private runtimeMaterial: Material | null = null
  private frameRoot: SceneObject | null = null
  private captionText: Text | null = null
  private playing = false
  private frameIndex = 0
  private elapsedInFrame = 0
  private updateEvent: SceneEvent | null = null

  onAwake(): void {
    this.applyForwardPlacement()
    this.buildBillboard()
    this.createEvent("OnEnableEvent").bind(() => this.startLoop())
    this.createEvent("OnDisableEvent").bind(() => this.stopLoop())
    this.createEvent("OnStartEvent").bind(() => {
      // If already enabled when start fires (first video open), kick the loop.
      if (this.getSceneObject().enabled) {
        this.startLoop()
      } else {
        this.stopLoop()
      }
    })
  }

  private applyForwardPlacement(): void {
    // Learn Mode shell sits on the table facing the user (+Z toward user).
    // Push the video plane toward the front/wall along local −Z.
    this.getSceneObject()
      .getTransform()
      .setLocalPosition(new vec3(0, this.verticalOffsetCm, -this.forwardOffsetCm))
  }

  private buildBillboard(): void {
    if (!this.planeMesh || !this.frameMaterial) {
      print("RehearsalBandLearnVideoPlayer: planeMesh / frameMaterial not wired")
      return
    }

    const root = global.scene.createSceneObject("ZipZapZopExplainer")
    root.setParent(this.getSceneObject())
    root.getTransform().setLocalPosition(new vec3(0, 0, 0))
    // PlaneMeshPreset is XZ (normal +Y). Pitch −90° stands it as a billboard; roll 180°
    // keeps texture V upright when viewed from the Learn Mode +Z (user) side.
    root.getTransform().setLocalRotation(quat.fromEulerAngles(-Math.PI / 2, 0, Math.PI))
    root.getTransform().setLocalScale(new vec3(this.panelWidth, 1, this.panelHeight))
    this.frameRoot = root

    const visual = root.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    visual.mesh = this.planeMesh
    this.runtimeMaterial = this.frameMaterial.clone()
    visual.clearMaterials()
    visual.addMaterial(this.runtimeMaterial)
    visual.renderOrder = 900
    this.frameVisual = visual

    if (this.runtimeMaterial.mainPass) {
      this.runtimeMaterial.mainPass.twoSided = true
      this.runtimeMaterial.mainPass.depthTest = true
      this.runtimeMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1)
    }

    this.showFrame(0)

    const captionSo = global.scene.createSceneObject("ExplainerCaption")
    captionSo.setParent(this.getSceneObject())
    captionSo.getTransform().setLocalPosition(new vec3(0, -(this.panelHeight * 0.5 + 4), 0.5))
    const caption = captionSo.createComponent("Component.Text") as Text
    caption.text = "Zip → Zap → Zop"
    caption.size = 28
    caption.depthTest = true
    caption.horizontalAlignment = HorizontalAlignment.Center
    caption.verticalAlignment = VerticalAlignment.Center
    caption.horizontalOverflow = HorizontalOverflow.Overflow
    caption.verticalOverflow = VerticalOverflow.Overflow
    caption.textFill.color = new vec4(1.0, 0.95, 0.35, 1.0)
    caption.layoutRect = Rect.create(-this.panelWidth * 0.5, this.panelWidth * 0.5, -2, 2)
    this.captionText = caption
  }

  private startLoop(): void {
    if (!this.frameVisual || !this.frames || this.frames.length === 0) {
      return
    }
    this.playing = true
    this.elapsedInFrame = 0
    this.showFrame(this.frameIndex)
    if (this.frameRoot) {
      this.frameRoot.enabled = true
    }
    if (this.captionText) {
      this.captionText.getSceneObject().enabled = true
    }
    if (!this.updateEvent) {
      this.updateEvent = this.createEvent("UpdateEvent")
      this.updateEvent.bind(() => this.onUpdate())
    }
    this.updateEvent.enabled = true
    print("RehearsalBandLearnVideoPlayer: explainer loop playing")
  }

  private stopLoop(): void {
    this.playing = false
    if (this.updateEvent) {
      this.updateEvent.enabled = false
    }
    if (this.frameRoot) {
      this.frameRoot.enabled = false
    }
    if (this.captionText) {
      this.captionText.getSceneObject().enabled = false
    }
  }

  private onUpdate(): void {
    if (!this.playing || !this.frames || this.frames.length === 0) {
      return
    }
    this.elapsedInFrame += getDeltaTime()
    if (this.elapsedInFrame < this.secondsPerFrame) {
      return
    }
    this.elapsedInFrame = 0
    this.frameIndex = (this.frameIndex + 1) % this.frames.length
    this.showFrame(this.frameIndex)
  }

  private showFrame(index: number): void {
    if (!this.runtimeMaterial || !this.frames || this.frames.length === 0) {
      return
    }
    const tex = this.frames[Math.max(0, Math.min(index, this.frames.length - 1))]
    if (!tex) {
      return
    }
    this.runtimeMaterial.mainPass.baseTex = tex
    if (this.captionText) {
      const labels = ["Circle up", "ZIP", "ZAP", "ZOP", "Eye contact"]
      this.captionText.text =
        index < labels.length ? `${labels[index]}  ·  Zip → Zap → Zop` : "Zip → Zap → Zop"
    }
  }
}
