// 'use babel'
const CompositeDisposable = require('atom').CompositeDisposable
const fs = require('fs')

const { loadConfigItems, buildPaths } = require('./config')
const pathEnv = require('./path-env')
const pathFuncs = require('./path-funcs')
const testContent = require('./test-content')
const generateComponent = require('./react-content').generate

class FancyReact {

  constructor() {
    this.subscriptions = null
  }

  activate(/*state*/) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fancy-react:tests': () => this.tests(),
      'fancy-react:generate': () => this.generate(),
      'fancy-react:switch': () => this.switch()
    }))

    this.config = loadConfigItems()
    this.paths = buildPaths(this.config)
    this.pathFuncs = pathFuncs(this.paths, this.config)
    this.pathEnv = pathEnv(this.pathFuncs)

    initModulePaths(this.config.projectRoot)
    const Output = require('./output')
    this.output = new Output(this.config.pkgJson, this.config.projectRoot)
  }

  deactivate() {
    this.subscriptions.dispose()
  }

  serialize() {
    return {
      // fancyReactViewState: this.fancyReactView.serialize()
    }
  }

  tests() {
    const activeEditor = atom.workspace.getActivePaneItem()

    const inputFilePath = activeEditor.getPath()
    const inputText = activeEditor.getText()
    const testFilePath = this.pathFuncs.sourceFileToTestFile(inputFilePath)
    const inputModulePath = this.pathFuncs.sourceFileToModulePath(inputFilePath)

    if (!fs.existsSync(testFilePath)) {
      this.pathEnv.ensureFolderExists(testFilePath)
    }

    atom.workspace.open(testFilePath).then(editor => {
      const existingText = editor.getText()
      const generatedTests = testContent.generate(inputText, existingText, inputModulePath)

      initModulePaths(this.config.projectRoot)

      const formattedContent = this.output.format(
        generatedTests.content,
        testFilePath)
      editor.setText(formattedContent)
    })
  }

  generate() {
    const activeEditor = atom.workspace.getActivePaneItem()

    const inputText = activeEditor.getText()
    const bufferPosition = activeEditor.getCursorBufferPosition()

    const result = generateComponent(inputText, bufferPosition)

    result.matchWith({
      Ok: ({ value }) => {
        const componentDetails = this.pathFuncs.componentDetails(value.componentName)

        if (!fs.existsSync(componentDetails.folderPath)) {
          this.pathEnv.createComponentFolder(componentDetails)
        }

        if (value.changesToCaller) {
          value.changesToCaller.forEach((change, ix) => {
            activeEditor.setCursorScreenPosition(
              { row: change.lineNumber + ix - 1, column: 0 })
            activeEditor.insertNewline()
            activeEditor.moveUp(1)
            activeEditor.insertText(change.content)
          })
        }
        atom.workspace.open(componentDetails.componentPath).then(editor => {
          const formattedContent = this.output.format(
            value.content,
            componentDetails.componentPath
          )
          editor.setText(formattedContent)
        })
      },
      Error: ({ value }) => atom.notifications.addWarning(`Component generation failed: ${value}`)
    })
  }

  switch() {
    const activeEditor = atom.workspace.getActivePaneItem()
    const currentFilePath = activeEditor.getPath()
    const isCurrentFileTest = this.pathFuncs.isPathTestFile(currentFilePath)

    if (isCurrentFileTest) {
      const sourceFilePath = this.pathFuncs.testFileToSourceFile(currentFilePath)

      if (fs.existsSync(sourceFilePath)) {
        atom.workspace.open(sourceFilePath)
      }
      else {
        atom.notifications.addWarning(`The source file ${sourceFilePath} doesn't seem to exist :(`)
      }
    }
    else {
      const testFilePath = this.pathFuncs.sourceFileToTestFile(currentFilePath)

      if (fs.existsSync(testFilePath)) {
        atom.workspace.open(testFilePath)
      }
      else {
        // TODO We could generate here
        atom.notifications.addWarning(`The test file ${testFilePath} doesn't seem to exist :(`)
      }
    }
  }
}

module.exports = new FancyReact()

const initModulePaths = (root) => {
  process.env.NODE_PATH = root + '/node_modules'
  require('module').Module._initPaths()
}
