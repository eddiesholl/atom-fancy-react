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

describe('test-content', () => {

  describe('generate', () => {
    it('is empty for invalid cases', () => {
      const result = generate('', null, sampleModulePath)
      expect(result).toEqual('')
    })

    it('handles a single func', () => {
      const result = generate(
        randoFuncInput, null, sampleModulePath)
      expect(result).toEqual(randoFuncOutput)
    })
  })

})
