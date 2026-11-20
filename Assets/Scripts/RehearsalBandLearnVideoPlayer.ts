/**
 * RehearsalBandLearnVideoPlayer — wall/plane motion explainer (Package C fills media).
 * Owns: placeholder BackPlate panel for Video mode.
 * Must not: author video assets or storyboard (Package C).
 */

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"

const FONT_SIZE_SCALE = 1.0
type TextRole = "Caption" | "Body"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Caption: {size: 38, weight: 500},
  Body: {size: 42, weight: 500},
}

function roleSize(role: TextRole, distanceCm: number = 80): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 80): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandLearnVideoPlayer extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandLearnVideoPlayer – stub (Package C)</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(18, 40, 0.5))
  panelWidth: number = 32

  @input
  @widget(new SliderWidget(8, 24, 0.5))
  panelHeight: number = 12
  @ui.group_end

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
    flex.justifyContent = FlexJustify.Center
    flex.rowGap = 0.4
    flex.paddingTop = 0.8
    flex.paddingBottom = 0.8
    flex.paddingLeft = 1.0
    flex.paddingRight = 1.0

    this.addLabel(content, "Video", "Caption", 2.2)
    this.addLabel(content, "[Package C — explainer TBD]", "Body", 3.0)

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })
  }

  private addLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
    const so = global.scene.createSceneObject("Label")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, role, 80)
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 2.0
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -height / 2, height / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    return t
  }
}
