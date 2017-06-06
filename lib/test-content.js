'use babel'

const acorn = require('acorn-jsx');
const astring = require('astring').generate;
const e = require('estree-builder');

import { noNulls } from './utils'
import {
  callFn,
  dot,
  fn,
  vr,
  buildBeforeEach,
  buildRenderFunc,
  buildItBlock,
  buildImportStmts
} from './tree-builders'
const res = require('./test-content-resources')
const {
  searchByType,
  byType,
  printNode,
  searchBySuperClass,
  searchForPropTypes
} = require('./node-ops')

export const genJs = (estree) => {
  return astring(estree, { indent: '  ' })
}
export const genJsList = (estreeList) => {
  return estreeList.map(genJs).join('\n')
}

export const generate = (inputText, outputText, inputModulePath) => {

  if (!inputText) { return '' }

  const ast = acorn.parse(inputText, res.acornOptions)
  const nodes = ast.body
  const namedExports = nodes.filter(byType("ExportNamedDeclaration"))
  // const namedExportNames = namedExports.map(findExportName)

  const namedExportSuiteTrees = buildSuitesFor(namedExports, nodes)
  // REVISIT: Try parsing output and merging trees
  // const existingSuites = []

  const sutNames = noNulls(
    namedExportSuiteTrees
      .map(t => {
        return t.sut
      }))

  const namedImportMaps = namedExportSuiteTrees
    .map(t => t.namedImports )
  const defaultImportMaps = namedExportSuiteTrees
    .map(t => t.defaultImports )

  const importStmts = buildImportStmts(namedImportMaps, defaultImportMaps)

  const namedExportSuites =
    namedExportSuiteTrees
      .map(n => {
        console.dir(n)
        printNode(n.suite)
        return n.suite
      })
      .map(genJs)
      .join('\n')

  return `
${genJsList(importStmts)}

${namedExportSuites}`
}

const buildSuitesFor = (namedExports, nodes) => {
  return namedExports.map(ne => buildSuiteFor(ne, nodes))
}

const buildSuiteFor = (namedExportNode, nodes) => {
  console.log('input node')
  // console.dir(namedExportNode)
  // printNode(namedExportNode, 0)
  const varDec = searchByType(namedExportNode, "VariableDeclarator")
  const exportName = varDecName(varDec)
  const classComponentNode = searchBySuperClass(namedExportNode, "Component")
  const hasJsx = searchByType(namedExportNode, "JSXElement")

  if (exportName === 'mapStateToProps') {
    return buildSuiteForMapStateToProps(exportName)
  } else if (classComponentNode) {
    return buildSuiteForClassBased(classComponentNode, nodes)
  } else if (hasJsx) {
    return buildSuiteForJsx(exportName, nodes)
  } else {
    return buildSuiteForBasicFunc(exportName)
  }
}

const buildSuiteForClassBased = (node, nodes) => {
  nodes.map(n => printNode(n))
  console.dir(nodes)
  const className = varDecName(node)
  // console.log('basicFunc')
  const generateResult = e.var(
    'result',
    callFn('renderComponent', []))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(expectResult,'to'), 'deepEqual'), [e.id('result')])

  const propTypes = searchForPropTypes(nodes, className)
  const propTypeOutputs = processPropTypes(propTypes)
  const beforeEach = buildBeforeEach(propTypeOutputs)

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(`render ${className}`),
      fn(
        ...letForPropTypes(propTypes),
        beforeEach,
        buildRenderFunc(className, propTypeOutputs),
        buildItBlock('can render', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: className,
    namedImports: {
      enzyme: ['shallow']
    },
    defaultImports: {
      react: 'React'
    }
  }
}

const buildSuiteForJsx = (exportName) => {
  // console.log('jsx')
  const generateResult = e.var('result', callFn('renderComponent', [e.id(exportName)]))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(expectResult, 'to'), 'deepEqual'), [e.id('result')])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(`render ${exportName}`),
      fn(
        buildRenderFunc(exportName),
        buildItBlock('can render', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: exportName
  }
}

const buildSuiteForMapStateToProps = (exportName) => {
  // console.log('mapStateToProps')
  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [e.var('result', callFn(exportName, [e.identifier('state')]))])
    ])

  return {
    suite,
    sut: exportName
  }
}

const buildSuiteForBasicFunc = (exportName) => {
  // console.log('basicFunc')
  const generateResult = e.var('result', callFn(exportName, []))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(expectResult,'to'), 'deepEqual'), [e('object-raw', [])])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      fn(buildItBlock('works', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: exportName
  }
}


const propTypeMockName = name => name + 'Mock'
export const letForPropTypes = (propDefs) => {
  if (propDefs && propDefs.map) {
    return propDefs.map(p => {
      return vr(propTypeMockName(p.key.name))
    })
  }
}

const stringMock = (n) => e.string(n + 'Mock')
export const propTypeToMock = {
  func: () => callFn(dot(e.id('jest'), 'fn'), [])
}
export const processPropTypes = (propDefs) => {
  if (propDefs && propDefs.map) {
    return propDefs.map(p => {
      const propName = p.key.name
      const mockName = propTypeMockName(propName)
      const propTypeType = p.value.object.property.name
      const mockGen = propTypeToMock[propTypeType] || stringMock
      const mockVal = mockGen(propName)

      return {
        propName,
        mockName,
        mockVar: vr(mockName),
        mockVal
      }
    })
  } else {
    return []
  }
}



//const decName = (e) => e.declaration.name
const varDecName = (vd) => {
  return vd && vd.id && vd.id.name
}
