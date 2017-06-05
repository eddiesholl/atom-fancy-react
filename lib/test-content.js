'use babel'

const acorn = require('acorn-jsx');
const astring = require('astring').generate;
const e = require('estree-builder');
const R = require('ramda')

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

export const generate = (inputText, outputText, inputModulePath) => {

  if (!inputText) { return '' }

  const ast = acorn.parse(inputText, res.acornOptions)
  const nodes = ast.body
  const namedExports = nodes.filter(byType("ExportNamedDeclaration"))
  // const namedExportNames = namedExports.map(findExportName)

  const namedExportSuiteTrees = suitesFor(namedExports, nodes)
  // REVISIT: Try parsing output and merging trees
  // const existingSuites = []

  const sutNames = noNulls(namedExportSuiteTrees
    .map(t => {
      return t.sut
    }))

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
${res.sutImport([sutNames], inputModulePath)}

${namedExportSuites}`
}

const suitesFor = (namedExports, nodes) => {
  return namedExports.map(ne => suiteFor(ne, nodes))
}

const suiteFor = (namedExportNode, nodes) => {
  console.log('input node')
  // console.dir(namedExportNode)
  // printNode(namedExportNode, 0)
  const varDec = searchByType(namedExportNode, "VariableDeclarator")
  const exportName = varDecName(varDec)
  const classComponentNode = searchBySuperClass(namedExportNode, "Component")
  const hasJsx = searchByType(namedExportNode, "JSXElement")

  if (exportName === 'mapStateToProps') {
    return suiteForMapStateToProps(exportName)
  } else if (classComponentNode) {
    return suiteForClassBased(classComponentNode, nodes)
  } else if (hasJsx) {
    return suiteForJsx(exportName, nodes)
  } else {
    return suiteForBasicFunc(exportName)
  }
}

const suiteForClassBased = (node, nodes) => {
  nodes.map(n => printNode(n))
  console.dir(nodes)
  const className = varDecName(node)
  // console.log('basicFunc')
  const generateResult = e.var(
    'result',
    callFunc('renderComponent', []))
  const expectResult = callFunc('expect', [e.id('result')])
  const checkResult = callFunc(
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
        renderFunc(className, propTypeOutputs),
        itBlock('can render', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: className,
    namedImports: {
      react: ['Component']
    },
    defaultImports: {
      react: 'React'
    }
  }
}

const suiteForJsx = (exportName) => {
  // console.log('jsx')
  const generateResult = e.var('result', callFunc('renderComponent', [e.id(exportName)]))
  const expectResult = callFunc('expect', [e.id('result')])
  const checkResult = callFunc(
    dot(dot(expectResult,'to'), 'deepEqual'), [e.id('result')])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(`render ${exportName}`),
      fn(
        renderFunc(exportName),
        itBlock('can render', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: exportName
  }
}

const suiteForMapStateToProps = (exportName) => {
  // console.log('mapStateToProps')
  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      e.function([], [e.var('result', callFunc(exportName, [e.identifier('state')]))])
    ])

  return {
    suite,
    sut: exportName
  }
}

const suiteForBasicFunc = (exportName) => {
  // console.log('basicFunc')
  const generateResult = e.var('result', callFunc(exportName, []))
  const expectResult = callFunc('expect', [e.id('result')])
  const checkResult = callFunc(
    dot(dot(expectResult,'to'), 'deepEqual'), [e('object-raw', [])])

  const suite = e.call(
    e.identifier('describe'),
    [
      e.string(exportName),
      fn(itBlock('works', [generateResult, checkResult]))
    ])

  return {
    suite,
    sut: exportName
  }
}

const dot = (target, prop) => {
  return e('.', target, e.id(prop))
}

const fn = (...body) => {
  return e.function([], noNulls(body))
}

export const vr = (name, val) => {
  return e.var(e.id(name), val)
}

const callFunc = (callee, args) => {
  return e.call(isString(callee) ? e.identifier(callee) : callee, args || [])
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
  func: () => callFunc(dot(e.id('jest'), 'fn'), [])
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


export const buildBeforeEach = (propDefs) => {
  const mocks = propDefs.map(p => {
      return e('=', e.id(p.mockName), p.mockVal)
    })
  return callFunc('beforeEach', [
    fn(
      ...mocks
    )
  ])
}

export const renderFunc = (name, propTypes) => {
  propTypes = propTypes || []
  const propAssigns = propTypes.map(p => {
    return `${p.propName}={${p.mockName}}`
  }).join(' ')

  return e.function(
    [e.id('props')],
    [
      e('=', e.id('props'), e('||', e.id('props'), e.object())),
      // return render(<Foo a=a, b=b, {...props})
      e.return(
        callFunc(
          'render',
          [e.id(`<${name} ${propAssigns} {...props} />`)]))
    ],
    'renderComponent')
}
export const itBlock = (desc, body) => {
  return callFunc(
    'it',
    [e.string(desc), e.function([], body)])
}

const findExportName = (namedExport) => {
  const varDec = searchByType(namedExport, "VariableDeclarator")
  return varDecName(varDec)
}

//const decName = (e) => e.declaration.name
const varDecName = (vd) => {
  return vd && vd.id && vd.id.name
}

const isString = (s) => typeof s === 'string'

const noNulls = R.reject(R.isNil)
