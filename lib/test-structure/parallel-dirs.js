'use babel'

const parallelDirs = (paths, config, basePathFuncs) => {
  return {
    sourceFileWPToTestFileWP: (sourceFileWithinProject) => {
      return basePathFuncs.flipSrcPathToTestPath(sourceFileWithinProject)
    }
  }
}

module.exports = parallelDirs
