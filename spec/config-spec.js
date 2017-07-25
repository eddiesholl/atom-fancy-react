'use babel'

import { buildConfig } from '../lib/config'

describe('config', () => {

  describe('buildConfig', () => {
    const testUserConfig = { testStructure: 'b' }
    const testPackageConfig = { fancyReact: { testStructure: 'c' } }
    const testProjectRoot = '/a/b'

    it('can merge basic config', () => {
      const result = buildConfig(testUserConfig, testProjectRoot)
      expect(result.testStructure).toEqual('b')
      expect(result.projectRoot).toEqual(testProjectRoot)
    })

    it('can merge package config', () => {
      const result = buildConfig(testUserConfig, testProjectRoot, testPackageConfig)
      expect(result.testStructure).toEqual('c')
    })
  })
})
