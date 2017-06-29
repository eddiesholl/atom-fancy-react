'use babel'

const R = require('ramda')

const settingsToLoad =
  ["testStructure", "packagePath", "sourcePath", "testPath", "testSuffix"]

module.exports = () => {

  const userConfig =
    R.fromPairs(settingsToLoad.map(s => [s, atom.config.get(`fancy-react.${s}`)]))

  const pathFromProject = atom.project.getPaths().shift()
  /*const editor = atom.workspace.getActivePaneItem()
  const pathFromEditor = editor ? pathEnv.getProjectRoot(editor.getPath()) : ''*/
  const projectRoot = pathFromProject //|| pathFromEditor

  var pkgConfig = {}

  try {
    var doc = require(`${projectRoot}/package.json`);
    pkgConfig = R.pick(settingsToLoad, doc.fancyReact)
  } catch (e) {
    return userConfig
  }

  const mergedConfig = R.merge(userConfig, pkgConfig)

  return {
    ...mergedConfig,
    projectRoot
  }
}
