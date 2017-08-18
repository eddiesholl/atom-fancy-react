'use babel'

const parallelDirs = (basePathFuncs) => {
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return basePathFuncs.flipSrcPathToTestPath(sourceFileWithinProject)
    }
  }
}

module.exports = parallelDirs
