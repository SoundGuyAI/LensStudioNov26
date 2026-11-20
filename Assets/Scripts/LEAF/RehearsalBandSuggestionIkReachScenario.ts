/**
 * Extra reachability coverage — IK attempt on table ChangeSuggestion button.
 * Not a done-criterion; documents whether SuggestionUI is IK-reachable.
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

    const button = findInteractableByName("ChangeSuggestion")
    expect(button !== undefined && button !== null).toBe(true)

    // With diagnostic_policy=fallback, interaction should still advance via DefaultLeafInteractor fallback.
    await this.ik.trigger(button)
    await sleep(500)

    const advanced = findTextIncluding("SuggestionUI", "Submarine control room")
    expect(advanced !== null).toBe(true)
  }
}
