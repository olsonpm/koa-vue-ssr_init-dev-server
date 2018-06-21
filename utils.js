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

const getValueAtPath = arrayOfKeys => {
  const allButLastKey = getAllButLast(arrayOfKeys),
    lastKey = last(arrayOfKeys)

  return anObject => {
    if (!anObject) return

    for (const key of allButLastKey) {
      if (anObject[key] === null || typeof anObject[key] !== 'object') {
        return
      }

      anObject = anObject[key]
    }
    return anObject[lastKey]
  }
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

const reject = message => Promise.reject(new Error(message))

//
//------------------//
// Helper Functions //
//------------------//

function getAllButLast(anArray) {
  return anArray.slice(0, -1)
}

function last(anArray) {
  return anArray[anArray.length - 1]
}

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

module.exports = {
  assignDefined,
  getValueAtPath,
  isLaden,
  logError,
  readFile,
  reject,
}
