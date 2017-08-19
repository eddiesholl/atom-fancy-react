const { removeExtension, trimLeadingFolders } = require('../path-funcs/path-helpers')

const sameDir = (basePathFuncs, config) => {
  const { testSuffix, packagePath, sourcePath } = config
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return removeExtension(sourceFileWithinProject) + testSuffix + '.js'
    },

    isPathWPTestFile: (p) => {
      const trimmedPathResult = trimLeadingFolders(p, [packagePath, sourcePath])
      if (!trimmedPathResult.success) { return false }

      return removeExtension(trimmedPathResult.value).endsWith(testSuffix)
    },

    testFileWPToSourceFileWP: (p) => {
      const baseFile = removeExtension(p).slice(0, -testSuffix.length)

      return `${baseFile}.js`
    }
  }
}

module.exports = sameDir
