const path = require('path');

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

  const srcInsideProject = path.join('/' + config.packagePath, config.sourcePath)
  const testInsideProject = path.join('/' + config.packagePath, config.testPath)

  const flipSrcPathToTestPath = (sourceFileWithinProject) => {
    const sourceFileMinusExt = removeExtension(sourcePathWithinSrc(sourceFileWithinProject))

    const pathPieces = [testInsideProject, sourceFileMinusExt, config.testSuffix, '.js']
    return path.normalize(pathPieces.join(''))
  }

  const srcPathToTestPathSameDir = (sourceFileWithinProject) => {
    return removeExtension(sourceFileWithinProject) + config.testSuffix + '.js'
  }

  const srcPathToTestPathSubDir = (sourceFileWithinProject) => {
    const srcDir = path.dirname(sourceFileWithinProject)
    const fileName = path.basename(sourceFileWithinProject)
    return path.join(
      srcDir,
      config.testPath,
      removeExtension(fileName) + config.testSuffix + '.js')
  }

  const sourceFileToTestFile = (sourceFile) => {
    const sourceFileWithinProject = fullPathToProjectPath(sourceFile)

    if (!sourceFileWithinProject.startsWith(srcInsideProject)) {
      throw new Error(`Source file ${sourceFileWithinProject} not inside src folder ${srcInsideProject}`)
    }

    var testFile
    switch (config.testStructure) {
      case 'ParallelDirs':
        testFile = flipSrcPathToTestPath(sourceFileWithinProject)
        break;

      case 'SameDir':
        testFile = srcPathToTestPathSameDir(sourceFileWithinProject)
        break;

      case 'SubDir':
        testFile = srcPathToTestPathSubDir(sourceFileWithinProject)
        break;

      default:
        throw `${config.testStructure} is not supported test structure`
    }

    return path.join(config.projectRoot, testFile)
  }

  const removeExtension = (path) =>  path.replace(/\..+$/, '')

  const fullPathToProjectPath = (sourceFile) => {
    if (!sourceFile.startsWith(config.projectRoot)) {
      throw new Error(`Source file ${sourceFile} not part of project ${config.projectRoot}`)
    }

    return sourceFile.slice(config.projectRoot.length)
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
    const folderPath = `${config.projectRoot}/client/src/components/${componentName}`
    const componentPath = `${folderPath}/${componentName}.js`
    const stylesPath = `${folderPath}/${componentName}.scss`

    return {
      projectRoot: config.projectRoot,
      componentName,
      folderPath,
      componentPath,
      stylesPath
    }
  }

  return {
    findProjectFor,
    sourceFileToTestFile,
    fullPathToProjectPath,
    sourceFileToModulePath,
    sourcePathWithinSrc,
    moduleName,
    componentDetails
  }
}
