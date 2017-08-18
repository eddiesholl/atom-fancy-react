const parallelDirs = require('./parallel-dirs')
const sameDir = require('./same-dir')
const subDir = require('./sub-dir')

module.exports = (paths, config, basePathFuncs) => {
  const { testStructure } = config

  switch (testStructure) {
    case 'ParallelDirs':
      return parallelDirs(paths, config, basePathFuncs)

    case 'SameDir':
      return sameDir(paths, config, basePathFuncs)

    case 'SubDir':
      return subDir(paths, config, basePathFuncs)

    default:
      throw `${testStructure} is not a supported test structure`
  }
}
