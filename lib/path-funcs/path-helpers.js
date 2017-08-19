const trimLeadingFolders = (path, folders) => {
  if (folders.length === 0) {
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
    const foldersHead = folders[0]
    const foldersTail = folders.slice(1)
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

module.exports = {
  removeExtension: (path) => path.replace(/\..+$/, ''),

  trimLeadingFolders
}
