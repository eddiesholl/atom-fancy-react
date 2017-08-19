const { removeExtension } = require('../path-funcs/path-helpers')

const sameDir = (basePathFuncs, config) => {
  const { testSuffix } = config
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return removeExtension(sourceFileWithinProject) + testSuffix + '.js'
    }
  }
}

module.exports = sameDir
