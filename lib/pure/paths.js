const path = require('path');

const srcInsideProject = '/client/src'
const testInsideProject = '/client/test'
const testFileSuffix = '-test.js'

const findProjectFor = (sourceFile, projectPaths) => {
  const sourceFileNormal = path.normalize(sourceFile)
  return projectPaths
    .map(path.normalize)
    .sort()
    .reverse()
    .find(p => {
      return sourceFileNormal.startsWith(path.normalize(p))
    })
}

const sourceFileToTestFile = (sourceFile, projectRoot) => {
  if (!sourceFile.startsWith(projectRoot)) {
    throw new Error(`Source file ${sourceFile} not part of project ${projectRoot}`)
  }

  const sourceFileWithinProject = sourceFile.slice(projectRoot.length)

  if (!sourceFileWithinProject.startsWith(srcInsideProject)) {
    throw new Error(`Source file ${sourceFileWithinProject} not inside src folder ${srcInsideProject}`)
  }

  const sourceFileWithinSrc = sourceFileWithinProject.slice(srcInsideProject.length)
  const sourceFileMinusExt = sourceFileWithinSrc.replace(/\..+$/, '');

  const pathPieces = [projectRoot, testInsideProject, sourceFileMinusExt, testFileSuffix]
  return path.normalize(pathPieces.join(''))
}

module.exports = {
  findProjectFor,
  sourceFileToTestFile
}
