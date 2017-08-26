const t = require('tcomb')

const specificString = (str) => t.refinement(t.String, (s) => s === str)

const ParallelDirs = specificString('ParallelDirs')
const SameDir = specificString('SameDir')
const SubDir = specificString('SubDir')

const TestStructure = t.union([ParallelDirs, SameDir, SubDir])

const Config = t.struct({
  testStructure: TestStructure,
  packagePath: t.String,
  sourcePath: t.String,
  testPath: t.String,
  testSuffix: t.String,
  projectRoot: t.String,
  pkgJson: t.Object
}, 'Config')

const Paths = t.struct({
  packagePath: t.String,
  projectRoot: t.String,
  sourcePath: t.String,
  srcInsideProject: t.String,
  testInsideProject: t.String,
  testPath: t.String
}, 'Paths')

const ComponentGeneration = t.struct({
  content: t.String,
  ast: t.Object,
  componentName: t.String,
  changesToCaller: t.Array
}, 'ComponentGeneration')

module.exports = {
  Config,
  Paths,
  ComponentGeneration
}
