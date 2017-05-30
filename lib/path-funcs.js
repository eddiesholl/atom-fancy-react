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
  const sourceFileWithinProject = fullPathToProjectPath(sourceFile, projectRoot)

  if (!sourceFileWithinProject.startsWith(srcInsideProject)) {
    throw new Error(`Source file ${sourceFileWithinProject} not inside src folder ${srcInsideProject}`)
  }

  const sourceFileMinusExt = removeExtension(sourcePathWithinSrc(sourceFileWithinProject))

  const pathPieces = [projectRoot, testInsideProject, sourceFileMinusExt, testFileSuffix]
  return path.normalize(pathPieces.join(''))
}

const removeExtension = (path) =>  path.replace(/\..+$/, '')

const fullPathToProjectPath = (sourceFile, projectRoot) => {
  if (!sourceFile.startsWith(projectRoot)) {
    throw new Error(`Source file ${sourceFile} not part of project ${projectRoot}`)
  }

  return sourceFile.slice(projectRoot.length)
}

const sourceFileToModulePath = (sourceFile, projectRoot) => {
  const sourceFileWithinProject = fullPathToProjectPath(sourceFile, projectRoot)
  return 'src' + removeExtension(sourcePathWithinSrc(sourceFileWithinProject))
}

const sourcePathWithinSrc = (sourceFileWithinProject) => {
    return sourceFileWithinProject.slice(srcInsideProject.length)
}

const moduleName = path.basename

module.exports = {
  findProjectFor,
  sourceFileToTestFile,
  fullPathToProjectPath,
  sourceFileToModulePath,
  sourcePathWithinSrc,
  moduleName
}
