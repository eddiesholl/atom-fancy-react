'use babel'

const e = require('estree-builder')
const R = require('ramda')

import { parse } from './acorn'
import { noNulls } from './utils'
import {
  callFn,
  dot,
  arrow,
  lt,
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

  if (!inputText) { return { content: '' } }

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

  const content = `
${genJsList(importStmts)}

${namedExportSuites}`
  const ast = importStmts.concat(namedExportSuites)

  return {
    content,
    ast
  }
}

const buildSuitesFor = (exportingNodes, allNodes, inputModulePath) => {
  return noNulls(exportingNodes.map(en => buildSuiteFor(en, allNodes, inputModulePath)))
}

const buildSuiteFor = (exportNode, allNodes, inputModulePath) => {
  const exportDecl = exportNode.declaration
  const isTransitiveExport = exportDecl.type === 'Identifier'
  const declaringNode =
    isTransitiveExport ?
      searchByIdName(allNodes, exportDecl.name) :
      exportNode

  // Bail out if the export is for something wrapped in a call to connect
  // This implies its a connected component and it can't be tested
  // This *could* be applied to anything that is a wrapped export
  if (exportDecl.callee &&
      exportDecl.callee.callee &&
      exportDecl.callee.callee.name === 'connect') {
    return
  }

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

  let builderResult = {}
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
  const generateResult = e.const(
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
      arrow(
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
  const generateResult = e.const('result', callFn('renderComponent', [e.id(exportName)]))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(expectResult, 'to'), 'deepEqual'), [e.id('result')])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(`render ${exportName}`),
      arrow(
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
      e.function([], [e.const('result', callFn(exportName, [e.identifier('state')]))])
    ])

  return {
    suite,
    namedSut: exportName
  }
}

const buildSuiteForBasicFunc = (exportNode, { exportName }) => {
  const generateResult = e.const('result', callFn(exportName, []))
  const expectResult = callFn('expect', [e.id('result')])
  const checkResult = callFn(
    dot(dot(expectResult,'to'), 'deepEqual'), [e('object-raw', [])])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      arrow(buildItBlock('works', [generateResult, checkResult]))
    ])

  return {
    suite,
    namedSut: exportName
  }
}


const propTypeMockName = (name, type) => {
  if (type === 'func') {
    return name + 'Mock'
  } else {
    return name + 'MockData'
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
      const propName = p.key.value || p.key.name
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
        mockVar: lt(mockName),
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
