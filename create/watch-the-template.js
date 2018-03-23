'use strict'

//---------//
// Imports //
//---------//

const path = require('path'),
  sane = require('sane')

const { readFile } = require('../utils')

//
//------//
// Main //
//------//

module.exports = function createWatchTheTemplate({
  handleError,
  templatePath,
  updateRenderer,
}) {
  return function watchTheTemplate() {
    const templateWatcher = sane(path.dirname(templatePath), {
      glob: path.basename(templatePath),
      watchman: true,
    })

    templateWatcher.on('change', (pathRelativeFromDir, dirpath) => {
      const fullPath = path.join(dirpath, pathRelativeFromDir)
      // eslint-disable-next-line no-console
      console.log(`template updated\nfpath: ${fullPath}`)
      readFile(fullPath)
        .then(template => {
          updateRenderer({ template })
        })
        .catch(handleError)
    })
  }
}
