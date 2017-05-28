// 'use babel';
const FancyReactView = require('./fancy-react-view');
const CompositeDisposable = require('atom').CompositeDisposable;
const acorn = require('acorn-jsx');
const babylon = require('babylon');

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
        const options = {
            sourceType: 'module',
            plugins: { jsx: true }
        }
        const editor = atom.workspace.getActivePaneItem()
        console.dir(editor)
        console.log(editor.getDirectoryPath())
        console.log(editor.getFileName())
        console.log(editor.getText())
        const ast = acorn.parse(editor.getText(), options)
        console.dir(ast.body)
    }

};

module.exports = new FancyReact();
