'use babel'

import { parse } from '../lib/acorn'

const classDef = `
class Foo extends Bar {
  static propTypes = { a: 'b' }

  render() {}
}`
describe('acorn', () => {

  describe('parse', () => {
      it('can process a Class', () => {
        const parser = () => parse(classDef)
        expect(parser).not.toThrow()
      })
  })
})
