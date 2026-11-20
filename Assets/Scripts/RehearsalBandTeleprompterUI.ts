/**
 * RehearsalBandTeleprompterUI — host teach-script strip (Package B).
 * Owns: glanceable stacked cue lines for Teleprompter mode.
 * Must not: invent game rules/copy (loads from LearnGameContent via controller).
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
type TextRole = "Caption" | "Body" | "Cue"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Caption: {size: 38, weight: 500},
  Body: {size: 36, weight: 500},
  Cue: {size: 44, weight: 700},
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
  @widget(new SliderWidget(18, 40, 0.5))
  panelWidth: number = 32

  @input
  @widget(new SliderWidget(10, 36, 0.5))
  panelHeight: number = 22
  @ui.group_end

  private backPlate: BackPlate | null = null
  private linesRoot: SceneObject | null = null
  private linesFlex: FlexLayout | null = null
  private emptyHint: Text | null = null
  private lineTexts: Text[] = []

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
    flex.paddingTop = 0.8
    flex.paddingBottom = 0.8
    flex.paddingLeft = 1.0
    flex.paddingRight = 1.0

    this.addLabel(content, "Teleprompter", "Caption", 2.0)

    this.linesRoot = global.scene.createSceneObject("Lines")
    this.linesRoot.setParent(content)
    const linesItem = this.linesRoot.createComponent(FlexItem.getTypeName()) as FlexItem
    linesItem.flexGrow = 1
    linesItem.flexShrink = 1

    this.linesFlex = this.linesRoot.createComponent(FlexLayout.getTypeName()) as FlexLayout
    this.linesFlex.width = this.panelWidth - 2.0
    this.linesFlex.height = this.panelHeight - 4.0
    this.linesFlex.direction = FlexDirection.Column
    this.linesFlex.alignItems = FlexAlign.Stretch
    this.linesFlex.justifyContent = FlexJustify.Start
    this.linesFlex.rowGap = 0.25

    this.emptyHint = this.addLabel(this.linesRoot, "No cues for this game yet", "Body", 2.4)

    flex.onLayoutComplete.add((r) => {
      if (this.backPlate) {
        this.backPlate.size = new vec2(r.containerWidth, r.containerHeight)
      }
    })
  }

  /** Replace cue lines from a LearnGamePack (content-driven). */
  setLines(lines: string[]): void {
    this.clearLineLabels()
    if (!this.linesRoot || !this.linesFlex) {
      return
    }

    if (lines.length === 0) {
      if (this.emptyHint) {
        this.emptyHint.text = "No cues for this game yet"
        this.emptyHint.getSceneObject().enabled = true
      }
      return
    }

    if (this.emptyHint) {
      this.emptyHint.getSceneObject().enabled = false
    }

    for (let i = 0; i < lines.length; i++) {
      const cue = `${i + 1}. ${lines[i]}`
      const t = this.addLabel(this.linesRoot, cue, "Cue", 2.2)
      this.lineTexts.push(t)
    }
  }

  private clearLineLabels(): void {
    for (const t of this.lineTexts) {
      t.getSceneObject().destroy()
    }
    this.lineTexts = []
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
    const innerW = this.panelWidth - 2.0
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -height / 2, height / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    return t
  }
}
