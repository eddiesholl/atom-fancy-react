'use babel'

const e = require('estree-builder')
import R from 'ramda'

import { noNulls, isString, mergeArrays, pad } from './utils'

export const buildBeforeEach = (propDefs) => {
  const mocks = propDefs.map(p => {
    return e('=', e.id(p.mockName), p.mockVal)
  })
  return callFn('beforeEach', [
    arrow(
      ...mocks
    )
  ])
}

const space = (c) => R.repeat(' ', c).join('')
const s6 = space(6)
const s8 = space(8)
const propPad = `\n${s8}`

export const buildRenderFunc = (name, propTypes) => {
  propTypes = propTypes || []
  const propAssigns = propTypes.map(p => {
    return `${p.propName}={${p.mockName}}`
  }).join(propPad)
  const propAssignsWithPad = propAssigns ? `${propPad}${propAssigns}${propPad}` : ' '

  return e.function(
    [e.id('props')],
    [
      e('=', e.id('props'), e('||', e.id('props'), e.object())),
      // return render(<Foo a=a, b=b, {...props})
      e.return(
        callFn(
          'shallow',
          [e.id(`
${s6}<${name}${propAssignsWithPad}{...props} />`)]))
    ],
    'renderComponent')
}

export const buildItBlock = (desc, body) => {
  return callFn(
    'it',
    [e.string(desc), e.arrow([], body)])
}

export const buildClass = (className, superClass, methods) => {
  const methodDefs = Object.keys(methods).map(k => {
    const def = methods[k]
    return e.method(k, def)
  })
  return e.class(className, superClass, methodDefs)
}
/*
namedImportMaps = [{
  importPath: ['named1', 'named2']
}]
defaultImportMaps = [{
  importPath: 'defaultItemName'
}]

*/
export const buildImportStmts = (namedImportMaps, defaultImportMaps, exportSuiteTrees) => {
  const imports = {}

  if (exportSuiteTrees) {
    exportSuiteTrees.forEach(t => {
      const sutImports = imports[t.inputModulePath] || {}
      const sutImportsNamed = sutImports.named || []
      if (t.defaultSut) {
        sutImports.default = t.defaultSut
      }
      if (t.namedSut) {
        sutImportsNamed.push(t.namedSut)
        sutImports.named = sutImportsNamed
      }
      if (sutImports.named || sutImports.default) {
        imports[t.inputModulePath] = sutImports
      }
    })
  }

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

export const assign = (left, right) => {
  return e('=', left, right)
}

export const arrow = (...body) => {
  return e.arrow([], noNulls(body))
}

export const fn = (...body) => {
  return e.function([], noNulls(body))
}

export const fnArgs = (args, ...rest) => {
  return e.function(args, noNulls(rest))
}

export const vr = (name, val) => {
  return e.var(e.id(name), val)
}

export const cnst = (name, val) => {
  return e.cnst(e.id(name), val)
}

export const lt = (name, val) => {
  return e.let(e.id(name), val)
}

export const callFn = (callee, args) => {
  return e.call(isString(callee) ? e.identifier(callee) : callee, args || [])
}

export const raw = e.id
