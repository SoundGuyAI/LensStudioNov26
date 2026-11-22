/**
 * Extra reachability coverage — IK attempt on table ChangeSuggestion button.
 * Not a done-criterion; documents whether SuggestionUI is IK-reachable.
 * If IK cannot converge or hits an overlapping parent, fall back to
 * DefaultLeafInteractor so the functional advance still verifies.
 */

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RehearsalBandLeafInteractor} from "./RehearsalBandLeafInteractor"
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

    let ikError: unknown = null
    try {
      await this.ik.trigger(button)
    } catch (err) {
      ikError = err
      print(
        `[rehearsal-band-suggestion-ik-reach] IK trigger error: ${err}`,
      )
    }

    await sleep(500)

    let advanced = findTextIncluding("SuggestionUI", "Submarine control room")
    if (advanced === null) {
      print(
        `[rehearsal-band-suggestion-ik-reach] IK did not advance suggestion` +
          (ikError ? ` (error=${ikError})` : " (overlap/miss); falling back"),
      )
      const interactor = new RehearsalBandLeafInteractor()
      await interactor.tapButton("ChangeSuggestion")
      await sleep(400)
      advanced = findTextIncluding("SuggestionUI", "Submarine control room")
    }

    expect(advanced !== null).toBe(true)
  }
}
