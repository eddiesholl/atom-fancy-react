'use babel'

import e from 'estree-builder'

import {
  vr,
  buildItBlock,
  buildBeforeEach,
  buildRenderFunc
} from '../lib/tree-builders'

import {
  genJs,
  propTypeToMock
} from '../lib/test-content'

describe('tree-builders', () => {
  describe('buildRenderFunc', () => {
    it('works', () => {
      const result = buildRenderFunc('Foo')
      const expected =
`function renderComponent(props) {
  props = props || {}
  return render(<Foo {...props} />);
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
})

const cmp = (ac, exp) => {
  expect(ac).toEqual(exp)
  for (var i = 0; i < ac.length; i++) {
    expect(ac[i]).toEqual(exp[i])
  }
}
