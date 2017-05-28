const acorn = require('acorn-jsx');

const acornOptions = {
    sourceType: 'module',
    plugins: { jsx: true }
}
const testsFor = (sourceText) => {
  const ast = acorn.parse(sourceText, acornOptions)

  return 'hi tests'
}

module.exports = {
  testsFor
}
