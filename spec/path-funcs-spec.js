'use babel'

import paths from '../lib/path-funcs'
const pathsParallelDirs = paths({
  testStructure: 'ParallelDirs',
  packagePath: 'client',
  sourcePath: 'src',
  testPath: 'test',
  testSuffix: '-test',
  projectRoot: '/a/b'
})

const projectPath1 = '/a/b'

describe('paths with ParallelDirs', () => {

  describe('findProjectFor', () => {
      it('finds a simple case', () => {
        const result = pathsParallelDirs.findProjectFor('/a/b/foo.txt', [projectPath1])
        expect(result).toEqual(projectPath1)
      })
  }),

  describe('sourceFileToTestFile', () => {
    it('can translate a simple source file', () => {
      const result = pathsParallelDirs.sourceFileToTestFile(
        projectPath1 + '/client/src/foo/bar.js',
        projectPath1)
      expect(result).toEqual(projectPath1 + '/client/test/foo/bar-test.js')
    })
  })
})
