'use babel'

const basePathFuncsModule = require('../../lib/path-funcs/base-path-funcs')

const config = {
  testStructure: 'ParallelDirs',
  packagePath: '',
  sourcePath: '',
  testPath: '',
  testSuffix: '',
  projectRoot: '',
  pkgJson: {}
}

const basePathFuncs = basePathFuncsModule(config)

import parallelDirs from '../../lib/test-structure/parallel-dirs'
import sameDir from '../../lib/test-structure/same-dir'
import subDir from '../../lib/test-structure/sub-dir'

const parallelDirsFuncs = parallelDirs(basePathFuncs, config)
const sameDirFuncs = sameDir(basePathFuncs, config)
const subDirFuncs = subDir(basePathFuncs, config)

const allFuncs = {
  parallelDirs: parallelDirsFuncs,
  sameDir: sameDirFuncs,
  subDir: subDirFuncs
}

describe('test-structure api check', () => {
  ['sourceFileWPToTestFileWP', 'testFileWPToSourceFileWP', 'isPathWPTestFile'].forEach(n => {
    it(`includes ${n}`, () => {
      expectAllHave(allFuncs, n)
    })
  })
})

const expectAllHave = (funcDict, funcName) => {
  Object.keys(funcDict).forEach(k => {
    const funcs = funcDict[k]
    const target = funcs[funcName]
    if (!target) {
      fail(`path-funcs-api ${k} has no impl for ${funcName}`)
    }
    if (typeof(target) !== 'function') {
      fail(`path-funcs-api ${k} impl for ${funcName} is not a function`)
    }
  })
}
