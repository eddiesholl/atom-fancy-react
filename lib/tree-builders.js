'use babel'

const e = require('estree-builder');

import { noNulls, isString } from './utils'

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
          'render',
          [e.id(`<${name}${propAssignsWithPad}{...props} />`)]))
    ],
    'renderComponent')
}

export const buildItBlock = (desc, body) => {
  return callFn(
    'it',
    [e.string(desc), e.function([], body)])
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
