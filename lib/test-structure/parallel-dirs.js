'use babel'
const path = require('path')

const { buildPaths } = require('../config')
const { removeExtension } = require('../path-funcs/path-helpers')

const parallelDirs = (basePathFuncs, config) => {

  const { testSuffix } = config
  const { testInsideProject } = buildPaths(config)

  const flipSrcPathToTestPath = (sourceFileWithinProject) => {
    const sourceFileMinusExt = removeExtension(basePathFuncs.sourcePathWithinSrc(sourceFileWithinProject))

    const pathPieces = [testInsideProject, sourceFileMinusExt, testSuffix, '.js']
    return path.normalize(pathPieces.join(''))
  }

  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return flipSrcPathToTestPath(sourceFileWithinProject)
    }
  }
}

module.exports = parallelDirs
