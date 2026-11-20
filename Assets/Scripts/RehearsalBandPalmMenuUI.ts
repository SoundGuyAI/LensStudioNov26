/**
 * RehearsalBandPalmMenuUI — palm controls beyond Next.
 * Owns: BackPlate button stack; emits host intents including surface placement.
 * Must not: mutate workshop state.
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
const bulbIcon = requireAsset("../Icons/lightbulb.png") as Texture
const timerIcon = requireAsset("../Icons/timer.png") as Texture
const resetIcon = requireAsset("../Icons/restart_alt.png") as Texture

const FONT_SIZE_SCALE = 1.0
function roleSize(distanceCm: number = 55): number {
  return 36 * FONT_SIZE_SCALE * (distanceCm / 110)
}

@component
export class RehearsalBandPalmMenuUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RehearsalBandPalmMenuUI – palm host controls</span>')
  @ui.separator

  @ui.group_start("Settings")
  @input
  @widget(new SliderWidget(12, 28, 0.5))
  @hint("Palm menu width in cm")
  panelWidth: number = 18

  @input
  @widget(new SliderWidget(10, 32, 0.5))
  @hint("Palm menu height in cm")
  panelHeight: number = 22
  @ui.group_end

  public onRequestSuggestion: Event<void> = new Event<void>()
  public onStartTimer: Event<void> = new Event<void>()
  public onResetTimer: Event<void> = new Event<void>()
  public onPlaceTable: Event<void> = new Event<void>()
  public onPlaceWall: Event<void> = new Event<void>()

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
    flex.justifyContent = FlexJustify.SpaceEvenly
    flex.rowGap = 0.5
    flex.paddingTop = 0.8
    flex.paddingBottom = 0.8
    flex.paddingLeft = 0.8
    flex.paddingRight = 0.8

    this.addActionButton(content, "Suggestion", bulbIcon, () => this.onRequestSuggestion.invoke())
    this.addActionButton(content, "Start Timer", timerIcon, () => this.onStartTimer.invoke())
    this.addActionButton(content, "Reset Timer", resetIcon, () => this.onResetTimer.invoke())
    this.addActionButton(content, "Place Table", null, () => this.onPlaceTable.invoke())
    this.addActionButton(content, "Place Wall", null, () => this.onPlaceWall.invoke())

    flex.onLayoutComplete.add((r) => {
      backPlate.size = new vec2(r.containerWidth, r.containerHeight)
    })
  }

  private addActionButton(
    parent: SceneObject,
    label: string,
    icon: Texture | null,
    onClick: () => void,
  ): void {
    const so = global.scene.createSceneObject(label)
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(this.panelWidth - 1.6, 3.0, 1)
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    ec.text = label
    ec.textSize = roleSize(55)
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
