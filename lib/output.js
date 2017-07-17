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
    return this.linter ?
      this.linter.format(text, fileName) :
      text
  }
}

module.exports = Output
