'use strict'

//---------//
// Imports //
//---------//

const createLruCache = require('lru-cache'),
  tedent = require('tedent')

const createInitializeTheClientCompiler = require('./create/initialize-the-client-compiler'),
  createInitializeTheSsrCompiler = require('./create/initialize-the-ssr-compiler'),
  createWatchTheTemplate = require('./create/watch-the-template')

const { assignDefined, readFile, reject } = require('./utils'),
  { createBundleRenderer } = require('vue-server-renderer')

//
//------//
// Main //
//------//

module.exports = function initDevServer({
  directives,
  koaApp,
  koaWebpackOptions,
  webpackConfigs,
  templatePath,
}) {
  if (!clientAndSsrOutputPathsAreEqual(webpackConfigs)) {
    return reject(
      tedent(`
        This module expects the client and ssr webpack configs to contain the
          same 'output.path' properties.  This assumption simplifies the code.

        If your project needs something different then file an issue on
          github so I can understand the use-case and work with you toward
          a fix.'
      `)
    )
  }

  return readFile(templatePath).then(template => {
    return new Promise((resolve, reject) => {
      const watchTheTemplate = getWatchTheTemplate(),
        initializeTheClientCompiler = getInitializeTheClientCompiler(),
        initializeTheSsrCompiler = getInitializeTheSsrCompiler(),
        state = { directives, template }

      try {
        watchTheTemplate()
        initializeTheClientCompiler()
        initializeTheSsrCompiler()
      } catch (e) {
        handleError(e)
      }

      return

      // scoped helper functions

      function handleError(err) {
        if (state.isSettled) {
          // eslint-disable-next-line no-console
          console.error(
            'Error occurred in koa-vue-ssr_init-dev-server\n\n' + err.stack
          )
        } else {
          state.isSettled = true
          reject(err)
        }
      }

      function updateRenderer(updatedState) {
        assignDefined(state, updatedState)

        if (!state.bundle || !state.clientManifest) return

        state.renderer = createBundleRenderer(
          state.bundle,
          Object.assign({}, createDefaultRendererOptions(), {
            clientManifest: state.clientManifest,
            directives: state.directives,
            template: state.template,
          })
        )

        //
        // resolve will only do anything the first time.
        // https://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects
        //
        state.isSettled = true

        resolve({
          koaApp,
          getRenderer: () => state.renderer,
        })
      }

      function getWatchTheTemplate() {
        return createWatchTheTemplate({
          handleError,
          templatePath,
          updateRenderer,
        })
      }

      function getInitializeTheClientCompiler() {
        return createInitializeTheClientCompiler({
          handleError,
          koaApp,
          koaWebpackOptions,
          updateRenderer,
          webpackConfig: webpackConfigs.client,
        })
      }

      function getInitializeTheSsrCompiler() {
        return createInitializeTheSsrCompiler({
          handleError,
          updateRenderer,
          webpackConfig: webpackConfigs.ssr,
        })
      }
    })
  })

  function clientAndSsrOutputPathsAreEqual({ client, ssr }) {
    return client.output.path === ssr.output.path
  }

  function createDefaultRendererOptions() {
    return {
      cache: createLruCache({
        max: 1000,
        maxAge: 1000 * 60 * 15,
      }),
      //
      // doesn't matter whether we use client or ssr output paths as they should
      //   be the same
      //
      basedir: webpackConfigs.client.output.path,
      runInNewContext: false,
    }
  }
}
