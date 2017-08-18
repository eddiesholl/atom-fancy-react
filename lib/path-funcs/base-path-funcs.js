const path = require('path')

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

module.exports = (paths, config) => {
  const { packagePath, projectRoot, srcInsideProject, testInsideProject } = paths
  const { sourcePath, testSuffix } = config

  const flipSrcPathToTestPath = (sourceFileWithinProject) => {
    const sourceFileMinusExt = removeExtension(sourcePathWithinSrc(sourceFileWithinProject))

    const pathPieces = [testInsideProject, sourceFileMinusExt, testSuffix, '.js']
    return path.normalize(pathPieces.join(''))
  }

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
    flipSrcPathToTestPath,
    sourcePathWithinSrc,
    moduleName,
    componentDetails
  }
}
