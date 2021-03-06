'use babel'

const { Config } = require('../../lib/types')

const config = Config({
  testStructure: 'SameDir',
  packagePath: 'pp',
  sourcePath: 's',
  testPath: 't',
  testSuffix: '-test',
  projectRoot: 'pr',
  pkgJson: {}
})
const basePathFuncs = require('../../lib/path-funcs/base-path-funcs')(config)
const sameDir = require('../../lib/test-structure/same-dir')(basePathFuncs, config)

describe('same-dir funcs', () => {
  describe('sourceFileWPToTestFileWP', () => {
    it('can translate from source to test', () => {
      const result = sameDir.sourceFileWPToTestFileWP('/pp/s/components/Foo/Foo.js')
      expect(result).toEqual('/pp/s/components/Foo/Foo-test.js')
    })
  })

  describe('testFileWPToSourceFileWP', () => {
    it('can translate from test to source', () => {
      const result = sameDir.testFileWPToSourceFileWP('/pp/s/components/Foo/Foo-test.js')
      expect(result).toEqual('/pp/s/components/Foo/Foo.js')
    })
  })

  describe('isPathWPTestFile', () => {
    it('can perform a simple match', () => {
      const result = sameDir.isPathWPTestFile('/pp/s/components/Foo/Foo-test.js')
      expect(result).toBe(true)
    })

    it('fails for a source file', () => {
      const result = sameDir.isPathWPTestFile('/pp/s/components/Foo/Foo.js')
      expect(result).toBe(false)
    })
  })
})
