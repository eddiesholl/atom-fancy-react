const path = require('path')

const { buildPaths } = require('../config')
const { removeExtension } = require('./path-helpers')

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

module.exports = (config) => {
  const { packagePath, projectRoot, srcInsideProject } = buildPaths(config)
  const { sourcePath } = config

  const fullPathToProjectPath = (sourceFile) => {
    if (!sourceFile.startsWith(projectRoot)) {
      throw new Error(`Source file ${sourceFile} not part of project ${projectRoot}`)
    }

    return sourceFile.slice(projectRoot.length)
  }

  const sourceFileToModulePath = (sourceFile) => {
    const sourceFileWithinProject = fullPathToProjectPath(sourceFile)
    return 'src' + removeExtension(sourcePathWithinSrc(sourceFileWithinProject))
  }

  const sourcePathWithinSrc = (sourceFileWithinProject) => {
    return sourceFileWithinProject.slice(srcInsideProject.length)
  }

  const moduleName = path.basename

  const componentDetails = (componentName) => {
    const folderPath = `${projectRoot}/${packagePath}/${sourcePath}/components/${componentName}`
    const componentPath = `${folderPath}/${componentName}.js`
    const stylesPath = `${folderPath}/${componentName}.scss`

    return {
      projectRoot: projectRoot,
      componentName,
      folderPath,
      componentPath,
      stylesPath
    }
  }

  return {
    findProjectFor,
    fullPathToProjectPath,
    sourceFileToModulePath,
    sourcePathWithinSrc,
    moduleName,
    componentDetails
  }
}
