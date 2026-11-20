/**
 * RehearsalBandSurfacePlacer — aim + pinch to place table card or wall agenda.
 * Uses WorldQuery when depth is available; falls back to synthetic planes in Interactive Preview.
 */

import {SIK} from "SpectaclesInteractionKit.lspkg/SIK"
import {InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import type {Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

const WorldQueryModule = require("LensStudio:WorldQueryModule") as WorldQueryModule

export type PlacementMode = "none" | "table" | "wall"

export type PlacementHit = {
  position: vec3
  normal: vec3
}

export class RehearsalBandSurfacePlacer {
  private mode: PlacementMode = "none"
  private hitTestSession: HitTestSession | null = null
  private latestHit: PlacementHit | null = null
  private ignoreTriggerFrames = 0
  private cameraProvider = WorldCameraFinderProvider.getInstance()
  private onConfirmed: ((mode: PlacementMode, hit: PlacementHit) => void) | null = null
  private onPreview: ((mode: PlacementMode, hit: PlacementHit | null) => void) | null = null

  constructor() {
    try {
      const options = HitTestSessionOptions.create()
      options.filter = true
      this.hitTestSession = WorldQueryModule.createHitTestSessionWithOptions(options)
      this.hitTestSession.start()
      print("RehearsalBandSurfacePlacer: WorldQuery session started")
    } catch (e) {
      this.hitTestSession = null
      print("RehearsalBandSurfacePlacer: WorldQuery unavailable, using preview fallback — " + e)
    }
  }

  getMode(): PlacementMode {
    return this.mode
  }

  isPlacing(): boolean {
    return this.mode !== "none"
  }

  begin(
    mode: "table" | "wall",
    onPreview: (mode: PlacementMode, hit: PlacementHit | null) => void,
    onConfirmed: (mode: PlacementMode, hit: PlacementHit) => void,
  ): void {
    this.mode = mode
    this.onPreview = onPreview
    this.onConfirmed = onConfirmed
    this.latestHit = null
    // Palm-menu release that started this mode must not instantly confirm.
    this.ignoreTriggerFrames = 8
    print(
      mode === "table"
        ? "RehearsalBand: aim at a table surface, then click/pinch to place the suggestion card"
        : "RehearsalBand: aim at a wall, then click/pinch to place the agenda",
    )
  }

  cancel(): void {
    this.mode = "none"
    this.latestHit = null
    this.onPreview = null
    this.onConfirmed = null
  }

  update(): void {
    if (this.mode === "none") {
      return
    }
    if (this.ignoreTriggerFrames > 0) {
      this.ignoreTriggerFrames -= 1
    }

    const interactor = this.getInteractor()
    if (!interactor || !interactor.startPoint || !interactor.endPoint) {
      this.emitPreview(null)
      return
    }

    const start = interactor.startPoint
    const end = interactor.endPoint

    if (this.hitTestSession) {
      this.hitTestSession.hitTest(start, end, (result) => {
        this.handleWorldQueryResult(result, interactor)
      })
    } else {
      this.applyHit(this.fallbackHit(start, end), interactor)
    }
  }

  private handleWorldQueryResult(result: WorldQueryHitTestResult | null, interactor: Interactor): void {
    if (result && this.matchesMode(result.normal)) {
      this.applyHit({position: result.position, normal: result.normal}, interactor)
      return
    }
    // No usable WorldQuery hit (common in Interactive Preview) — synthetic plane.
    if (!interactor.startPoint || !interactor.endPoint) {
      this.emitPreview(null)
      return
    }
    this.applyHit(this.fallbackHit(interactor.startPoint, interactor.endPoint), interactor)
  }

  private applyHit(hit: PlacementHit | null, interactor: Interactor): void {
    this.latestHit = hit
    this.emitPreview(hit)
    if (!hit || this.ignoreTriggerFrames > 0) {
      return
    }
    const released =
      interactor.previousTrigger !== InteractorTriggerType.None &&
      interactor.currentTrigger === InteractorTriggerType.None
    if (released && this.onConfirmed && this.mode !== "none") {
      const mode = this.mode
      const confirmed = hit
      this.mode = "none"
      this.onConfirmed(mode, confirmed)
      this.onPreview = null
      this.onConfirmed = null
      this.latestHit = null
    }
  }

  private emitPreview(hit: PlacementHit | null): void {
    if (this.onPreview && this.mode !== "none") {
      this.onPreview(this.mode, hit)
    }
  }

  private matchesMode(normal: vec3): boolean {
    const n = normal.normalize()
    const upDot = Math.abs(n.dot(vec3.up()))
    if (this.mode === "table") {
      return upDot >= 0.55
    }
    if (this.mode === "wall") {
      return upDot <= 0.45
    }
    return false
  }

  private fallbackHit(start: vec3, end: vec3): PlacementHit | null {
    const delta = end.sub(start)
    if (delta.length < 0.01) {
      return null
    }
    const dir = delta.normalize()
    const camPos = this.cameraProvider.getComponent().getTransform().getWorldPosition()

    if (this.mode === "table") {
      // Horizontal plane ~70 cm below eye height (standing host / preview).
      const tableY = camPos.y - 70
      if (Math.abs(dir.y) < 0.02) {
        const pos = start.add(dir.uniformScale(100))
        return {position: new vec3(pos.x, tableY, pos.z), normal: vec3.up()}
      }
      const t = (tableY - start.y) / dir.y
      if (t < 20 || t > 400) {
        return null
      }
      return {position: start.add(dir.uniformScale(t)), normal: vec3.up()}
    }

    // Wall: vertical surface facing the user along the horizontal look.
    const flat = new vec3(dir.x, 0, dir.z)
    if (flat.length < 0.01) {
      return null
    }
    const flatDir = flat.normalize()
    const dist = 140
    const pos = new vec3(
      start.x + flatDir.x * dist,
      camPos.y - 10,
      start.z + flatDir.z * dist,
    )
    // Normal points into the room (toward the user).
    return {position: pos, normal: flatDir.uniformScale(-1)}
  }

  private getInteractor(): Interactor | null {
    const targeting = SIK.InteractionManager.getTargetingInteractors()
    if (targeting && targeting.length > 0) {
      return targeting[0]
    }
    return null
  }
}
