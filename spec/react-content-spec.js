'use babel'

import { importNewComponent } from '../lib/react-content'

describe('react-content', () => {

  describe('importNewComponent', () => {
    const importNode1 = {
      type: 'ImportDeclaration',
      loc: { end: { line: 2 }},
      source: { value: 'sourceFolder/components/Foo/Foo' }
    }
    const importNode2 = {
      type: 'ImportDeclaration',
      loc: { end: { line: 6 }},
      source: { value: 'sourceFolder/components/Bar/Bar' }
    }

    it('does nothing if exists', () => {
      const result = importNewComponent([importNode1], 'Foo', 'sourceFolder')
      expect(result).toEqual([])
    })

    it('adds an import to no imports', () => {
      const result = importNewComponent([], 'Foo', 'sourceFolder')
      expect(result).toEqual([{
        lineNumber: 0,
        content: "import Foo from 'sourceFolder/components/Foo/Foo'"}])
    })

    it('adds an import if missing', () => {
      const result = importNewComponent([importNode2], 'Foo', 'sourceFolder')
      expect(result).toEqual([{
        lineNumber: 7,
        content: "import Foo from 'sourceFolder/components/Foo/Foo'"}])
    })
  })
})
