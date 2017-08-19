const path = require('path')

const { buildPaths } = require('../config')
const { removeExtension } = require('../path-funcs/path-helpers')

const subDir = (basePathFuncs, config) => {
  const { testPath } = buildPaths(config)
  const { testSuffix } = config
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      const srcDir = path.dirname(sourceFileWithinProject)
      const fileName = path.basename(sourceFileWithinProject)
      return path.join(
        srcDir,
        testPath,
        removeExtension(fileName) + testSuffix + '.js')
    }
  }
}

module.exports = subDir
