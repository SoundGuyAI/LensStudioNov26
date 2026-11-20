/**
 * Rehearsal Band LEAF interactor — UIKit button taps by scene object name.
 */

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"

export class RehearsalBandLeafInteractor extends DefaultLeafInteractor {
  async tapButton(buttonName: string): Promise<void> {
    const matches = findInteractablesByName(buttonName, undefined, true)
    const button = matches[0]
    if (!button) {
      throw new Error(`Button "${buttonName}" not found or not enabled`)
    }
    await this.trigger(button)
    await sleep(300)
  }
}
