/**
 * Criterion 1 — Look at the hand and see current exercise name + timer on wristband.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {anyTextMatches, findTextIncluding} from "./RehearsalBandLeafHelpers"

@component
export class RehearsalBandWristbandVisibleScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)

    const handRoot = findSceneObjectByName("HandUIRoot")
    expect(handRoot).not.toBeNull()
    expect(handRoot.enabled).toBe(true)

    const wristband = findSceneObjectByName("WristbandUI")
    expect(wristband).not.toBeNull()
    expect(wristband.enabled).toBe(true)

    const exercise = findTextIncluding("WristbandUI", "Zip Zap Zop")
    expect(exercise !== null).toBe(true)

    const timerVisible = anyTextMatches("WristbandUI", (t) =>
      /^\d+:\d{2}$/.test(t.trim()),
    )
    expect(timerVisible).toBe(true)

    // Initial remaining time is 3:00 (180s); allow 3:00 or early countdown.
    const startsAtThree = anyTextMatches("WristbandUI", (t) => {
      const m = t.trim().match(/^(\d+):(\d{2})$/)
      if (!m) {
        return false
      }
      const total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
      return total >= 175 && total <= 180
    })
    expect(startsAtThree).toBe(true)
  }
}
