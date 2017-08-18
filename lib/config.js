'use babel'

const R = require('ramda')
const path = require('path')

const { Config } = require('./types')

const settingsToLoad =
  ["testStructure", "packagePath", "sourcePath", "testPath", "testSuffix"]

const loadConfigItems = () => {

  const userConfig =
    R.fromPairs(settingsToLoad.map(s => [s, atom.config.get(`fancy-react.${s}`)]))

  const pathFromProject = atom.project.getPaths().shift()
  /*const editor = atom.workspace.getActivePaneItem()
  const pathFromEditor = editor ? pathEnv.getProjectRoot(editor.getPath()) : ''*/
  const projectRoot = pathFromProject //|| pathFromEditor

  let pkgJson = {}

  try {
    pkgJson = require(`${projectRoot}/package.json`)
  } catch (e) {
    atom.log(`Could not load package.json from project folder '${projectRoot}'`)
    pkgJson = {}
  }

  return buildConfig(userConfig, projectRoot, pkgJson)
}

const buildConfig = (userConfig, projectRoot, pkgJson = {}) => {
  const packageConfigItems = R.pick(settingsToLoad, pkgJson.fancyReact || {})
  const mergedConfig = R.merge(userConfig, packageConfigItems)

  return {
    ...mergedConfig,
    projectRoot,
    pkgJson
  }
}

const buildPaths = (configItems) => {
  Config(configItems)
  return {
    packagePath: configItems.packagePath,
    projectRoot: configItems.projectRoot,
    sourcePath: configItems.sourcePath,
    srcInsideProject: path.join('/' + configItems.packagePath, configItems.sourcePath),
    testInsideProject: path.join('/' + configItems.packagePath, configItems.testPath),
    testPath: configItems.testPath
  }
}
module.exports = {
  loadConfigItems,
  buildPaths,
  buildConfig
}
