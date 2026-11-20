/**
 * Criterion 2 — Pinch Next advances wristband name and wall agenda marker.
 * Uses DefaultLeafInteractor (scripted SIK) for the functional advance check.
 * Note: IK reach of Next failed earlier with out_of_fov (~94° off-axis) —
 * HandUIRoot placement may be hard for full-body IK in Interactive Preview.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RehearsalBandLeafInteractor} from "./RehearsalBandLeafInteractor"
import {findTextIncluding} from "./RehearsalBandLeafHelpers"

@component
export class RehearsalBandNextAdvanceScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)

    const beforeName = findTextIncluding("WristbandUI", "Zip Zap Zop")
    expect(beforeName !== null).toBe(true)

    const beforeMarker = findTextIncluding("AgendaUI", "▶ Warm-up — Zip Zap Zop")
    expect(beforeMarker !== null).toBe(true)

    const interactor = new RehearsalBandLeafInteractor()
    await interactor.tapButton("Next")
    await sleep(500)

    const afterName = findTextIncluding("WristbandUI", "Yes And Circle")
    expect(afterName !== null).toBe(true)

    const afterMarker = findTextIncluding(
      "AgendaUI",
      "▶ Warm-up — Yes And Circle",
    )
    expect(afterMarker !== null).toBe(true)

    const oldMarkerGone =
      findTextIncluding("AgendaUI", "▶ Warm-up — Zip Zap Zop") === null
    expect(oldMarkerGone).toBe(true)
  }
}
