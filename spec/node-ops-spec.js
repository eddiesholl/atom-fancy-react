'use babel'

import e from 'estree-builder'

import {
  searchByType,
  searchForPropTypes,
  searchByLocationAndType
} from '../lib/node-ops'

describe('node-ops', () => {
  describe('searchByLocationAndType', () => {
    const insideFindMe = {
      type: 'JSXElement',
      name: { name: 'insideFindMe' },
      loc: { start: { column: 5, line: 6 }, end: { column: 8, line: 6 }}}
    const findMe = {
      type: 'JSXElement',
      name: { name: 'findMe' },
      children: [insideFindMe],
      loc: { start: { column: 5, line: 5 }, end: { column: 5, line: 7 }}}
    const siblingOfFindMe = {
      type: 'JSXElement',
      name: { name: 'siblingOfFindMe' },
      loc: { start: { column: 5, line: 8 }, end: { column: 5, line: 9 }}}
    const parent = {
      type: 'JSXElement',
      name: { name: 'parent' },
      children: [findMe, siblingOfFindMe],
      loc: { start: { column: 5, line: 4 }, end: { column: 5, line: 10 }}}

    it('can find a jsx node within a jsx tree', () => {
      const result = searchByLocationAndType(
        parent, { line: 5, column: 6 },
        'JSXElement'
      )
      expect(result).toEqual(findMe)
    })

    it('can find a fully nested jsx node', () => {
      const result = searchByLocationAndType(
        parent, { line: 6, column: 6 },
        'JSXElement'
      )
      expect(result).toEqual(insideFindMe)
    })

    it('can find a nested jsx node on the closing tag', () => {
      const result = searchByLocationAndType(
        parent, { line: 7, column: 4 },
        'JSXElement'
      )
      expect(result).toEqual(findMe)
    })
  })

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

  describe('searchForPropTypes', () => {
    const propTypeProperties = [{
      type: 'Property'
    }]
    const propTypeAssignment = {
      type: 'AssignmentExpression',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Class'
        },
        property: {
          type: 'Identifier',
          name: 'propTypes'
        }
      },
      right: {
        type: 'ObjectExpression',
        properties: propTypeProperties
      }
    }

    it('works', () => {
      const result = searchForPropTypes(propTypeAssignment, 'Class')
      expect(result).toEqual(propTypeProperties)
    })
  })
})
