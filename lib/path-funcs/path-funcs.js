const path = require('path')

const testStructureFactory = require('../test-structure/factory')
const basePathFuncsModule = require('./base-path-funcs')

module.exports = (paths, config) => {
  const { projectRoot, srcInsideProject } = paths

  const basePathFuncs = basePathFuncsModule(paths, config)
  const testStructureFuncs = testStructureFactory(paths, config, basePathFuncs)

  const sourceFileToTestFile = (sourceFile) => {
    const sourceFileWithinProject = basePathFuncs.fullPathToProjectPath(sourceFile)

    if (!sourceFileWithinProject.startsWith(srcInsideProject)) {
      throw new Error(`Source file ${sourceFileWithinProject} not inside src folder ${srcInsideProject}`)
    }

    return path.join(
      projectRoot,
      testStructureFuncs.sourceFileWPToTestFileWP(sourceFileWithinProject))
  }

  return {
    ...basePathFuncs,
    ...testStructureFuncs,
    sourceFileToTestFile
  }
}
