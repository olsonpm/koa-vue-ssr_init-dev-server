'use strict'

//---------//
// Imports //
//---------//

const pify = require('pify')

const pFs = pify(require('fs'))

//
//------//
// Main //
//------//

const assignDefined = (baseObj, obj) => {
  return Object.keys(obj).reduce((result, key) => {
    const val = obj[key]
    return isDefined(val) ? mSet(result, key, val) : result
  }, baseObj)
}

const isLaden = something => {
  return (
    something &&
    (something.length ||
      something.size ||
      (typeof something === 'number' && something > 0) ||
      (typeof something === 'object' && Object.keys(something).length))
  )
}

const logError = err => {
  // eslint-disable-next-line no-console
  console.error(err)
}

const readFile = fpath => pFs.readFile(fpath, 'utf8')

//
//------------------//
// Helper Functions //
//------------------//

function mSet(obj, key, val) {
  obj[key] = val
  return obj
}

function isDefined(something) {
  return something !== undefined
}

//
//---------//
// Exports //
//---------//

module.exports = { assignDefined, isLaden, logError, readFile }
