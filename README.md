# fancy-react package

This is an atom plugin designed to accelerate `React` development, by automating common and repetitive tasks inside a typical React project.

# Supported configuration

The current workflows and generated code are built around a few basic assumptions about how the React project is laid out. It is desirable for a wider range of project layouts and packages to be supported in the future. For now it is fairly restrictive.

The current assumptions made are:

- All `React` source code files are located under `client/src`, with corresponding test files located at `client/test`
- Test files are named as `thing.js` -> `thing-test.js`
- Unit test files are using `jest`, `enzyme` and `chai`

# Commands

## `tests`

Start from a source code file containing exported functions and classes, and generate a test file with suites for each export. If the test file doesn't exist, then create it using a sensible path and naming structure. If the file does already exist, then merge any existing tests and suites with the ones that have been generated for you.

![tests](https://github.com/eddiesholl/atom-fancy-react/raw/master/doc/generate-tests.gif "tests")

## `generate`

Start from a snippet of a proposed React component in some jsx somewhere, and generate a skeleton implementation of that new component. The intention is that the component name, and the names of the essential properties passed to the component, can be typed directly in an existing parent, pretending that it already exists. The code generation can then scaffold as much of that new component as possible.

![generate](https://github.com/eddiesholl/atom-fancy-react/raw/master/doc/generate-component.gif "generate")

# Implementation & Dependencies

The plugin makes heavy use of javascript ASTs to process input source code, and to generate output code. Currently the parsing is done using `acorn` and `acorn-jsx`, node construction via `estree-builder`, and generation by `astring`. This is more labor intensive than simple string templates but should allow much richer functionality and opportunity for extension.

# Resources

There is a sample package available at https://github.com/eddiesholl/atom-fancy-react-test that offers an example package structure that works with this plugin, and some sample components to play around with. For example, there are some missing components that can be `generate`d to complete the implementation.

# Future items

## Wider configuration for project structure

There are many conventions and possible structures for how to lay out a `React` project. For example, maybe you store test files next to source files, or in a subfolder, or maybe you use a different naming format.

## Modernise generated code

There are some limitations in the node types currently supported by `estree-builder`. For example, functions are all declared using traditional function syntax, rather than 'fat arrow' style.

## Plugin extension

It should be possible to expose hook points that let others develop plugins that extend this one. For example, other unit test syntax could be provided with, for example, a `fancy-react-jasmine` plugin.

## CLI

There's no reason that these command should only be available within atom. They could be re-exposed by a CLI wrapper that can run outside of atom.
