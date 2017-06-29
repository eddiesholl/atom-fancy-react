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
  const jsxBlock = searchByLocationAndType(
    tree,
    // Note difference between Point and Position
    { line: point.row + 1, column: point.column },
    'JSXElement')

  const jsxOpening = jsxBlock.openingElement
  const componentName = jsxOpening.name.name

  const importStmts = generateImports(componentName)
  const declarationStmts = generateComponents(jsxOpening)

  return {
    content: genJsList(importStmts.concat(declarationStmts)),
    componentName
  }
}

export const generateImports = (componentName) => {
  const namedImports = {
    react: ['Component']
  }
  const defaultImports = {
    react: 'React',
    'prop-types': 'PropTypes'
  }
  defaultImports[`./${componentName}.scss`] = 'styles'

  return buildImportStmts([namedImports], [defaultImports])
}

export const generateComponents = (jsxNode) => {
  const className = jsxNode.name.name

  const classDecl = buildClass(className, 'Component', {
    render: generateRender(className, jsxNode.attributes)
  })

  const defProps = generateProps(className, jsxNode.attributes)

  const defExport = raw(`export default ${className}`)
  return [classDecl, defProps, defExport]
}

const generateRender = (className, attributeNodes) => {
  const propVars = attributeNodes.map(a => {
    return e.id(a.name.name)
  })
  const objPattern = e('obj-pattern', propVars)
  const thisDotProps = dot(e.this(), 'props')
  return fnArgs(
    [],
    e.var(objPattern, thisDotProps),
    e.return(e.id(`(
      <div>
        Here is a '${className}'
      </div>
    )`))
  )
}

const generateProps = (className, attributeNodes) => {
  const objProps = attributeNodes.map(a => {
    return e('obj-prop', e.id(a.name.name), dot(dot(e.id('PropTypes'), 'object'), 'isRequired'))
  })
  return assign(dot(e.id(className), 'propTypes'), e('obj-raw', objProps))
}
