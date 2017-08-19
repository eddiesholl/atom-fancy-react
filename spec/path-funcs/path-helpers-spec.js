const { removeExtension, trimLeadingFolders } = require('../../lib/path-funcs/path-helpers')

describe('removeExtension', () => {
  it('can remove an extension', () => {
    const result = removeExtension('/a/b.foo')
    expect(result).toEqual('/a/b')
  })
})

describe('trimLeadingFolders', () => {
  const subject = '/a/b/c.js'
  describe('successful scenarios', () => {
    it('preserves with no trims', () => {
      const result = trimLeadingFolders(subject, [])
      expect(result.success).toBe(true)
      expect(result.value).toEqual(subject)
    })
    it('processes one trim', () => {
      const result = trimLeadingFolders(subject, ['a'])
      expect(result.success).toBe(true)
      expect(result.value).toEqual('/b/c.js')
    })
    it('processes 2 trims', () => {
      const result = trimLeadingFolders(subject, ['a', 'b'])
      expect(result.success).toBe(true)
      expect(result.value).toEqual('/c.js')
    })
    it('processes 3 trims', () => {
      const result = trimLeadingFolders(subject, ['a', 'b', 'c.js'])
      expect(result.success).toBe(true)
      expect(result.value).toEqual('')
    })
  })
  describe('failed scenarios', () => {
    it('first match doesnt exist', () => {
      const result = trimLeadingFolders(subject, ['d'])
      expect(result.success).toBe(false)
    })
  })
})
