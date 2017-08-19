const path = require('path')

const { removeExtension, trimLeadingFolders } = require('../path-funcs/path-helpers')

const subDir = (basePathFuncs, config) => {
  const { testSuffix, packagePath, sourcePath, testPath } = config
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      const srcDir = path.dirname(sourceFileWithinProject)
      const fileName = path.basename(sourceFileWithinProject)
      return path.join(
        srcDir,
        testPath,
        removeExtension(fileName) + testSuffix + '.js')
    },

    isPathWPTestFile: (path) => {
      const trimmedPathResult = trimLeadingFolders(path, [packagePath, sourcePath])
      if (!trimmedPathResult.success) { return false }

      return removeExtension(trimmedPathResult.value).endsWith(testSuffix)
    },

    testFileWPToSourceFileWP: (p) => {
      const fileName = path.basename(p)
      const baseFileName = removeExtension(fileName).slice(0, -testSuffix.length)
      const parentDir = path.dirname(path.dirname(p))

      return `${parentDir}/${baseFileName}.js`
    }
  }
}

module.exports = subDir
