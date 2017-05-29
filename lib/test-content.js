const acorn = require('acorn-jsx');
const astring = require('astring').generate;
const e = require('estree-builder');

const acornOptions = {
    sourceType: 'module',
    plugins: { jsx: true }
}
const testsFor = (sourceText) => {
  const ast = acorn.parse(sourceText, acornOptions)

  const nodes = ast.body;

  const defaultExport = nodes.find(byType("ExportDefaultDeclaration"))
  const namedExports = nodes.filter(byType("ExportNamedDeclaration"))

  nodes.forEach(n => {
    console.dir(n)
  })

  console.log(astring(e.identifier('id')))
  console.log(astring(e.call(e.identifier('describe'), [e.string(5)])))

  const describeDefaultExport =
    astring(e.call(
      e.identifier('describe'),
      [
        e.string(defaultExport.declaration.name),
        e.function([], [])
      ]))

  return describeDefaultExport
}

module.exports = {
  testsFor
}

const byType = (type) => {
  return (n) => {
    return n.type === type;
  }
}

const desc = (name)
