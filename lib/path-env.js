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
  const dirPathToCheck = path.dirname(pathToCheck)

  if (!fs.existsSync(dirPathToCheck)) {
    mkdirp.sync(dirPathToCheck)
  }
}

module.exports = {
  getTestFilePath,
  ensureFolderExists,
  getProjectRoot
}
