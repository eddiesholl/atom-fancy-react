'use babel'

var acorn = require('acorn');
var injectAcornJsx = require('acorn-jsx/inject');
var injectAcornStaticClassPropertyInitializer = require('acorn-static-class-property-initializer/inject');
injectAcornJsx(acorn);
injectAcornStaticClassPropertyInitializer(acorn);

const defaultAcornOptions = {
  sourceType: 'module',
  ecmaVersion: 6,
  locations: true,
  plugins: { jsx: true, staticClassPropertyInitializer: true }
}

export const parse = (input) => {
  return acorn.parse(input, defaultAcornOptions)
}
