/**
 * Extra reachability coverage — IK pinch on the table SuggestionUI card.
 * Targets the BackPlate interactable (whole card) to avoid nested-button
 * target_overlap with ChangeSuggestion.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findTextIncluding} from "./RehearsalBandLeafHelpers"

@component
export class RehearsalBandSuggestionIkReachScenario extends Scenario {
  private readonly ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(1500)

    const before = findTextIncluding("SuggestionUI", "Laundromat at midnight")
    expect(before !== null).toBe(true)

    const card = findInteractableByName("SuggestionUI")
    expect(card !== undefined && card !== null).toBe(true)

    await this.ik.trigger(card)
    await sleep(500)

    const advanced = findTextIncluding("SuggestionUI", "Submarine control room")
    expect(advanced !== null).toBe(true)
  }
}
