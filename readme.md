## Initialize A Koa/Vue/Ssr Development Server

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [What Is This](#what-is-this)
- [Why Create It](#why-create-it)
- [This Module's Responsibilities](#this-modules-responsibilities)
- [API](#api)
- [Reference](#reference)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### What Is This
This module is basically a cleaned up version of
[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)'s
[setup-dev-server.js](https://github.com/vuejs/vue-hackernews-2.0/blob/master/build/setup-dev-server.js)
which utilizes koa instead of express.  This module is consumed by
[koa-vue-ssr_proof-of-concept](https://github.com/olsonpm/koa-vue-ssr_proof-of-concept),
which again was written using vue-hackernews-2.0 as reference.

### Why Create it
In the hackernews project, the `setup-dev-server.js` file was very complex.  So
when I created my own vue ssr project it was beneficial to isolate that
complexity into its own module.  The intention is to keep the rest of the server
code focused on problems particular to the application.

### This Module's Responsibilities
1. Watches the template html file and updates the vue renderer when modified
2. Connects [koa-webpack](https://github.com/shellscape/koa-webpack) to the koa
   application passing it the client webpack compiler for HMR
3. Attaches a 'done' event handler to the client webpack compiler and updates
   the vue renderer with the new
   [clientManifest](https://ssr.vuejs.org/en/api.html#clientmanifest)
4. Runs the ssr webpack compiler's `watch()` method, updating the renderer
   with the new ssr bundle every pass.
5. Returns a promise that:
   - resolves when both the bundle and clientManifest are created.
   - rejects if there is an error prior to the resolve.  Errors occuring during
     the watch processes after the promise settles will be logged to stderr.

### API

```js
// All arguments are required
initDevServer({
  koaApp: <instanceof Koa>
  webpackConfigs: {
    client: <webpack configuration>
    ssr: <webpack configuration>
  }
  webpackHotClientPort: <integer>
  templatePath: <path to index html file>
})

// resolves to
.then({
  koaApp: <instanceof Koa>
  getRenderer: () => <instanceof BundleRenderer>
})
```

### Reference
- [BundleRenderer](https://ssr.vuejs.org/en/api.html#class-bundlerenderer)
