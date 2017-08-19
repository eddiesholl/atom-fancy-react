'use babel'

const path = require('path')

const testStructureFactory = require('../test-structure/factory')
const basePathFuncsModule = require('./base-path-funcs')

module.exports = (paths, config) => {
  const { projectRoot, srcInsideProject } = paths

  const basePathFuncs = basePathFuncsModule(config)
  const testStructureFuncs = testStructureFactory(basePathFuncs, config)

  const sourceFileToTestFile = (sourceFile) => {
    const sourceFileWithinProject = basePathFuncs.fullPathToProjectPath(sourceFile)

    if (!sourceFileWithinProject.startsWith(srcInsideProject)) {
      throw new Error(`Source file ${sourceFileWithinProject} not inside src folder ${srcInsideProject}`)
    }

    return path.join(
      projectRoot,
      testStructureFuncs.sourceFileWPToTestFileWP(sourceFileWithinProject))
  }

  const testFileToSourceFile = (testFile) => {
    const testFileWithinProject = basePathFuncs.fullPathToProjectPath(testFile)

    return path.join(
      projectRoot,
      testStructureFuncs.testFileWPToSourceFileWP(testFileWithinProject))
  }

  const isPathTestFile = (path) => {
    const pathWithinProject = path.startsWith(projectRoot) ?
      path.slice(projectRoot.length) :
      pathWithinProject

    return testStructureFuncs.isPathWPTestFile(pathWithinProject)
  }

  return {
    ...basePathFuncs,
    ...testStructureFuncs,
    sourceFileToTestFile,
    testFileToSourceFile,
    isPathTestFile
  }
}
