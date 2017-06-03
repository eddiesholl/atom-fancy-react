// 'use babel';
const FancyReactView = require('./fancy-react-view');
const CompositeDisposable = require('atom').CompositeDisposable;
const fs = require('fs');

const pathEnv = require('./path-env');
const pathFuncs = require('./path-funcs');
const testContent = require('./test-content');

class FancyReact {

    constructor() {
        this.fancyReactView = null;
        this.modalPanel = null;
        this.subscriptions = null;
    }

    activate(state) {
        this.fancyReactView = new FancyReactView(state.fancyReactViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.fancyReactView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'fancy-react:toggle': () => this.toggle(),
            'fancy-react:generate': () => this.generate()
        }));
    }

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.fancyReactView.destroy();
    }

    serialize() {
        return {
            fancyReactViewState: this.fancyReactView.serialize()
        };
    }

    toggle() {
        console.log('FancyReact was toggled!');
        return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
        );
    }

    generate() {
        const editor = atom.workspace.getActivePaneItem()
        // console.dir(editor)
        // console.log(editor.getDirectoryPath())
        // console.log(editor.getFileName())
        // console.log(editor.getText())
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
        //  const fd = fs.openSync(testFilePath, 'w')
        //  fs.writeFileSync(fd, testFileContent)
        }
        atom.workspace.open(testFilePath).then(editor => {
          editor.setText(testFileContent)
        })

    }

}

module.exports = new FancyReact();
