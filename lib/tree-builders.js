'use babel'

const e = require('estree-builder');

import { noNulls, isString, mergeArrays, pad } from './utils'

export const buildBeforeEach = (propDefs) => {
  const mocks = propDefs.map(p => {
      return e('=', e.id(p.mockName), p.mockVal)
    })
  return callFn('beforeEach', [
    fn(
      ...mocks
    )
  ])
}

export const buildRenderFunc = (name, propTypes) => {
  propTypes = propTypes || []
  const propAssigns = propTypes.map(p => {
    return `${p.propName}={${p.mockName}}`
  }).join(' ')
  const propAssignsWithPad = propAssigns ? ` ${propAssigns} ` : ' '

  return e.function(
    [e.id('props')],
    [
      e('=', e.id('props'), e('||', e.id('props'), e.object())),
      // return render(<Foo a=a, b=b, {...props})
      e.return(
        callFn(
          'shallow',
          [e.id(`<${name}${propAssignsWithPad}{...props} />`)]))
    ],
    'renderComponent')
}

export const buildItBlock = (desc, body) => {
  return callFn(
    'it',
    [e.string(desc), e.function([], body)])
}

export const buildImportStmts = (exportSuiteTrees) => {

  const namedImportMaps = noNulls(exportSuiteTrees
    .map(t => t.namedDepImports))
  const defaultImportMaps = noNulls(exportSuiteTrees
    .map(t => t.defaultDepImports))

  const imports = {}

  exportSuiteTrees.forEach(t => {
    const sutImports = imports[t.inputModulePath] || {}
    if (t.defaultSut) {
      sutImports.default = t.defaultSut
    }
    if (t.namedSut) {
      sutImports.named = t.defaultSut
    }
     if (sutImports.named || sutImports.default) {
       imports[t.inputModulePath] = sutImports
     }
  })

  namedImportMaps.forEach(curr => {
    Object.keys(curr).forEach(k => {
      const namedList = curr[k]
      const existing = imports[k] || { named: [] }
      const prevList = existing.named || []
      existing.named = mergeArrays(namedList, prevList)
      imports[k] = existing
    })
  })

  defaultImportMaps.forEach(curr => {
    Object.keys(curr).forEach(k => {
      const defaultName = curr[k]
      const existing = imports[k] || {}
      existing.default = defaultName
      imports[k] = existing
    })
  })

  const importStmts = Object.keys(imports).map(p => {
    const i = imports[p]
    const named = i.named
    const namedBrackets = named ? `{ ${named.join(', ')} } ` : ''
    const def = pad(i.default, named ? ',' : '')
    return e.id(`import${def}${namedBrackets}from '${p}'`)
  })

  return importStmts
}

export const dot = (target, prop) => {
  return e('.', target, e.id(prop))
}

export const fn = (...body) => {
  return e.function([], noNulls(body))
}

export const vr = (name, val) => {
  return e.var(e.id(name), val)
}

export const callFn = (callee, args) => {
  return e.call(isString(callee) ? e.identifier(callee) : callee, args || [])
}
