const parallelDirs = require('./parallel-dirs')
const sameDir = require('./same-dir')
const subDir = require('./sub-dir')

module.exports = (basePathFuncs, config) => {
  const { testStructure } = config

  switch (testStructure) {
    case 'ParallelDirs':
      return parallelDirs(basePathFuncs, config)

    case 'SameDir':
      return sameDir(basePathFuncs, config)

    case 'SubDir':
      return subDir(basePathFuncs, config)

    default:
      throw `${testStructure} is not a supported test structure`
  }
}
