'use babel'

import e from 'estree-builder'

import {
  vr,
  buildItBlock,
  buildBeforeEach,
  buildRenderFunc,
  buildImportStmts
} from '../lib/tree-builders'

import {
  genJs,
  genJsList
} from '../lib/js-gen'
import {
  propTypeToMock
} from '../lib/test-content'

describe('tree-builders', () => {
  describe('buildRenderFunc', () => {
    it('works', () => {
      const result = buildRenderFunc('Foo')
      const expected =
`function renderComponent(props) {
  props = props || ({})
  return shallow(
      <Foo {...props} />);
}`
  // expect(genJs(result)).toEqual(
      cmp(genJs(result), expected)
    })
  })


  describe('buildItBlock', () => {
    it('works', () => {
      const result = buildItBlock('desc', [e.string('body')])
      const expected =
`it("desc", function () {
  "body"
})`
      cmp(genJs(result), expected)
    })
  })

  describe('buildBeforeEach', () => {
    it('works', () => {
      const result = buildBeforeEach([])
      const expected =
`beforeEach(function () {})`
      cmp(genJs(result), expected)
    })

    it('assigns to props', () => {
      const result = buildBeforeEach([{
        propName: 'f',
        mockName: 'fMock',
        mockVar: vr('fMock'),
        mockVal: propTypeToMock['func']()
      },
      {
        propName: 's',
        mockName: 'sMock',
        mockVar: vr('sMock'),
        mockVal: e.string('sMock')
      }])
      const expected =
`beforeEach(function () {
  fMock = jest.fn()
  sMock = "sMock"
})`
      cmp(genJs(result), expected)
    })
  })

  describe('buildImportStmts', () => {
    it('handles empty imports', () => {
      const result = buildImportStmts([], [])
      expect(genJsList(result)).toEqual('')
    })

    it('handles a named import', () => {
    //  const result = buildImportStmts([{ 'src/foo': ['named'] }], [])
      const input = [{ 'src/foo': ['named'] }]
      const result = buildImportStmts(input, [])
      expect(genJsList(result)).toEqual(`import { named } from 'src/foo'`)
    })

    it('handles a default import', () => {
      const input = [{ 'src/foo': 'Default' }]
      const result = buildImportStmts([], input)
      const expected = `import Default from 'src/foo'`
      expect(genJsList(result)).toEqual(expected)
      cmp(genJsList(result), expected)
    })
  })
})

const cmp = (ac, exp) => {
  expect(ac).toEqual(exp)
  for (var i = 0; i < ac.length; i++) {
    expect(ac[i]).toEqual(exp[i])
  }
}
