'use babel'


import {
  generate
} from '../lib/test-content'


const sampleModulePath = '/a/b'

const randoFuncInput = `export const randoFunc = (a) => a`
const randoFuncOutput =
`
import { randoFunc } from '${sampleModulePath}'

describe("randoFunc", function () {
  it("works", function () {
    var result = randoFunc();
    expect(result).to.deepEqual({})
  })
})`

const classLegacyPropsInput = `
export class Foo extends Component {
  render() {}
}
Foo.propTypes = { a: PropTypes.string.isRequired, b: PropTypes.object }
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

describe("render Foo", function () {
  var aMockData;
  var bMockData;
  beforeEach(function () {
    aMockData = "aMock"
    bMockData = "bMock"
  })
  function renderComponent(props) {
    props = props || ({})
    return shallow(
      <Foo
        a={aMockData}
        b={bMockData}
        {...props} />);
  }
  it("can render", function () {
    var result = renderComponent();
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
  })

})
