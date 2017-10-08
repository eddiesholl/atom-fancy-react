const trimLeadingFolders = (path, folders) => {
  const interestingFolders = folders.filter(Boolean)

  if (interestingFolders.length === 0) {
    return {
      success: true,
      value: path
    }
  }
  else if (!path) {
    return {
      success: false
    }
  }
  else {
    const foldersHead = interestingFolders[0]
    const foldersTail = interestingFolders.slice(1)
    const cleanPath = path[0] === '/' ? path.slice(1) : path

    const pathHead = cleanPath.slice(0, foldersHead.length)
    const pathTail = cleanPath.slice(foldersHead.length)

    const trimmedAMatch = pathHead === foldersHead
    const fullMatch = pathTail[0] === '/' || pathTail === ''

    if (trimmedAMatch && fullMatch) {
      return trimLeadingFolders(pathTail, foldersTail)
    }
    else {
      return {
        success: false
      }
    }
  }
}

const attachLeadingFolders = (path, folders) => {
  if (folders.length === 0) {
    return path
  }

  const foldersHead = folders[0]
  const foldersTail = folders.slice(1)

  const slashedPath = path[0] === '/' ? path : `/${path}`

  const tailResult = attachLeadingFolders(slashedPath, foldersTail)

  return `/${foldersHead}${tailResult}`

}

module.exports = {
  removeExtension: (path) => path.replace(/\.[^.]+$/, ''),

  trimLeadingFolders,
  attachLeadingFolders
}
