'use babel'

import e from 'estree-builder'

import { searchByType } from '../lib/node-ops'

describe('node-ops', () => {
  describe('searchByType', () => {
    const idChild = { type: 'idChild' }
    const rootNode = {
      type: 'root',
      id: idChild
    }
    it('finds a single node', () => {
      const result = searchByType(rootNode, 'root')
      expect(result).toEqual(rootNode)
    })

    it('does not find something missing', () => {
      const result = searchByType(rootNode, 'missing')
      expect(result).toBeUndefined()
    })

    it('can find a child under id', () => {
      const result = searchByType(rootNode, 'idChild')
      expect(result).toEqual(idChild)
    })
  })
})
