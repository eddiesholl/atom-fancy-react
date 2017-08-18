'use babel'

/*
const pathFuncs = require('../lib/path-funcs')
const { buildPaths } = require('../lib/config')

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

const pfParallelDirs = pathFuncs(buildPaths(configParallelDirs), configParallelDirs)
const pfSameDir = pathFuncs(buildPaths(configSameDir), configSameDir)
const pfSubDir = pathFuncs(buildPaths(configSubDir), configSubDir)

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
      const result =
        pfParallelDirs.sourceFileToTestFile(projectPath1 + '/client/src/foo/bar.js')
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
        projectPath1 + '/client/src/foo/bar.js')
      expect(result).toEqual(projectPath1 + '/client/src/foo/test/bar-test.js')
    })
  })
})

describe('custom config', () => {
  const customConfig = {
    testStructure: 'SameDir',
    packagePath: 'pp',
    sourcePath: 'sp',
    testPath: 'tp',
    testSuffix: '-ts',
    projectRoot: '/1/2'
  }
  describe('packagePath', () => {
    it('componentDetails', () => {
      const result = pathFuncs(buildPaths(customConfig), customConfig).componentDetails('cn')
      expect(result.folderPath).toEqual('/1/2/pp/sp/components/cn')
    })
  })
})
*/
