/**
 * RehearsalBandWristbandUI — glanceable wristband: exercise name, timer, Next.
 * Owns: BackPlate + FlexLayout HUD for hand glance; emits onNext.
 * Must not: hold workshop state or decide advances.
 */

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

const imageMaterial = requireAsset("../Materials/ImageMaterial.mat") as Material
const nextIcon = requireAsset("../Icons/skip_next.png") as Texture

const FONT_SIZE_SCALE = 1.0
type TextRole = "Headline1" | "Headline2" | "Button" | "Caption"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Headline1: {size: 54, weight: 700},
  Headline2: {size: 48, weight: 700},
  Button: {size: 39, weight: 500},
  Caption: {size: 38, weight: 500},
}

function roleSize(role: TextRole, distanceCm: number = 55): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 55): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandWristbandUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandWristbandUI – glanceable band</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(12, 28, 0.5))
  @hint("Wristband panel width in cm")
  panelWidth: number = 18

  @input
  @widget(new SliderWidget(6, 16, 0.5))
  @hint("Wristband panel height in cm")
  panelHeight: number = 10

  @input
  @hint("Default exercise label for sizing")
  defaultExerciseName: string = "Relationship Swap"

  @input
  @hint("Default timer label")
  defaultTimerText: string = "8:00"
  @ui.group_end

  public onNext: Event<void> = new Event<void>()

  private nameText: Text | null = null
  private timerText: Text | null = null
  private blockText: Text | null = null

  onAwake(): void {
    this.getSceneObject().createComponent("Component.Canvas")
    const backPlate = this.getSceneObject().createComponent(BackPlate.getTypeName()) as BackPlate
    backPlate.size = new vec2(this.panelWidth, this.panelHeight)

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.getSceneObject())
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = this.panelWidth
    flex.height = this.panelHeight
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.SpaceBetween
    flex.rowGap = 0.6
    flex.paddingTop = 0.8
    flex.paddingBottom = 0.8
    flex.paddingLeft = 1.0
    flex.paddingRight = 1.0

    this.blockText = this.addLabel(content, "Warm-up", "Caption", 2.0)
    this.nameText = this.addLabel(content, this.defaultExerciseName, "Headline1", 3.2)
    this.timerText = this.addLabel(content, this.defaultTimerText, "Headline2", 2.8)
    this.addNextButton(content)

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })
  }

  setExercise(block: string, name: string): void {
    if (this.blockText) {
      this.blockText.text = block
    }
    if (this.nameText) {
      this.nameText.text = name
    }
  }

  setTimer(text: string): void {
    if (this.timerText) {
      this.timerText.text = text
    }
  }

  private addLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
    const so = global.scene.createSceneObject("Label")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, role, 55)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 2.0
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -height / 2, height / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    return t
  }

  private addNextButton(parent: SceneObject): void {
    const so = global.scene.createSceneObject("Next")
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(this.panelWidth - 2.0, 3.2, 1)
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    ec.text = "Next"
    ec.textSize = roleSize("Button", 55)
    ec.leadingIcon = nextIcon
    ec.iconLayout = "left"
    ec.leadingIconSize = 2.2
    // Ensure ImageMaterial path exists for icon rendering path used by ElementContent
    if (imageMaterial) {
      // referenced so bootstrap includes ImageMaterial
    }
    so.createComponent(FlexItem.getTypeName())
    this.createEvent("OnStartEvent").bind(() => {
      btn.onTriggerUp.add(() => {
        this.onNext.invoke()
      })
    })
  }
}
