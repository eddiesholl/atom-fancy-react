# fancy-react package
![](https://travis-ci.org/eddiesholl/atom-fancy-react.svg?branch=master)

This is an atom plugin designed to accelerate `React` development, by automating common and repetitive tasks inside a typical React project.

Currently it is assumed that unit test files are using `jest`, `enzyme` and `chai`

# Commands

## `tests`

Start from a source code file containing exported functions and classes, and generate a test file with suites for each export. If the test file doesn't exist, then create it using a sensible path and naming structure. If the file does already exist, then merge any existing tests and suites with the ones that have been generated for you.

![tests](https://github.com/eddiesholl/atom-fancy-react/raw/master/doc/generate-tests.gif "tests")

## `generate`

Start from a snippet of a proposed React component in some jsx somewhere, and generate a skeleton implementation of that new component. The intention is that the component name, and the names of the essential properties passed to the component, can be typed directly in an existing parent, pretending that it already exists. The code generation can then scaffold as much of that new component as possible.

![generate](https://github.com/eddiesholl/atom-fancy-react/raw/master/doc/generate-component.gif "generate")

# Package configuration

The current workflows and generated code are built around a few basic assumptions about how the React project is laid out. The set of supported configurations and conventions will be expanding over time.

All configuration items can be set globally using the Atom settings page for `fancy-react`. If you have a React repo that needs some specific configuration, you can include keys inside that repo's `package.json` file, under a `fancyReact` key.

```json
},
"devDependencies": {
  "chai": "^4.0.2",
  "react-dom": "^15.6.1",
  "react-test-renderer": "^15.6.1"
},
"fancyReact": {
  "testStructure": "SubDir",
  "packagePath": "client",
  "sourcePath": "src",
  "testPath": "test",
  "testSuffix": "-test"
}
```
You can see an example config in the [package.json](https://github.com/eddiesholl/atom-fancy-react-test/blob/master/package.json#L43) file for `atom-fancy-react-test`.

The examples here all describe a component defined at `<rootDir>/client/src/components/Foo/Foo.js`.

Currently you need to restart Atom to pick up any changes to settings.

## testStructure
What is the general strategy for storing test files.

- ParallelDirs - The entire src folder is mirrored, and contains all of your tests. For example `client/src/components/Foo/Foo.js` -> `client/test/components/Foo/Foo-test.js`

- SameDir - Every test lives in the same folder as its source file. For example `client/src/components/Foo/Foo.js` -> `client/src/components/Foo/Foo-test.js`

- SubDir - Every test lives in a sub folder of where the source file is. For example `client/src/components/Foo/Foo.js` -> `client/src/components/Foo/test/Foo-test.js`

## packagePath
What is the path within the repo to the start of the react code. For example, `client`
## sourcePath
What is the path within the react root to get to the source files. For example, `src`
## testPath
What is the path within the react root to get to the test files. In `ParallelDirs` mode, for the example above, `test`. This is also a valid value for `SubDir` mode, it will nest test files under their source folder at `test`.
## testSuffix
The suffix to append to the source file name. For example, `-test`.

# Integration

A goal of the project is to 'automagically' detect as much as possible about the patterns and tools of the current project. The current integrations supported are:

 ## eslint
If your project uses `eslint` to enforce syntax requirements, any code generation will try to find local eslint configuration, and use this to 'fix' generated syntax. This is not perfect but will generally do a good match of creating acceptable syntax.

Specifically, this is how it works:
 - check if `eslint` appears in the list of `dependencies` or `devDependencies`
 - if so, spin up an `eslint` instance using http://eslint.org/docs/developer-guide/nodejs-api#cliengine
 - this will be able to respect all of the `.eslintrc` files that may exist in your project
 - the generated code is passed through in `fix` mode. This means that rules can only be respected if they implement a fix

# Resources

There is a sample package available at https://github.com/eddiesholl/atom-fancy-react-test that offers an example package structure that works with this plugin, and some sample components to play around with. For example, there are some missing components that can be `generate`d to complete the implementation.

# Contributing

The success of this package is based on supporting a wide range of dependencies, styles, approaches and package conventions. If your particular configuration is not supported, feel free to open an issue and describe the changes you are looking for. Pull requests are also most welcome!

# Implementation & Dependencies

The plugin makes heavy use of javascript ASTs to process input source code, and to generate output code. Currently the parsing is done using `acorn` and `acorn-jsx`, node construction via `estree-builder`, and generation by `astring`. This is more labor intensive than simple string templates but should allow much richer functionality and opportunity for extension.

# Future items

## Wider configuration for project structure

There are many conventions and possible structures for how to lay out a `React` project. For example, maybe you store test files next to source files, or in a subfolder, or maybe you use a different naming format.

## Modernise generated code

There are some limitations in the node types currently supported by `estree-builder`. For example, functions are all declared using traditional function syntax, rather than 'fat arrow' style.

## Plugin extension

It should be possible to expose hook points that let others develop plugins that extend this one. For example, other unit test syntax could be provided with, for example, a `fancy-react-jasmine` plugin.

## CLI

There's no reason that these command should only be available within atom. They could be re-exposed by a CLI wrapper that can run outside of atom.
