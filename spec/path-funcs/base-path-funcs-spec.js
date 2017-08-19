'use babel'

const basePathFuncsModule = require('../../lib/path-funcs/base-path-funcs')

const configBase = {
  packagePath: 'client',
  sourcePath: 'src',
  testPath: 'test',
  testSuffix: '-test',
  projectRoot: '/a/b',
  pkgJson: {}
}
const configParallelDirs = { testStructure: 'ParallelDirs', ...configBase }

const projectPath1 = '/a/b'

describe('base-path-funcs with ParallelDirs', () => {

  const pathFuncs = basePathFuncsModule(configParallelDirs)

  describe('findProjectFor', () => {
      it('finds a simple case', () => {
        const result = pathFuncs.findProjectFor('/a/b/foo.txt', [projectPath1])
        expect(result).toEqual(projectPath1)
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
    projectRoot: '/1/2',
    pkgJson: {}
  }

  const pathFuncs = basePathFuncsModule(customConfig)

  describe('packagePath', () => {
    it('componentDetails', () => {
      const result = pathFuncs.componentDetails('cn')
      expect(result.folderPath).toEqual('/1/2/pp/sp/components/cn')
    })
  })
})
