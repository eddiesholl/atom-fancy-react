'use babel'

const { Config } = require('../../lib/types')

const config = Config({
  testStructure: 'ParallelDirs',
  packagePath: 'pp',
  sourcePath: 's',
  testPath: 't',
  testSuffix: '-test',
  projectRoot: 'pr',
  pkgJson: {}
})
const basePathFuncs = require('../../lib/path-funcs/base-path-funcs')(config)
const parallelDirs = require('../../lib/test-structure/parallel-dirs')(basePathFuncs, config)

describe('parallel-dirs funcs', () => {
  describe('sourceFileWPToTestFileWP', () => {
    it('can translate from source to test', () => {
      const result = parallelDirs.sourceFileWPToTestFileWP('/pp/s/components/Foo/Foo.js')
      expect(result).toEqual('/pp/t/components/Foo/Foo-test.js')
    })
  })

  describe('testFileWPToSourceFileWP', () => {
    it('can translate from test to source', () => {
      const result = parallelDirs.testFileWPToSourceFileWP('/pp/t/components/Foo/Foo-test.js')
      expect(result).toEqual('/pp/s/components/Foo/Foo.js')
    })
  })

  describe('isPathWPTestFile', () => {
    it('can perform a simple match', () => {
      const result = parallelDirs.isPathWPTestFile('/pp/t/components/Foo/Foo-test.js')
      expect(result).toBe(true)
    })

    it('fails for a source file', () => {
      const result = parallelDirs.isPathWPTestFile('/pp/s/components/Foo/Foo.js')
      expect(result).toBe(false)
    })
  })
})
