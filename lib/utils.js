'use babel'

const R = require('ramda')

export const isString = (s) => typeof s === 'string'

export const noNulls = R.reject(R.isNil)
