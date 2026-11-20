/**
 * Shared helpers for Rehearsal Band LEAF scenarios.
 */

import {
  findSceneObjectByName,
  forEachComponentInSubtree,
} from "Leaf.lspkg/Utils/common/Utils"

export function collectTextsUnder(rootName: string): string[] {
  const root = findSceneObjectByName(rootName)
  if (!root) {
    throw new Error(`SceneObject "${rootName}" not found`)
  }
  const texts: string[] = []
  forEachComponentInSubtree(root, ["Component.Text"], (component: Text) => {
    if (component && typeof component.text === "string") {
      texts.push(component.text)
    }
  })
  return texts
}

export function findTextIncluding(rootName: string, needle: string): string | null {
  const texts = collectTextsUnder(rootName)
  for (let i = 0; i < texts.length; i++) {
    if (texts[i].includes(needle)) {
      return texts[i]
    }
  }
  return null
}

export function anyTextMatches(rootName: string, predicate: (t: string) => boolean): boolean {
  const texts = collectTextsUnder(rootName)
  for (let i = 0; i < texts.length; i++) {
    if (predicate(texts[i])) {
      return true
    }
  }
  return false
}
