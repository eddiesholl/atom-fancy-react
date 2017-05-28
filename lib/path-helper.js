const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const p = require('./pure/paths')

const getTestFilePath = (sourceFile) => {
  console.log('getTestFilePath ' + sourceFile)
  const projectPaths = atom.project.getPaths()
  const projectRoot = p.findProjectFor(sourceFile, projectPaths)
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
  ensureFolderExists
}
