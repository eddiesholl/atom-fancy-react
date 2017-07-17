const { parse } = require('./acorn')

const { allowUnsafeNewFunction } = require("loophole")

let eslint
allowUnsafeNewFunction(function() {
  eslint = require("eslint")
})

let CLIEngine = eslint.CLIEngine,
  Linter = eslint.Linter,
  SourceCode = eslint.SourceCode

class Eslinter {
  constructor(cwd) {
    this.engine = new CLIEngine({ cwd })
    this.linter = new Linter()
  }

  format(text, filePath) {
    const ast = parse(text)
    const e = this.engine
    let config
    allowUnsafeNewFunction(function() {
      config = e.getConfigForFile(filePath)
    })
    const code = new SourceCode(text, ast)
    const linterResult = this.linter.verifyAndFix(
      code,
      config,
      { filename: filePath })

    return linterResult.output
  }
}

module.exports = Eslinter
