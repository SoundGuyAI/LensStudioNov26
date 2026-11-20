/**
 * Criterion 3 — At the table, pinch New Suggestion / ChangeSuggestion to advance pool.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RehearsalBandLeafInteractor} from "./RehearsalBandLeafInteractor"
import {collectTextsUnder, findTextIncluding} from "./RehearsalBandLeafHelpers"

@component
export class RehearsalBandSuggestionChangeScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)

    const before = findTextIncluding("SuggestionUI", "Laundromat at midnight")
    expect(before !== null).toBe(true)

    const beforeTexts = collectTextsUnder("SuggestionUI")

    const interactor = new RehearsalBandLeafInteractor()
    await interactor.tapButton("ChangeSuggestion")
    await sleep(400)

    const stillFirst = findTextIncluding("SuggestionUI", "Laundromat at midnight")
    expect(stillFirst === null).toBe(true)

    const nextPool = findTextIncluding("SuggestionUI", "Submarine control room")
    expect(nextPool !== null).toBe(true)

    const afterTexts = collectTextsUnder("SuggestionUI")
    expect(afterTexts.join("|") !== beforeTexts.join("|")).toBe(true)
  }
}
