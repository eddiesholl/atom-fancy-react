'use babel'

const astring = require('astring').generate;

export const genJs = (estree) => {
  return astring(estree, { indent: '  ' })
}
export const genJsList = (estreeList) => {
  return estreeList.map(genJs).join('\n')
}
