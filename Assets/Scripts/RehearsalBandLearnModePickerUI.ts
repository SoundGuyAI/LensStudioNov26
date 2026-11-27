/**
 * RehearsalBandLearnModePickerUI — Learn Mode chrome: title, mode tabs, Close.
 * Owns: BackPlate picker surface; emits mode selection + close.
 * Must not: load teleprompter/video/3D content (Packages B–D).
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

export type LearnModeKind = "video" | "demo3d" | "teleprompter" | "handAim"

const imageMaterial = requireAsset("../Materials/ImageMaterial.mat") as Material
const closeIcon = requireAsset("../Icons/close.png") as Texture

const FONT_SIZE_SCALE = 1.0
type TextRole = "Headline2" | "Caption" | "Button"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Headline2: {size: 48, weight: 700},
  Caption: {size: 38, weight: 500},
  Button: {size: 36, weight: 500},
}

function roleSize(role: TextRole, distanceCm: number = 80): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 80): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandLearnModePickerUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnModePickerUI – Learn Mode chrome</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(20, 44, 0.5))
  @hint("Picker panel width in cm")
  panelWidth: number = 34

  @input
  @widget(new SliderWidget(10, 28, 0.5))
  @hint("Picker panel height in cm")
  panelHeight: number = 17
  @ui.group_end

  public onSelectVideo: Event<void> = new Event<void>()
  public onSelectDemo3d: Event<void> = new Event<void>()
  public onSelectTeleprompter: Event<void> = new Event<void>()
  public onSelectHandAim: Event<void> = new Event<void>()
  public onClose: Event<void> = new Event<void>()

  private titleText: Text | null = null
  private modeCaption: Text | null = null

  onAwake(): void {
    void imageMaterial

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
    flex.rowGap = 0.5
    flex.paddingTop = 0.7
    flex.paddingBottom = 0.7
    flex.paddingLeft = 0.8
    flex.paddingRight = 0.8

    this.titleText = this.addLabel(content, "Learn: —", "Headline2", 2.8)
    this.modeCaption = this.addLabel(content, "Mode: Teleprompter", "Caption", 2.0)
    this.addModeRow(content)
    this.addActionButton(content, "Close", closeIcon, () => this.onClose.invoke(), this.panelWidth - 1.6)

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })
  }

  setExerciseTitle(exerciseName: string): void {
    if (this.titleText) {
      this.titleText.text = `Learn: ${exerciseName}`
    }
  }

  setActiveMode(mode: LearnModeKind): void {
    if (!this.modeCaption) {
      return
    }
    const label =
      mode === "video"
        ? "Video"
        : mode === "demo3d"
          ? "3D Demo"
          : mode === "handAim"
            ? "Aim Practice"
            : "Teleprompter"
    this.modeCaption.text = `Mode: ${label}`
  }

  private addLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
    const so = global.scene.createSceneObject("Label")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, role, 80)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 1.6
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -height / 2, height / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    return t
  }

  private addModeRow(parent: SceneObject): void {
    const row = global.scene.createSceneObject("ModeRow")
    row.setParent(parent)
    const rowItem = row.createComponent(FlexItem.getTypeName()) as FlexItem
    rowItem.overrideHeight = 3.2

    const rowFlex = row.createComponent(FlexLayout.getTypeName()) as FlexLayout
    rowFlex.width = this.panelWidth - 1.6
    rowFlex.height = 3.2
    rowFlex.direction = FlexDirection.Row
    rowFlex.alignItems = FlexAlign.Stretch
    rowFlex.justifyContent = FlexJustify.SpaceBetween
    rowFlex.columnGap = 0.4

    const btnW = (this.panelWidth - 1.6 - 0.8) / 3
    this.addActionButton(row, "Video", null, () => this.onSelectVideo.invoke(), btnW)
    this.addActionButton(row, "3D Demo", null, () => this.onSelectDemo3d.invoke(), btnW)
    this.addActionButton(row, "Teleprompter", null, () => this.onSelectTeleprompter.invoke(), btnW)

    // Phase 2 (Package E) — second row keeps teach modes uncrowded.
    const practiceRow = global.scene.createSceneObject("PracticeRow")
    practiceRow.setParent(parent)
    const practiceItem = practiceRow.createComponent(FlexItem.getTypeName()) as FlexItem
    practiceItem.overrideHeight = 3.0
    this.addActionButton(
      practiceRow,
      "Aim Practice",
      null,
      () => this.onSelectHandAim.invoke(),
      this.panelWidth - 1.6,
    )
  }

  private addActionButton(
    parent: SceneObject,
    label: string,
    icon: Texture | null,
    onClick: () => void,
    width: number,
  ): void {
    const so = global.scene.createSceneObject(label)
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(width, 3.0, 1)
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    ec.text = label
    ec.textSize = roleSize("Button", 80)
    if (icon) {
      ec.leadingIcon = icon
      ec.iconLayout = "left"
      ec.leadingIconSize = 2.0
    }
    so.createComponent(FlexItem.getTypeName())
    this.createEvent("OnStartEvent").bind(() => {
      btn.onTriggerUp.add(onClick)
    })
  }
}
