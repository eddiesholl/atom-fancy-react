'use babel'

const singleNodesToSearch = ['declaration', 'id', 'init', 'body']
const multiNodesToSearch = ['declarations']

export const searchByType = (node, type) => {
  return searchBy(node, byType(type))
}

export const searchBy = (node, tester) => {
  if (tester(node)) { return node }

  if (Array.isArray(node)) {
    return node.find(n => {
      searchBy(n, tester)
    })
  } else {
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
}

export const byType = (type) => {
  return (n) => {
    return n.type === type;
  }
}

export const searchBySuperClass = (node, superClassName) => {
  const tester = (node) => {
    const superClass = node.superClass
    return byType("ClassDeclaration")(node) &&
      superClass && superClass.name === superClassName
  }
  return searchBy(node, tester)
}

export const searchForPropTypes = (node) => {
  const tester = (node) => {
    const superClass = node.superClass
    return byType("ClassDeclaration")(node) &&
      superClass && superClass.name === superClassName
  }
  return searchBy(node, tester)
}

export const printNode = (node, depth) => {
  const indent = depth || 0
  if (!node) {
    console.log('undefined :(')
    return
  }
  const pad = Array(indent).fill().map(() => '|\t').join('');
  const nextDepth = indent + 1
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
  console.log(pad + node.type + " " + (node.name || node.value || node.operator || ''))

  const subs = ['id', 'init', 'body', 'declaration', 'key', 'argument',
  'expression', 'callee', 'object', 'property', 'source', 'local',
  'left', 'right', 'value']
  subs.forEach(sub)

  const iters = ['declarations', 'params', 'properties', 'arguments', 'specifiers']
  iters.forEach(iter)
}
