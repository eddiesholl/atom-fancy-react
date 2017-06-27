'use babel'

const e = require('estree-builder');
const R = require('ramda');

import { parse } from './acorn'
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
const {
  searchByType,
  byType,
  printNode,
  searchBySuperClass,
  searchForPropTypes,
  searchByIdName
} = require('./node-ops')

const { genJs, genJsList } = require('./js-gen')

export const generate = (inputText, existingText, inputModulePath) => {

  if (!inputText) { return '' }

  const inputAST = parse(inputText)
  const inputNodes = inputAST.body
  // const namedExportNames = namedExports.map(findExportName)

  // Grab the top level export statements
  const namedExportNodes = inputNodes.filter(byType("ExportNamedDeclaration"))
  const defaultExportNode = inputNodes.find(byType("ExportDefaultDeclaration"))
  const exportNodes =
    defaultExportNode ? namedExportNodes.concat(defaultExportNode) : namedExportNodes

  const exportSuiteTrees = buildSuitesFor(exportNodes, inputNodes, inputModulePath)
  const outputAST = parse(existingText)
  const outputNodes = outputAST.body
  const existingTopLevelSuites =
    outputNodes
      .filter(byType("ExpressionStatement"))
      .filter(R.pathEq(['expression', 'callee', 'name'], 'describe'))
      .map(n => {
        return {
          suite: n.expression,
          name: n.expression.arguments[0].value
        }
      })

  const mergedSuites = mergeSuites(existingTopLevelSuites, exportSuiteTrees)

  const namedImportMaps = noNulls(exportSuiteTrees
    .map(t => t.namedDepImports))
  const defaultImportMaps = noNulls(exportSuiteTrees
    .map(t => t.defaultDepImports))

  const importStmts = buildImportStmts(namedImportMaps, defaultImportMaps, exportSuiteTrees)

  const namedExportSuites =
    mergedSuites.map(genJs).join('\n')

  return `
${genJsList(importStmts)}

${namedExportSuites}`
}

const buildSuitesFor = (exportingNodes, allNodes, inputModulePath) => {
  return exportingNodes.map(en => buildSuiteFor(en, allNodes, inputModulePath))
}

const buildSuiteFor = (exportNode, allNodes, inputModulePath) => {
  const exportDecl = exportNode.declaration
  const isTransitiveExport = exportDecl.type === 'Identifier'
  const declaringNode =
    isTransitiveExport ?
    searchByIdName(allNodes, exportDecl.name) :
    exportNode

  // printNode(exportNode, 0)
  const varDec = searchByType(declaringNode, "VariableDeclarator")
  const classComponentNode = searchBySuperClass(declaringNode, "Component")
  const exportName = varDecName(varDec || classComponentNode)
  const hasJsx = searchByType(declaringNode, "JSXElement")

  const builderOptions = {
    isDefaultExport: exportNode.type === "ExportDefaultDeclaration",
    exportName,
    inputModulePath
  }

  var builderResult = {}
  if (exportName === 'mapStateToProps') {
    builderResult = buildSuiteForMapStateToProps(exportNode, builderOptions, allNodes)
  } else if (classComponentNode) {
    builderResult = buildSuiteForClassBased(classComponentNode, builderOptions, allNodes)
  } else if (hasJsx) {
    builderResult = buildSuiteForJsx(exportNode, builderOptions, allNodes)
  } else {
    builderResult = buildSuiteForBasicFunc(exportNode, builderOptions, allNodes)
  }

  return addSut(builderResult, builderOptions)
}

const addSut = (builderResult, { isDefaultExport, exportName, inputModulePath }) => {
  const namedSut = isDefaultExport ? null : exportName
  const defaultSut = isDefaultExport ? exportName : null

  return {
    ...builderResult,
    namedSut,
    defaultSut,
    inputModulePath
  }
}

const buildSuiteForClassBased = (classComponentNode, builderOptions, allNodes) => {
  allNodes.map(n => printNode(n))
  const className = varDecName(classComponentNode)
  const generateResult = e.var(
    'result',
    callFn('renderComponent', []))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(dot(expectResult, 'to'), 'deep'), 'equal'), [e.id('result')])

  const propTypes = searchForPropTypes(allNodes, className)
  const propTypeOutputs = processPropTypes(propTypes)
  const beforeEach = buildBeforeEach(propTypeOutputs)

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(`render ${className}`),
      fn(
        ...letForPropTypes(propTypeOutputs),
        beforeEach,
        buildRenderFunc(className, propTypeOutputs),
        buildItBlock('can render', [generateResult, checkResult]))
    ])

  return {
    suite,
    namedSut: className,
    namedDepImports: {
      enzyme: ['shallow'],
      chai: ['expect']
    },
    defaultDepImports: {
      react: 'React'
    }
  }
}

const buildSuiteForJsx = (exportNode, { exportName }) => {
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
    namedSut: exportName
  }
}

const buildSuiteForMapStateToProps = (exportNode, { exportName }) => {
  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [e.var('result', callFn(exportName, [e.identifier('state')]))])
    ])

  return {
    suite,
    namedSut: exportName
  }
}

const buildSuiteForBasicFunc = (exportNode, { exportName }) => {
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
    namedSut: exportName
  }
}


const propTypeMockName = (name, type) => {
  if (type === 'func') {
    return name + 'MockData'
  } else {
    return name + 'Mock'
  }
}
export const letForPropTypes = (propDefs) => {
  if (propDefs && propDefs.map) {
    return propDefs.map(p => p.mockVar)
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
      const propTypeName = p.value.property.name
      const propTypeType =
        propTypeName === 'isRequired' ?
        p.value.object.property.name :
        propTypeName
      const mockName = propTypeMockName(propName, propTypeType)
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

const bySuiteName = (nodes) => {
  return R.indexBy(n => n.arguments[0].value, nodes.map(n => n.suite))
}
const mergeSuites = (existing, incoming) => {
  const existingByName = bySuiteName(existing)
  const incomingByName = bySuiteName(incoming)

  return R.values(R.merge(existingByName, incomingByName))
}

//const decName = (e) => e.declaration.name
const varDecName = (vd) => {
  return vd && vd.id && vd.id.name
}
