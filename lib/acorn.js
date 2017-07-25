'use babel'

let acorn = require('acorn')
let injectAcornJsx = require('acorn-jsx/inject')
let injectAcornStaticClassPropertyInitializer = require('acorn-static-class-property-initializer/inject')
let injectAcornObjectSpreadJsx = require('acorn-object-spread/inject')
injectAcornJsx(acorn)
injectAcornStaticClassPropertyInitializer(acorn)
injectAcornObjectSpreadJsx(acorn)

const defaultAcornOptions = {
  sourceType: 'module',
  ecmaVersion: 6,
  locations: true,
  plugins: { jsx: true, staticClassPropertyInitializer: true, objectSpread: true }
}

export const parse = (input) => {
  let comments = [], tokens = []
  const result = acorn.parse(
    input,
    {
      ...defaultAcornOptions,
      ranges: true,
      onComment: comments,
      onToken: tokens
    })

  return {
    ...result,
    tokens,
    comments
  }
}
