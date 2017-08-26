const Eslinter = require('./eslinter')

class Output {
  constructor(pkgJson, projectRoot) {
    if (pkgJson && (
      (pkgJson.dependencies && pkgJson.dependencies['eslint']) ||
      (pkgJson.devDependencies && pkgJson.devDependencies['eslint']))) {
      this.linter = new Eslinter(projectRoot)
    }
  }

  format(text, fileName) {
    try {
      return this.linter ?
        this.linter.format(text, fileName) :
        text
    }
    catch (e) {
      atom.notifications.addWarning(`Failed to format output: ${e.message}`)

      return text
    }
  }
}

module.exports = Output
