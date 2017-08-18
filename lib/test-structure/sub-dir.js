const path = require('path')

const { removeExtension } = require('../path-funcs/path-helpers')

const subDir = (paths, config, basePathFuncs) => {
  const { testPath } = paths
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
