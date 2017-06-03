'use babel'

export const acornOptions = {
    sourceType: 'module',
    ecmaVersion: 6,
    plugins: { jsx: true }
}

export const reactEnzymeChaiHeader =
`import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
`

export const sutImport = ( names, path, def ) => {
  const defSnippet = def ? `${def}, ` : ''
  const namesSnippet = names.join(', ')

  return `import ${defSnippet}{ ${namesSnippet} } from '${path}'`
}
