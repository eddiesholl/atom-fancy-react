// 'use babel';
const CompositeDisposable = require('atom').CompositeDisposable;
const fs = require('fs');

const loadConfig = require('./config');
const pathEnv = require('./path-env');
const pathFuncs = require('./path-funcs');
const testContent = require('./test-content');
const genReact = require('./react-content').generate;

class FancyReact {

  constructor() {
    this.modalPanel = null;
    this.subscriptions = null;
  }

  activate(/*state*/) {
    // this.modalPanel = atom.workspace.addModalPanel({
    //     item: this.fancyReactView.getElement(),
    //     visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fancy-react:tests': () => this.tests(),
      'fancy-react:generate': () => this.generate()
    }));

    this.config = loadConfig()
    this.pathFuncs = pathFuncs(this.config)
    this.pathEnv = pathEnv(this.pathFuncs)
  }

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  }

  serialize() {
    return {
      // fancyReactViewState: this.fancyReactView.serialize()
    };
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
      const testFileContent = testContent.generate(inputText, existingText, inputModulePath)
      editor.setText(testFileContent)
    })
  }

  generate() {
    const editor = atom.workspace.getActivePaneItem()

    const inputText = editor.getText()
    const bufferPosition = editor.getCursorBufferPosition()

    const result = genReact(inputText, bufferPosition)

    const componentDetails = this.pathFuncs.componentDetails(result.componentName)

    if (!fs.existsSync(componentDetails.folderPath)) {
      this.pathEnv.createComponentFolder(componentDetails)
    }

    atom.workspace.open(componentDetails.componentPath).then(editor => {
      editor.setText(result.content)
    })
  }
}

module.exports = new FancyReact();
