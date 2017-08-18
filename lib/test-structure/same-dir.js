const sameDir = (paths, config, basePathFuncs) => {
  return {
    sourceFileWPToTestFileWP: () => {}
  }
}

module.exports = sameDir

const srcPathToTestPathSameDir = (sourceFileWithinProject) => {
  return removeExtension(sourceFileWithinProject) + testSuffix + '.js'
}
