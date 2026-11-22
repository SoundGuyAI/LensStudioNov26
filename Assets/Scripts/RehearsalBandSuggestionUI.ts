/**
 * RehearsalBandSuggestionUI — table suggestion card.
 * Owns: BackPlate card + Pinch-to-change Button surface; emits onChangeSuggestion.
 * Must not: pick the next suggestion text (Main/State owns that).
 */

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

const FONT_SIZE_SCALE = 1.0
type TextRole = "Caption" | "Headline1" | "Body" | "Button"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Caption: {size: 38, weight: 500},
  Headline1: {size: 54, weight: 700},
  Body: {size: 39, weight: 500},
  Button: {size: 39, weight: 500},
}

function roleSize(role: TextRole, distanceCm: number = 130): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

function applyTextRole(t: Text, role: TextRole, distanceCm: number = 130): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

@component
export class RehearsalBandSuggestionUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandSuggestionUI – table card</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(18, 36, 0.5))
  @hint("Suggestion card width in cm")
  panelWidth: number = 26

  @input
  @widget(new SliderWidget(10, 24, 0.5))
  @hint("Suggestion card height in cm")
  panelHeight: number = 16

  @input
  @hint("Placeholder kind label")
  defaultKind: string = "Location"

  @input
  @hint("Placeholder suggestion body (longest expected)")
  defaultBody: string = "Museum after hours"
  @ui.group_end

  public onChangeSuggestion: Event<void> = new Event<void>()

  private kindText: Text | null = null
  private bodyText: Text | null = null
  private hintText: Text | null = null

  onAwake(): void {
    this.getSceneObject().createComponent("Component.Canvas")
    const backPlate = this.getSceneObject().createComponent(BackPlate.getTypeName()) as BackPlate
    backPlate.size = new vec2(this.panelWidth, this.panelHeight)
    // Whole-card pinch advances the suggestion. Prefer BackPlate as the IK
    // target (large collider) so LEAF does not hit target_overlap against the
    // nested ChangeSuggestion button.
    backPlate.onInitialized.add(() => {
      const interactable = backPlate.interactable
      if (!interactable) {
        return
      }
      interactable.onTriggerEnd.add(() => {
        this.onChangeSuggestion.invoke()
      })
    })

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.getSceneObject())
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = this.panelWidth
    flex.height = this.panelHeight
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.SpaceBetween
    flex.rowGap = 0.8
    flex.paddingTop = 1.2
    flex.paddingBottom = 1.2
    flex.paddingLeft = 1.4
    flex.paddingRight = 1.4

    this.kindText = this.addLabel(content, this.defaultKind, "Caption", 2.2)
    this.bodyText = this.addLabel(content, this.defaultBody, "Headline1", 4.0)
    this.hintText = this.addLabel(content, "Pinch card to change", "Body", 2.2)
    this.addChangeButton(content)

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })
  }

  showSuggestion(kind: string, body: string): void {
    if (this.kindText) {
      this.kindText.text = kind
    }
    if (this.bodyText) {
      this.bodyText.text = body
    }
    this.getSceneObject().enabled = true
  }

  hideSuggestion(): void {
    this.getSceneObject().enabled = false
  }

  private addLabel(parent: SceneObject, label: string, role: TextRole, height: number): Text {
    const so = global.scene.createSceneObject("Label")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = label
    t.depthTest = true
    applyTextRole(t, role, 130)
    t.horizontalAlignment = HorizontalAlignment.Left
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = this.panelWidth - 2.8
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -height / 2, height / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    return t
  }

  private addChangeButton(parent: SceneObject): void {
    const so = global.scene.createSceneObject("ChangeSuggestion")
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(this.panelWidth - 2.8, 3.4, 1)
    const label = global.scene.createSceneObject("BtnLabel")
    label.setParent(so)
    const t = label.createComponent("Component.Text") as Text
    t.text = "New Suggestion"
    t.depthTest = true
    applyTextRole(t, "Button", 130)
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-(this.panelWidth - 3.5) / 2, (this.panelWidth - 3.5) / 2, -1.4, 1.4)
    so.createComponent(FlexItem.getTypeName())
    // Visual affordance only — BackPlate owns the sole interactable so IK/SIK
    // cannot resolve a nested ChangeSuggestion and raise target_overlap.
    btn.onInitialized.add(() => {
      if (btn.interactable) {
        btn.interactable.enabled = false
      }
      const colliders = so.getComponents("ColliderComponent") as ColliderComponent[]
      for (const collider of colliders) {
        collider.enabled = false
      }
    })
  }
}
