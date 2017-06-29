const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = (pathFuncs) => {
  const getProjectRoot = (sourceFile) => {
    const projectPaths = atom.project.getPaths()
    return pathFuncs.findProjectFor(sourceFile, projectPaths)
  }

  const getTestFilePath = (sourceFile) => {
    const projectRoot = getProjectRoot(sourceFile)
    return pathFuncs.sourceFileToTestFile(sourceFile, projectRoot)
  }

  const ensureFolderExists = (pathToCheck) => {
    const dirPath = path.extname(pathToCheck) ? path.dirname(pathToCheck) : pathToCheck
    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath)
    }
  }

  const ensureFileExists = (pathToCheck) => {

    if (!fs.existsSync(pathToCheck)) {
      fs.closeSync(fs.openSync(pathToCheck, 'w'))
    }
  }

  const createComponentFolder = (componentDetails) => {
    ensureFolderExists(componentDetails.folderPath)
    ensureFileExists(componentDetails.stylesPath)
    ensureFileExists(componentDetails.componentPath)
  }

  return {
    getTestFilePath,
    ensureFolderExists,
    getProjectRoot,
    createComponentFolder
  }
}
