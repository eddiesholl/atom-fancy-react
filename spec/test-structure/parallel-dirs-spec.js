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
})
