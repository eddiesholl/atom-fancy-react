'use babel'

import pathFuncs from '../lib/path-funcs'

const configBase = {
  packagePath: 'client',
  sourcePath: 'src',
  testPath: 'test',
  testSuffix: '-test',
  projectRoot: '/a/b'
}
const configParallelDirs = { testStructure: 'ParallelDirs', ...configBase }
const configSameDir = { testStructure: 'SameDir', ...configBase }
const configSubDir = { testStructure: 'SubDir', ...configBase }

const pfParallelDirs = pathFuncs(configParallelDirs)
const pfSameDir = pathFuncs(configSameDir)
const pfSubDir = pathFuncs(configSubDir)

const projectPath1 = '/a/b'

describe('path-funcs with ParallelDirs', () => {

  describe('findProjectFor', () => {
      it('finds a simple case', () => {
        const result = pfParallelDirs.findProjectFor('/a/b/foo.txt', [projectPath1])
        expect(result).toEqual(projectPath1)
      })
  }),

  describe('sourceFileToTestFile', () => {
    it('can translate a simple source file', () => {
      const result = pfParallelDirs.sourceFileToTestFile(
        projectPath1 + '/client/src/foo/bar.js',
        projectPath1)
      expect(result).toEqual(projectPath1 + '/client/test/foo/bar-test.js')
    })
  })
})

describe('paths with SameDir', () => {
  describe('sourceFileToTestFile', () => {
    it('can translate a simple source file', () => {
      const result = pfSameDir.sourceFileToTestFile(
        projectPath1 + '/client/src/foo/bar.js',
        projectPath1)
      expect(result).toEqual(projectPath1 + '/client/src/foo/bar-test.js')
    })
  })
})

describe('paths with SubDir', () => {
  describe('sourceFileToTestFile', () => {
    it('can translate a simple source file', () => {
      const result = pfSubDir.sourceFileToTestFile(
        projectPath1 + '/client/src/foo/bar.js',
        projectPath1)
      expect(result).toEqual(projectPath1 + '/client/src/foo/test/bar-test.js')
    })
  })
})
