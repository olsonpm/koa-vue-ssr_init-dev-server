'use strict'

//---------//
// Imports //
//---------//

const pify = require('pify')

const koaWebpack = require('koa-webpack'),
  path = require('path'),
  webpack = require('webpack')

const { isLaden, logError } = require('../utils')

//
//------//
// Main //
//------//

module.exports = function createInitializeTheClientCompiler({
  handleError,
  koaApp,
  koaWebpackOptions,
  updateRenderer,
  webpackConfig,
}) {
  return function initializeTheClientCompiler() {
    webpackConfig.output.filename = '[name].js'
    webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin())

    const clientCompiler = webpack(webpackConfig),
      opts = getKoaWebpackOpts(clientCompiler, koaWebpackOptions)

    return koaWebpack(opts).then(koaWebpackMiddleware => {
      const { devMiddleware: webpackDevMiddleware } = koaWebpackMiddleware

      koaApp.use(koaWebpackMiddleware)

      clientCompiler.plugin('done', stats => {
        stats = stats.toJson()
        stats.errors.forEach(logError)
        stats.warnings.forEach(logError)
        if (isLaden(stats.errors)) return

        readFileWithFs(
          webpackDevMiddleware.fileSystem,
          'vue-ssr-client-manifest.json'
        )
          .then(manifestContent => {
            updateRenderer({ clientManifest: JSON.parse(manifestContent) })
          })
          .catch(handleError)
      })
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

//
//------------------//
// Helper Functions //
//------------------//

function getKoaWebpackOpts(compiler, koaWebpackOptions = {}) {
  const { devMiddleware, hotClient = {} } = koaWebpackOptions

  return {
    compiler,
    hotClient,
    devMiddleware: Object.assign({ serverSideRender: true }, devMiddleware),
  }
}
