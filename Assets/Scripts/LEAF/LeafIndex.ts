/**
 * LEAF scenario index for Rehearsal Band.
 */

import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {RehearsalBandAgendaVisibleScenario} from "./RehearsalBandAgendaVisibleScenario"
import {RehearsalBandNextAdvanceScenario} from "./RehearsalBandNextAdvanceScenario"
import {RehearsalBandSuggestionChangeScenario} from "./RehearsalBandSuggestionChangeScenario"
import {RehearsalBandSuggestionIkReachScenario} from "./RehearsalBandSuggestionIkReachScenario"
import {RehearsalBandWristbandVisibleScenario} from "./RehearsalBandWristbandVisibleScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {
      id: "rehearsal-band-wristband-visible",
      typename: RehearsalBandWristbandVisibleScenario.getTypeName(),
    },
    {
      id: "rehearsal-band-next-advance",
      typename: RehearsalBandNextAdvanceScenario.getTypeName(),
    },
    {
      id: "rehearsal-band-suggestion-change",
      typename: RehearsalBandSuggestionChangeScenario.getTypeName(),
    },
    {
      id: "rehearsal-band-agenda-visible",
      typename: RehearsalBandAgendaVisibleScenario.getTypeName(),
    },
    {
      id: "rehearsal-band-suggestion-ik-reach",
      typename: RehearsalBandSuggestionIkReachScenario.getTypeName(),
    },
  ]
}
