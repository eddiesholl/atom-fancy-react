const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const p = require('./path-funcs')

const getProjectRoot = (sourceFile) => {
  const projectPaths = atom.project.getPaths()
  return p.findProjectFor(sourceFile, projectPaths)
}

const getTestFilePath = (sourceFile) => {
  const projectRoot = getProjectRoot(sourceFile)
  return p.sourceFileToTestFile(sourceFile, projectRoot)
}

const ensureFolderExists = (pathToCheck) => {

  if (!fs.existsSync(pathToCheck)) {
    mkdirp.sync(pathToCheck)
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

module.exports = {
  getTestFilePath,
  ensureFolderExists,
  getProjectRoot,
  createComponentFolder
}
