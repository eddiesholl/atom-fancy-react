const acorn = require('acorn-jsx');
const astring = require('astring').generate;
const e = require('estree-builder');

const res = require('./test-content-resources')
//const pathFuncs = require('./path-funcs')

const generate = (inputText, outputText, inputModulePath) => {

  if (!inputText) { return '' }

  const ast = acorn.parse(inputText, res.acornOptions)
  const nodes = ast.body
  const namedExports = nodes.filter(byType("ExportNamedDeclaration"))
  const namedExportNames = namedExports.map(findExportName)

  const namedExportSuiteTrees = suitesFor(namedExports)
  // REVISIT: Try parsing output and merging trees
  // const existingSuites = []

  const namedExportSuites =
    namedExportSuiteTrees
      .map(n => {
        console.dir(n)
        printNode(n)
        return n
      })
      .map(astring)
      .join('\n')

  return `
${res.sutImport([namedExportNames], inputModulePath)}

${namedExportSuites}`
}

const suitesFor = (namedExports) => {
  return namedExports.map(suiteFor)
}

const suiteFor = (namedExportNode) => {
  console.log('input node')
  console.dir(namedExportNode)
//  printNode(namedExportNode, 0)
  const varDec = searchByType(namedExportNode, "VariableDeclarator")
  const exportName = varDecName(varDec)
  const hasJsx = searchByType(namedExportNode, "JSXElement")

  if (exportName === 'mapStateToProps') {
    return suiteForMapStateToProps(exportName)
  } else if (hasJsx) {
    return suiteForJsx(exportName)
  } else {
    return suiteForBasicFunc(exportName)
  }
}

const suiteForJsx = (exportName) => {
  console.log('jsx')
  const generateResult = e.var('result', callFunc('renderComponent', [e.id(exportName)]))
  const expectResult = callFunc('expect', [e.id('result')])
  const checkResult = callFunc(
    dot(dot(expectResult,'to'), 'deepEqual'), [e.id('result')])

  return e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [generateResult, checkResult])
    ])
}

const suiteForMapStateToProps = (exportName) => {
  console.log('mapStateToProps')
  return e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [e.var('result', callFunc(exportName, [e.identifier('state')]))])
    ])
}

const suiteForBasicFunc = (exportName) => {
  console.log('basicFunc')
  const generateResult = e.var('result', callFunc(exportName, []))
  const expectResult = callFunc('expect', [e.id('result')])
  const checkResult = callFunc(
    dot(dot(expectResult,'to'), 'deepEqual'), [e('object-raw', [])])

  return e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [generateResult, checkResult])
    ])
}

module.exports = {
  suitesFor,
  generate
}

const dot = (target, prop) => {
  return e('.', target, e.id(prop))
}

const callFunc = (callee, args) => {
  return e.call(isString(callee) ? e.identifier(callee) : callee, args || [])
}

const findExportName = (namedExport) => {
  const varDec = searchByType(namedExport, "VariableDeclarator")
  return varDecName(varDec)
}

//const decName = (e) => e.declaration.name
const varDecName = (vd) => vd.id.name

const byType = (type) => {
  return (n) => {
    return n.type === type;
  }
}

const singleNodesToSearch = ['declaration', 'id', 'init', 'body']
const multiNodesToSearch = ['declarations']
const searchByType = (node, type) => {
  if (byType(type)(node)) { return node }

  const singleMatch = singleNodesToSearch.map(s => {
    const nextChild = node[s]
    if (nextChild) {
      return searchByType(nextChild, type)
    }
  }).find(n => !!n)

  if (singleMatch) {
    // console.log('singleMatch')
    // console.log(type)
    // console.dir(singleMatch)
    return singleMatch
  } else {
    const multiMatch = multiNodesToSearch.map(s => {
      const nextChild = node[s]
      if (nextChild) {
        return nextChild.find(d => {
          return searchByType(d, type)
        })
      }
    }).find(n => !!n)
    // console.log('multiMatch')
    // console.log(type)
    // console.dir(multiMatch)
    return multiMatch
  }
}

const printNode = (node, depth) => {
  depth = depth || 0
  if (!node) {
    console.log('undefined :(')
    return
  }
  const pad = Array(depth).fill().map(() => '|\t').join('');
  const nextDepth = depth + 1
  const sub = (s) => {
    const next = node[s]
    if (next) {
      if(next.length || next.length === 0) {
        console.log(pad + s + ':')
        node[s].forEach(n => printNode(n, nextDepth))
      } else {
        console.log(pad + s + ':')
        printNode(next, nextDepth)
      }
    }
  }
  const iter = (s) => {
    if (node[s]) {
      console.log(pad + s + ':')
      node[s].forEach(n => printNode(n, nextDepth))
    }
  }
  console.log(pad + node.type + " " + (node.name || ''))
  sub('id')
  sub('init')
  sub('body')
  sub('declaration')
  sub('key')
  sub('argument')
  sub('expression')
  sub('callee')
  sub('object')
  sub('property')
  iter('declarations')
  iter('params')
  iter('properties')
  iter('arguments')
}

const isString = (s) => typeof s === 'string'
