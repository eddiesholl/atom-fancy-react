const { allowUnsafeNewFunction } = require("loophole")

let eslint
allowUnsafeNewFunction(function() {
  eslint = require("eslint")
})

let CLIEngine = eslint.CLIEngine,
  Linter = eslint.Linter

class Eslinter {
  constructor(cwd) {
    this.engine = new CLIEngine({ cwd })
    this.linter = new Linter()
  }

  format(text, filePath) {
    const e = this.engine
    let config
    allowUnsafeNewFunction(function() {
      config = e.getConfigForFile(filePath)
    })
    const linterResult = this.linter.verifyAndFix(
      text,
      config
    )

    return linterResult.output
  }
}

module.exports = Eslinter
