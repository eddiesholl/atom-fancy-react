const acorn = require('acorn-jsx');
const astring = require('astring').generate;
const e = require('estree-builder');

const res = require('./test-content-resources')
const pathFuncs = require('./path-funcs')

const testsFor = (sourceText, pathToInput) => {
  const moduleName = pathFuncs.moduleName(pathToInput)
  const ast = acorn.parse(sourceText, res.acornOptions)

  const nodes = ast.body;

//  const defaultExport = nodes.find(byType("ExportDefaultDeclaration"))
  const namedExports = nodes.filter(byType("ExportNamedDeclaration"))
  const namedExportNames = namedExports.map(findExportName)

  //defName = defaultExport ? decName(defaultExport) : null

  nodes.forEach(n => {
    console.dir(n)
  })

  const namedExportSuites = suitesFor(namedExports, moduleName)



  /*const describeDefaultExport =
    astring(e.call(
      e.identifier('describe'),
      [
        e.string(decName(defaultExport)),
        e.function([], [])
      ]))*/

  return `${res.reactEnzymeChaiHeader}

${res.sutImport([namedExportNames], pathToInput)}

${namedExportSuites.join('\n')}

`
}

const suitesFor = (namedExports, moduleName) => {
  return namedExports.map(suiteFor, moduleName)
}

const suiteFor = (namedExport, moduleName) => {
  const varDec = searchByType(namedExport, "VariableDeclarator")
  const exportName = varDecName(varDec)
  return astring(
    e.call(
      e.identifier('describe'),
      [
        e.string(exportName),
        e.function([], [])
      ]))
}

module.exports = {
  testsFor,
  suitesFor
}

const findExportName = (namedExport) => {
  const varDec = searchByType(namedExport, "VariableDeclarator")
  return varDecName(varDec)
}

const decName = (e) => e.declaration.name
const varDecName = (vd) => vd.id.name

const byType = (type) => {
  return (n) => {
    return n.type === type;
  }
}

const searchByType = (node, type) => {
  if (byType(type)(node)) { return node }

  if (node.declaration) {
    return searchByType(node.declaration, type)
  }
  else if (node.declarations) {
    return node.declarations.find(d => {
      return searchByType(d, type)
    })
  }
}
