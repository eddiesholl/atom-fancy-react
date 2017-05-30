'use babel'

import paths from '../lib/path-funcs'

const projectPath1 = '/a/b'
const projectPath2 = '/c/d'

describe('paths', () => {

  describe('findProjectFor', () => {
      it('finds a simple case', () => {
        const result = paths.findProjectFor('/a/b/foo.txt', [projectPath1])
        expect(result).toEqual(projectPath1)
      })
  }),

  describe('sourceFileToTestFile', () => {
    it('can translate a simple source file', () => {
      const result = paths.sourceFileToTestFile(
        projectPath1 + '/client/src/foo/bar.js',
        projectPath1)
      expect(result).toEqual(projectPath1 + '/client/test/foo/bar-test.js')
    })
  })
})
