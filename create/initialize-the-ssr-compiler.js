'use strict'

//---------//
// Imports //
//---------//

const pify = require('pify')

const MemoryFs = require('memory-fs'),
  path = require('path'),
  webpack = require('webpack')

//
//------//
// Main //
//------//

module.exports = function createInitializeTheClientCompiler({
  handleError,
  updateRenderer,
  webpackConfig,
}) {
  return function initializeTheSsrCompiler() {
    const ssrCompiler = webpack(webpackConfig),
      mfs = new MemoryFs()

    ssrCompiler.outputFileSystem = mfs
    ssrCompiler.watch({}, (err, stats) => {
      if (err) handleError(err)

      stats = stats.toJson()
      if (stats.errors.length) return

      readFileWithFs(mfs, 'vue-ssr-server-bundle.json')
        .then(contents => {
          updateRenderer({ bundle: JSON.parse(contents) })
        })
        .catch(handleError)
    })
  }

  // scoped helper functions

  function readFileWithFs(anFs, fpath) {
    return pify(anFs.readFile.bind(anFs))(
      path.join(webpackConfig.output.path, fpath),
      'utf8'
    )
  }
}
