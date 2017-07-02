'use babel'

import { importNewComponent } from '../lib/react-content'

describe('react-content', () => {

  describe('importNewComponent', () => {
    const importNode1 = {
      type: 'ImportDeclaration',
      loc: { end: { line: 2 }},
      source: { value: 'src/components/Foo/Foo' }
    }
    const importNode2 = {
      type: 'ImportDeclaration',
      loc: { end: { line: 6 }},
      source: { value: 'src/components/Bar/Bar' }
    }

    it('does nothing if exists', () => {
      const result = importNewComponent([importNode1], 'Foo')
      expect(result).toEqual([])
    })

    it('adds an import to no imports', () => {
      const result = importNewComponent([], 'Foo')
      expect(result).toEqual([{
        lineNumber: 0,
        content: "import Foo from 'src/components/Foo/Foo'"}])
    })

    it('adds an import if missing', () => {
      const result = importNewComponent([importNode2], 'Foo')
      expect(result).toEqual([{
        lineNumber: 7,
        content: "import Foo from 'src/components/Foo/Foo'"}])
    })
  })
})
