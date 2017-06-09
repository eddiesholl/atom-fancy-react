// 'use babel';
const CompositeDisposable = require('atom').CompositeDisposable;
const fs = require('fs');

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
        const editor = atom.workspace.getActivePaneItem()

        const inputFilePath = editor.getPath()
        const projectRoot = pathEnv.getProjectRoot(inputFilePath)
        const inputText = editor.getText()
        const testFilePath = pathFuncs.sourceFileToTestFile(inputFilePath, projectRoot)
        const inputModulePath = pathFuncs.sourceFileToModulePath(inputFilePath, projectRoot)

        if (!fs.existsSync(testFilePath)) {
          pathEnv.ensureFolderExists(testFilePath)
        }

        atom.workspace.open(testFilePath).then(editor => {
          const existingText = editor.getText()
          const testFileContent = testContent.generate(inputText, existingText, inputModulePath)
          editor.setText(testFileContent)
        })
    }

    generate() {
      const editor = atom.workspace.getActivePaneItem()

      const inputFilePath = editor.getPath()
      const projectRoot = pathEnv.getProjectRoot(inputFilePath)
      const inputText = editor.getText()
      const bufferPosition = editor.getCursorBufferPosition()
      console.dir(bufferPosition)

      console.log(inputText)
      const result = genReact(inputText, bufferPosition)
      console.dir(result)

    }

}

module.exports = new FancyReact();
