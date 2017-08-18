const sameDir = (basePathFuncs, config) => {
  return {
    sourceFileWPToTestFileWP: () => {}
  }
}

module.exports = sameDir

const srcPathToTestPathSameDir = (sourceFileWithinProject) => {
  return removeExtension(sourceFileWithinProject) + testSuffix + '.js'
}
