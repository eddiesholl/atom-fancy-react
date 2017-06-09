'use babel'

const singleNodesToSearch =
  ['declaration', 'id', 'init', 'body', 'expression', 'left', 'right']
const multiNodesToSearch = ['declarations']

export const searchByType = (node, type) => {
  return searchBy(node, byType(type))
}

export const searchBy = (currentNode, tester) => {
  const currentResult = tester(currentNode)
  if (currentResult) {
    // allow testers to return a 'lookahead' node match
    return (typeof(currentResult) === "boolean")
        ? currentNode
        : currentResult
  }

  if (Array.isArray(currentNode)) {
    return currentNode
      .map(n => {
        return searchBy(n, tester)
      })
      .find(hasValue)
  } else {
    const singleMatch = singleNodesToSearch.map(s => {
      const nextChild = currentNode[s]
      if (nextChild) {
        return searchBy(nextChild, tester)
      }
    }).find(hasValue)

    if (singleMatch) {
      // console.log('singleMatch')
      // console.log(type)
      // console.dir(singleMatch)
      return singleMatch
    } else {
      const multiMatch = multiNodesToSearch.map(s => {
        const nextChild = currentNode[s]
        if (nextChild) {
          return nextChild.find(d => {
            return searchBy(d, tester)
          })
        }
      }).find(hasValue)
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

export const searchForPropTypes = (node, componentName) => {
  const tester = (node) => {
    const isAssignment = byType('AssignmentExpression')(node)
    const left = node.left

    if (isAssignment && byType('MemberExpression')(left)) {
      console.log('searching node')
      console.dir(node)
      const subjectName = left.object.name
      const propName = left.property.name

      console.log('sn ' + subjectName)
      console.log('cn ' + componentName)
      console.log('pn ' + propName)
      if (subjectName === componentName && propName === 'propTypes') {
        const isRightObject = byType('ObjectExpression')(node.right)
        return isRightObject && node.right.properties
      }
    }
  }
  return searchBy(node, tester)
}

export const searchByIdName = (node, idName) => {
  const tester = (node) => {
    return node && node.id && node.id.name === idName
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

const hasValue = n => !!n
