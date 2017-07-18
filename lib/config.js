'use babel'

const R = require('ramda')

const settingsToLoad =
  ["testStructure", "packagePath", "sourcePath", "testPath", "testSuffix"]

const loadConfig = () => {

  const userConfig =
    R.fromPairs(settingsToLoad.map(s => [s, atom.config.get(`fancy-react.${s}`)]))

  const pathFromProject = atom.project.getPaths().shift()
  /*const editor = atom.workspace.getActivePaneItem()
  const pathFromEditor = editor ? pathEnv.getProjectRoot(editor.getPath()) : ''*/
  const projectRoot = pathFromProject //|| pathFromEditor

  let pkgJson = {}

  try {
    pkgJson = require(`${projectRoot}/package.json`);
  } catch (e) {
    atom.log(`Could not load package.json from project folder '${projectRoot}'`)
    pkgJson = {}
  }

  return buildConfig(userConfig, projectRoot, pkgJson.fancyReact)
}

const buildConfig = (userConfig, projectRoot, packageConfig = {}) => {
  const packageConfigItems = R.pick(settingsToLoad, packageConfig)
  const mergedConfig = R.merge(userConfig, packageConfigItems)

  return {
    ...mergedConfig,
    projectRoot
  }
}
module.exports = {
  loadConfig,
  buildConfig
}
