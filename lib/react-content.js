'use babel'

const e = require('estree-builder');

import { parse } from './acorn'
import { searchByLocationAndType } from './node-ops'

import { genJsList } from './js-gen'
import {
  buildImportStmts,
  buildClass,
  raw,
  fnArgs,
  dot,
  assign
} from './tree-builders'

export const generate = (inputText, point) => {
  const tree = parse(inputText)
  const selected = searchByLocationAndType(
    tree,
    // Note difference between Point and Position
    { line: point.row + 1, column: point.column },
    'JSXOpeningElement')
  console.dir(selected)

  const componentName = selected.name.name

  const importStmts = generateImports(selected)
  const declarationStmts = generateComponents(selected)

  return {
    content: genJsList(importStmts.concat(declarationStmts)),
    componentName
  }
}

export const generateImports = () => {
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
    render: generateRender(jsxNode.attributes)
  })

  const defProps = generateProps(className, jsxNode.attributes)

  const defExport = raw(`export default ${className}`)
  return [classDecl, defProps, defExport]
}

const generateRender = (attributeNodes) => {
  const propVars = attributeNodes.map(a => {
    return e.id(a.name.name)
  })
  const objPattern = e('obj-pattern', propVars)
  const thisDotProps = dot(e.this(), 'props')
  return fnArgs(
    [],
    e.var(objPattern, thisDotProps),
    e.return(e.id('(\n    )'))
  )
}

const generateProps = (className, attributeNodes) => {
  const propObject = {}
  attributeNodes.forEach(a => {
    propObject[a.name.name] = dot(dot(e.id('PropTypes'), 'object'), 'isRequired')
  })
  return assign(dot(e.id(className), 'propTypes'), e.object(propObject))
}
