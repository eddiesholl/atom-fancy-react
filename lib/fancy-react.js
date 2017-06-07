// 'use babel';
const CompositeDisposable = require('atom').CompositeDisposable;
const fs = require('fs');

const pathEnv = require('./path-env');
const pathFuncs = require('./path-funcs');
const testContent = require('./test-content');

class FancyReact {

    constructor() {
        this.modalPanel = null;
        this.subscriptions = null;
    }

    activate(state) {
        // this.modalPanel = atom.workspace.addModalPanel({
        //     item: this.fancyReactView.getElement(),
        //     visible: false
        // });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
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

    generate() {
        const editor = atom.workspace.getActivePaneItem()

        const inputFilePath = editor.getPath()
        const projectRoot = pathEnv.getProjectRoot(inputFilePath)
        const inputText = editor.getText()
        const testFilePath = pathFuncs.sourceFileToTestFile(inputFilePath, projectRoot)
        const outputExists = fs.existsSync(testFilePath)
        const outputText = outputExists ? fs.readFileSync(testFilePath) : ''
        const inputModulePath = pathFuncs.sourceFileToModulePath(inputFilePath, projectRoot)
        const testFileContent = testContent.generate(inputText, outputText, inputModulePath)

        if (!fs.existsSync(testFilePath)) {
          pathEnv.ensureFolderExists(testFilePath)
        }

        atom.workspace.open(testFilePath).then(editor => {
          editor.setText(testFileContent)
        })

    }

}

module.exports = new FancyReact();
