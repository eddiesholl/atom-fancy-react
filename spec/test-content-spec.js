'use babel'

import e from 'estree-builder'

import {
  generate,
  processPropTypes,
  jestMockFn
} from '../lib/test-content'


const genRequiredProp = (name, type) => {
  return {
    key: { value: name },
    value: {
      property: { name: 'isRequired' },
      object: { property: { name: type } }
    }
  }
}

const genOptionalProp = (name, type) => {
  return {
    key: { value: name },
    value: {
      property: { name: type }
    }
  }
}

const sampleModulePath = '/a/b'

const randoFuncInput = `export const randoFunc = (a) => a`
const randoFuncOutput =
`
import { randoFunc } from '${sampleModulePath}'

describe("randoFunc", () => {
  it("works", () => {
    const result = randoFunc();
    expect(result).to.deepEqual({})
  })
})`

const classLegacyPropsInput = `
export class Foo extends Component {
  render() {}
}
Foo.propTypes = { a: PropTypes.string.isRequired, b: PropTypes.object }
`
const connectedClassInput = `
export class Foo extends Component {
  render() {}
}
Foo.propTypes = { a: PropTypes.string.isRequired, b: PropTypes.object }

const mapStateToProps = () => {}
export default connect(mapStateToProps)(Foo)
`
const classStaticPropsInput = `
export class Foo extends Component {
  static propTypes = { a: PropTypes.string.isRequired, b: PropTypes.object }
  render() {}
}`
const classOutput = `
import { Foo } from '/a/b'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import React from 'react'

describe("render Foo", () => {
  let aMockData;
  let bMockData;
  beforeEach(() => {
    aMockData = "aMockValue"
    bMockData = {}
  })
  function renderComponent(props) {
    props = props || ({})
    return shallow(
      <Foo
        a={aMockData}
        b={bMockData}
        {...props} />);
  }
  it("can render", () => {
    const result = renderComponent();
    expect(result).to.deep.equal(result)
  })
})`
describe('test-content', () => {

  describe('generate', () => {
    it('is empty for invalid cases', () => {
      const result = generate('', null, sampleModulePath)
      expect(result.content).toEqual('')
    })

    it('handles a single func', () => {
      const result = generate(
        randoFuncInput, null, sampleModulePath)
      expect(result.content).toEqual(randoFuncOutput)
    })

    it('works with a component class', () => {
      const result = generate(classLegacyPropsInput, null, sampleModulePath)
      expect(result.content).toEqual(classOutput)
    })

    it('works with a component class with static properties', () => {
      const result = generate(classStaticPropsInput, null, sampleModulePath)
      expect(result.content).toEqual(classOutput)
    })

    it('works with a connected class', () => {
      const result = generate(connectedClassInput, null, sampleModulePath)
      expect(result.content).toEqual(classOutput)
    })
  })

  describe('processPropTypes', () => {
    const requiredString = genRequiredProp('requiredString', 'string')
    const requiredObject = genRequiredProp('requiredObject', 'object')
    const requiredFunc = genRequiredProp('requiredFunc', 'func')
    const requiredNumber = genRequiredProp('requiredNumber', 'number')

    const optionalString = genOptionalProp('optionalString', 'string')
    const optionalObject = genOptionalProp('optionalObject', 'object')
    const optionalFunc = genOptionalProp('optionalFunc', 'func')
    const optionalNumber = genOptionalProp('optionalNumber', 'number')

    describe('when no props are passed', () => {
      it('returns no mocks', () => {
        const result = processPropTypes([])

        expect(result).toEqual([])
      })
    })

    describe('when strings are passed', () => {
      let result,
          first, second
      beforeEach(() => {
        result = processPropTypes([requiredString, optionalString])
        first = result[0]
        second = result[1]
      })

      it('mocks a required string', () => {
        expect(first.propName).toEqual('requiredString')
        expect(first.mockVal).toEqual(e.string('requiredStringMockValue'))
      })

      it('mocks an optional string', () => {
        expect(second.propName).toEqual('optionalString')
        expect(second.mockVal).toEqual(e.string('optionalStringMockValue'))
      })
    })

    describe('when objects are passed', () => {
      let result,
          first, second
      beforeEach(() => {
        result = processPropTypes([requiredObject, optionalObject])
        first = result[0]
        second = result[1]
      })

      it('mocks a required object', () => {
        expect(first.propName).toEqual('requiredObject')
        expect(first.mockVal).toEqual(e.object())
      })

      it('mocks an optional object', () => {
        expect(second.propName).toEqual('optionalObject')
        expect(second.mockVal).toEqual(e.object())
      })
    })

    describe('when funcs are passed', () => {
      let result,
          first, second
      beforeEach(() => {
        result = processPropTypes([requiredFunc, optionalFunc])
        first = result[0]
        second = result[1]
      })

      it('mocks a required func', () => {
        expect(first.propName).toEqual('requiredFunc')
        expect(first.mockVal).toEqual(jestMockFn)
      })

      it('mocks an optional func', () => {
        expect(second.propName).toEqual('optionalFunc')
        expect(second.mockVal).toEqual(jestMockFn)
      })
    })

    describe('when numbers are passed', () => {
      let result,
          first, second
      beforeEach(() => {
        result = processPropTypes([requiredNumber, optionalNumber])
        first = result[0]
        second = result[1]
      })

      it('mocks a required number', () => {
        expect(first.propName).toEqual('requiredNumber')
        expect(first.mockVal).toEqual(e.number(1))
      })

      it('mocks an optional number', () => {
        expect(second.propName).toEqual('optionalNumber')
        expect(second.mockVal).toEqual(e.number(1))
      })
    })
  })
})
