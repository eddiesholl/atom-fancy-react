'use babel'


import e from 'estree-builder'

import { generate, itBlock, genJs, renderFunc } from '../lib/test-content'


const sampleModulePath = '/a/b'

const randoFuncInput = `export const randoFunc = (a) => a`
const randoFuncOutput =
`
import { randoFunc } from '${sampleModulePath}'

describe("randoFunc", function () {})`

describe('test-content', () => {

  describe('generate', () => {
    it('is empty for invalid cases', () => {
      const result = generate('', null, sampleModulePath)
      expect(result).toEqual('')
    })

  //   it('handles a single func', () => {
  //     const result = generate(
  //       randoFuncInput, null, sampleModulePath)
  //     expect(result).toEqual(randoFuncOutput)
  //   })
  })

  describe('renderFunc', () => {
    it('works', () => {
      const result = renderFunc('Foo')
      expect(genJs(result)).toEqual(
`function renderComponent(props) {
  props = props || {}
  return render(<Foo ...props />);
}`)
    })
  })


  describe('itBlock', () => {
    it('works', () => {
      const result = itBlock('desc', [e.string('body')])
      const expected =
`it("desc", function () {
  "body"
})`
      cmp(genJs(result), expected)
    })
  })
})

const cmp = (ac, exp) => {
  for (var i = 0; i < ac.length; i++) {
    expect(ac[i]).toEqual(exp[i])
  }
}
