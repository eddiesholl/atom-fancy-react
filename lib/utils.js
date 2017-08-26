'use babel'

const R = require('ramda')

export const isString = (s) => typeof s === 'string'

export const noNulls = R.reject(R.isNil)

export const mergeArrays = (...arrays) => {
  return R.compose(R.uniq, R.flatten)(arrays)
}

export const pad = (thing, suffix) => thing ? ` ${thing}${suffix || ''} ` : ' '

export const validComponentName = (name) => {
  if (name.length === 0) {
    return false
  }
  const first = name[0]
  return first.toUpperCase() === first
}
