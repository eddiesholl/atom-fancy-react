'use babel'

const acorn = require('acorn-jsx');

const defaultAcornOptions = {
    sourceType: 'module',
    ecmaVersion: 6,
    locations: true,
    plugins: { jsx: true }
}

export const parse = (input) => {
  return acorn.parse(input, defaultAcornOptions)
}
