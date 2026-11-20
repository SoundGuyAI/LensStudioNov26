/**
 * RehearsalBandAgendaUI — wall agenda panel with current-exercise marker.
 * Owns: BackPlate agenda list; updates marker via setCurrentIndex.
 * Must not: advance the session.
 */

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Exercise, WORKSHOP_PLAN} from "./RehearsalBandState"

const FONT_SIZE_SCALE = 1.0
type TextRole = "Title2" | "Headline2" | "Body" | "Caption"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Title2: {size: 93, weight: 700},
  Headline2: {size: 48, weight: 700},
  Body: {size: 39, weight: 500},
  Caption: {size: 38, weight: 500},
}

function roleSize(role: TextRole, distanceCm: number = 180): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 180): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandAgendaUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandAgendaUI – wall agenda</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(50, 90, 1))
  @hint("Agenda panel width in cm")
  panelWidth: number = 70

  @input
  @widget(new SliderWidget(35, 70, 1))
  @hint("Agenda panel height in cm")
  panelHeight: number = 48

  @input
  @hint("Title shown at top of the agenda")
  titleLabel: string = "Workshop Agenda"
  @ui.group_end

  private rowTexts: Text[] = []
  private currentIndex = 0

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
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 0.7
    flex.paddingTop = 1.6
    flex.paddingBottom = 1.6
    flex.paddingLeft = 2.0
    flex.paddingRight = 2.0

    this.addTitle(content, this.titleLabel)

    for (let i = 0; i < WORKSHOP_PLAN.length; i++) {
      const row = this.addExerciseRow(content, WORKSHOP_PLAN[i], i)
      this.rowTexts.push(row)
    }

    this.refreshMarkers()

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(Math.max(r.containerWidth, this.panelWidth), r.containerHeight)
    })
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, WORKSHOP_PLAN.length - 1))
    this.refreshMarkers()
  }

  private addTitle(parent: SceneObject, label: string): void {
    const so = global.scene.createSceneObject("Title")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, "Title2", 180)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 4.0
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -2.5, 2.5)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = 5.0
  }

  private addExerciseRow(parent: SceneObject, exercise: Exercise, index: number): Text {
    const so = global.scene.createSceneObject(`Exercise_${index}`)
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = this.formatRow(exercise, false)
    t.depthTest = true
    applyTextRole(t, "Body", 180)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 4.0
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -1.8, 1.8)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = 3.6
    return t
  }

  private refreshMarkers(): void {
    for (let i = 0; i < this.rowTexts.length; i++) {
      const ex = WORKSHOP_PLAN[i]
      const isCurrent = i === this.currentIndex
      this.rowTexts[i].text = this.formatRow(ex, isCurrent)
      applyTextRole(this.rowTexts[i], isCurrent ? "Headline2" : "Body", 180)
    }
  }

  private formatRow(exercise: Exercise, isCurrent: boolean): string {
    const marker = isCurrent ? "▶ " : "   "
    return `${marker}${exercise.block} — ${exercise.name}`
  }
}
