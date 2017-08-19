'use babel'

const { Config } = require('../../lib/types')

const config = Config({
  testStructure: 'SubDir',
  packagePath: 'pp',
  sourcePath: 's',
  testPath: 'sd',
  testSuffix: '-test',
  projectRoot: 'pr',
  pkgJson: {}
})
const basePathFuncs = require('../../lib/path-funcs/base-path-funcs')(config)
const subDir = require('../../lib/test-structure/sub-dir')(basePathFuncs, config)

describe('sub-dir funcs', () => {
  describe('sourceFileWPToTestFileWP', () => {
    it('can translate from source to test', () => {
      const result = subDir.sourceFileWPToTestFileWP('/pp/s/components/Foo/Foo.js')
      expect(result).toEqual('/pp/s/components/Foo/sd/Foo-test.js')
    })
  })

  describe('testFileWPToSourceFileWP', () => {
    it('can translate from test to source', () => {
      const result = subDir.testFileWPToSourceFileWP('/pp/s/components/Foo/sd/Foo-test.js')
      expect(result).toEqual('/pp/s/components/Foo/Foo.js')
    })
  })

  describe('isPathWPTestFile', () => {
    it('can perform a simple match', () => {
      const result = subDir.isPathWPTestFile('/pp/s/components/Foo/sd/Foo-test.js')
      expect(result).toBe(true)
    })

    it('fails for a source file', () => {
      const result = subDir.isPathWPTestFile('/pp/s/components/Foo/Foo.js')
      expect(result).toBe(false)
    })
  })
})
