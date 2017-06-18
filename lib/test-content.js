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
  searchForPropTypes,
  searchByIdName
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
  const allNodes = ast.body
  // Grab the top level export statements
  const namedExportNodes = allNodes.filter(byType("ExportNamedDeclaration"))
  const defaultExportNode = allNodes.find(byType("ExportDefaultDeclaration"))
  const exportNodes =
    defaultExportNode ? namedExportNodes.concat(defaultExportNode) : namedExportNodes

  console.dir(allNodes)
  // console.dir(defaultExportNode)
  // const namedExportNames = namedExportNodes.map(findExportName)

  const exportSuiteTrees = buildSuitesFor(exportNodes, allNodes, inputModulePath)
  // REVISIT: Try parsing output and merging trees
  // const existingSuites = []

  const importStmts = buildImportStmts(exportSuiteTrees)

  const namedExportSuites =
    exportSuiteTrees
      .map(n => {
        // console.dir(n)
        // printNode(n.suite)
        return n.suite
      })
      .map(genJs)
      .join('\n')

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
  // console.dir(allNodes)
  const className = varDecName(classComponentNode)
  // console.log('basicFunc')
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
      enzyme: ['shallow']
    },
    defaultDepImports: {
      react: 'React'
    }
  }
}

const buildSuiteForJsx = (exportNode, { exportName }) => {
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
    namedSut: exportName
  }
}

const buildSuiteForMapStateToProps = (exportNode, { exportName }) => {
  // console.log('mapStateToProps')
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



//const decName = (e) => e.declaration.name
const varDecName = (vd) => {
  return vd && vd.id && vd.id.name
}
