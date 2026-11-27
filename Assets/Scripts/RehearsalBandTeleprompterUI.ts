/**
 * RehearsalBandTeleprompterUI — glanceable host teach-script strip.
 * Owns: BackPlate + stacked few-word lines from LearnGameContent.
 * Must not: invent game rules/copy (content pack owns that).
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
  Caption: {size: 36, weight: 500},
  Body: {size: 52, weight: 600},
}

function roleSize(role: TextRole, distanceCm: number = 80): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 80): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandTeleprompterUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandTeleprompterUI – host teach cues</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(18, 44, 0.5))
  panelWidth: number = 34

  @input
  @widget(new SliderWidget(10, 36, 0.5))
  panelHeight: number = 22
  @ui.group_end

  private backPlate: BackPlate | null = null
  private linesRoot: SceneObject | null = null
  private linesFlex: FlexLayout | null = null
  private lineTexts: Text[] = []
  private emptyHint: Text | null = null

  onAwake(): void {
    this.getSceneObject().createComponent("Component.Canvas")
    this.backPlate = this.getSceneObject().createComponent(BackPlate.getTypeName()) as BackPlate
    this.backPlate.size = new vec2(this.panelWidth, this.panelHeight)

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.getSceneObject())
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = this.panelWidth
    flex.height = this.panelHeight
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 0.35
    flex.paddingTop = 0.7
    flex.paddingBottom = 0.7
    flex.paddingLeft = 1.0
    flex.paddingRight = 1.0

    this.addStaticLabel(content, "Teleprompter", "Caption", 2.0)

    this.linesRoot = global.scene.createSceneObject("Lines")
    this.linesRoot.setParent(content)
    const linesItem = this.linesRoot.createComponent(FlexItem.getTypeName()) as FlexItem
    linesItem.overrideHeight = this.panelHeight - 4.0

    this.linesFlex = this.linesRoot.createComponent(FlexLayout.getTypeName()) as FlexLayout
    this.linesFlex.width = this.panelWidth - 2.0
    this.linesFlex.height = this.panelHeight - 4.0
    this.linesFlex.direction = FlexDirection.Column
    this.linesFlex.alignItems = FlexAlign.Stretch
    this.linesFlex.justifyContent = FlexJustify.SpaceEvenly
    this.linesFlex.rowGap = 0.25

    this.emptyHint = this.addLineLabel(this.linesRoot, "No cues for this game yet", "Caption", 2.2)
    this.emptyHint.getSceneObject().enabled = false

    flex.onLayoutComplete.add((r) => {
      if (this.backPlate) {
        this.backPlate.size = new vec2(r.containerWidth, r.containerHeight)
      }
    })
  }

  /** Replace cue lines from a LearnGamePack (or clear when empty). */
  setLines(lines: string[]): void {
    this.clearDynamicLines()

    if (!this.linesRoot || !this.linesFlex) {
      return
    }

    if (lines.length === 0) {
      if (this.emptyHint) {
        this.emptyHint.getSceneObject().enabled = true
        this.emptyHint.text = "No cues for this game yet"
      }
      return
    }

    if (this.emptyHint) {
      this.emptyHint.getSceneObject().enabled = false
    }

    const rowH = Math.min(2.6, Math.max(1.8, (this.panelHeight - 5.0) / Math.max(lines.length, 1)))
    for (const line of lines) {
      const t = this.addLineLabel(this.linesRoot, line, "Body", rowH)
      this.lineTexts.push(t)
    }
  }

  private clearDynamicLines(): void {
    for (const t of this.lineTexts) {
      t.getSceneObject().destroy()
    }
    this.lineTexts = []
  }

  private addStaticLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
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

  private addLineLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
    const so = global.scene.createSceneObject("Line")
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
