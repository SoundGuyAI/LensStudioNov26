/**
 * Criterion 4 — Face the wall and see full agenda with current exercise marked.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {
  anyTextMatches,
  collectTextsUnder,
  findTextIncluding,
} from "./RehearsalBandLeafHelpers"

@component
export class RehearsalBandAgendaVisibleScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)

    const agenda = findSceneObjectByName("AgendaUI")
    expect(agenda).not.toBeNull()
    expect(agenda.enabled).toBe(true)

    const title = findTextIncluding("AgendaUI", "Workshop Agenda")
    expect(title !== null).toBe(true)

    const plan = [
      "Zip Zap Zop",
      "Yes And Circle",
      "Location Freeze",
      "Relationship Swap",
      "Open Scenes",
    ]
    for (let i = 0; i < plan.length; i++) {
      const row = findTextIncluding("AgendaUI", plan[i])
      expect(row !== null).toBe(true)
    }

    // After scene reset, current exercise is index 0 with ▶ marker.
    const currentMarked = findTextIncluding(
      "AgendaUI",
      "▶ Warm-up — Zip Zap Zop",
    )
    expect(currentMarked !== null).toBe(true)

    const markerCount = collectTextsUnder("AgendaUI").filter((t) =>
      t.includes("▶"),
    ).length
    expect(markerCount).toBe(1)

    const hasUnmarked = anyTextMatches(
      "AgendaUI",
      (t) => t.includes("Open Scenes") && !t.includes("▶"),
    )
    expect(hasUnmarked).toBe(true)
  }
}
