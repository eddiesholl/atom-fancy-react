// 'use babel';
const FancyReactView = require('./fancy-react-view');
const CompositeDisposable = require('atom').CompositeDisposable;
const fs = require('fs');

const pathHelper = require('./path-helper');
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
        console.dir(editor)
        console.log(editor.getDirectoryPath())
        console.log(editor.getFileName())
        console.log(editor.getText())
        const testFilePath = pathHelper.getTestFilePath(editor.getPath())

        if (!fs.existsSync(testFilePath)) {
          pathHelper.ensureFolderExists(testFilePath)
          const testFileContent = testContent.testsFor(editor.getText())
          const fd = fs.openSync(testFilePath, 'w')
          fs.writeFileSync(fd, testFileContent)
        }
        atom.workspace.open(testFilePath)
    }

}

module.exports = new FancyReact();
