'use babel'

import { parse } from './acorn'
import { searchByLocationAndType } from './node-ops'

import { genJs, genJsList } from './js-gen'
import {
  buildImportStmts,
  buildClass,
  raw,
  fnArgs
} from './tree-builders'

export const generate = (inputText, point) => {
  const tree = parse(inputText)
  const selected = searchByLocationAndType(
    tree,
    // Note difference between Point and Position
    { line: point.row + 1, column: point.column },
    'JSXOpeningElement')
  console.dir(tree)

  const componentName = selected.name.name

  const importStmts = generateImports(selected)
  const declarationStmts = generateComponents(selected)

  return {
    content: genJsList(importStmts.concat(declarationStmts)),
    componentName
  }
}

export const generateImports = (jsxNode) => {
  const namedImports = [{
    react: ['Component']
  }]
  const defaultImports = [{
    react: 'React',
    'prop-types': 'PropTypes'
  }]

  return buildImportStmts(namedImports, defaultImports)
}

export const generateComponents = (jsxNode) => {
  const className = jsxNode.name.name

  const classDecl = buildClass(className, 'Component', {
    render: fnArgs([])
  })
  const defExport = raw(`export default ${className}`)
  return [classDecl, defExport]
}
