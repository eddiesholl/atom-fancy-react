'use babel'
const path = require('path')

const { buildPaths } = require('../config')
const { removeExtension, trimLeadingFolders, attachLeadingFolders } = require('../path-funcs/path-helpers')

const parallelDirs = (basePathFuncs, config) => {

  const { testSuffix } = config
  const { testInsideProject, packagePath, testPath, sourcePath } = buildPaths(config)

  const flipSrcPathToTestPath = (sourceFileWithinProject) => {
    const sourceFileMinusExt = removeExtension(basePathFuncs.sourcePathWithinSrc(sourceFileWithinProject))

    const pathPieces = [testInsideProject, sourceFileMinusExt, testSuffix, '.js']
    return path.normalize(pathPieces.join(''))
  }

  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return flipSrcPathToTestPath(sourceFileWithinProject)
    },

    isPathWPTestFile: (p) => {
      const trimmedPathResult = trimLeadingFolders(p, [packagePath, testPath])
      if (!trimmedPathResult.success) { return false }

      return removeExtension(trimmedPathResult.value).endsWith(testSuffix)
    },

    testFileWPToSourceFileWP: (p) => {
      const trimmedPathResult = trimLeadingFolders(p, [packagePath, testPath])
      const baseFile = removeExtension(trimmedPathResult.value).slice(0, -testSuffix.length)
      const baseFilePlusPrefix = attachLeadingFolders(baseFile, [packagePath, sourcePath])

      return `${baseFilePlusPrefix}.js`
    }
  }
}

module.exports = parallelDirs
