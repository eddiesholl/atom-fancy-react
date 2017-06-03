'use babel'

const singleNodesToSearch = ['declaration', 'id', 'init', 'body']
const multiNodesToSearch = ['declarations']

export const searchByType = (node, type) => {
  return searchBy(node, byType(type))
}

export const searchBy = (node, tester) => {
  if (tester(node)) { return node }

  const singleMatch = singleNodesToSearch.map(s => {
    const nextChild = node[s]
    if (nextChild) {
      return searchBy(nextChild, tester)
    }
  }).find(n => !!n)

  if (singleMatch) {
    // console.log('singleMatch')
    // console.log(type)
    // console.dir(singleMatch)
    return singleMatch
  } else {
    const multiMatch = multiNodesToSearch.map(s => {
      const nextChild = node[s]
      if (nextChild) {
        return nextChild.find(d => {
          return searchBy(d, tester)
        })
      }
    }).find(n => !!n)
    // console.log('multiMatch')
    // console.log(type)
    // console.dir(multiMatch)
    return multiMatch
  }
}

export const byType = (type) => {
  return (n) => {
    return n.type === type;
  }
}

export const printNode = (node, depth) => {
  depth = depth || 0
  if (!node) {
    console.log('undefined :(')
    return
  }
  const pad = Array(depth).fill().map(() => '|\t').join('');
  const nextDepth = depth + 1
  const sub = (s) => {
    const next = node[s]
    if (next) {
      if(next.forEach) {
        console.log(pad + s + ':')
        next.forEach(n => printNode(n, nextDepth))
      } else {
        console.log(pad + s + ':')
        printNode(next, nextDepth)
      }
    }
  }
  const iter = (s) => {
    if (node[s]) {
      console.log(pad + s + ':')
      node[s].forEach(n => printNode(n, nextDepth))
    }
  }
  console.log(pad + node.type + " " + (node.name || ''))
  sub('id')
  sub('init')
  sub('body')
  sub('declaration')
  sub('key')
  sub('argument')
  sub('expression')
  sub('callee')
  sub('object')
  sub('property')
  iter('declarations')
  iter('params')
  iter('properties')
  iter('arguments')
}
