'use babel'

const singleNodesToSearch = [
  'declaration', 'id', 'init', 'body', 'expression',
  'left', 'right', 'value', 'argument', 'openingElement'
]
const multiNodesToSearch = ['declarations', 'body']

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
      return singleMatch
    } else {
      const multiMatch = multiNodesToSearch.map(s => {
        const nextChild = currentNode[s]
        if (nextChild && nextChild.find) {
          return nextChild.find(d => {
            return searchBy(d, tester)
          })
        }
      }).find(hasValue)

      return multiMatch
    }
  }
}

export const searchByLocation = (node, point) => {
  return searchBy(node, byLocation(point))
}
export const searchByLocationAndType = (node, point, type) => {
  const bl = byLocation(point)
  const bt = byType(type)
  return searchBy(node, (n) => bt(n) && bl(n))
}

const pointAfter = (p, a) => {
  return p && a &&
    ((p.line === a.line && p.column > a.column) || (p.line > a.line))
}

const pointWithin = (p, a, b) => {
  return pointAfter(p, a) && pointAfter(b, p)
}
export const byLocation = (point) => {
  return (n) => {
    if (!point || !n || !n.loc) { return false }
    const start = n.loc.start
    const end = n.loc.end
    return pointWithin(point, start, end)
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
      const subjectName = left.object.name
      const propName = left.property.name

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
    console.log('undefined node :(')
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
