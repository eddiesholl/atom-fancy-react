'use babel'

import { parse } from './acorn'
import { searchByLocationAndType } from './node-ops'

export const generate = (inputText, point) => {
  const tree = parse(inputText)
  const selected = searchByLocationAndType(
    tree,
    // Note difference between Point and Position
    { line: point.row + 1, column: point.column },
    'JSXOpeningElement')
  console.dir(tree)

  return selected
}
