# m.test

[![travis](https://img.shields.io/travis/ivoputzer/m.test.svg?style=flat-square)](https://travis-ci.org/ivoputzer/m.test) [![node-api](https://img.shields.io/node/v/m.test.svg?style=flat-square)](https://nodejs.org/docs/v6.0.0/api) [![npm-version](https://img.shields.io/npm/v/m.test.svg?style=flat-square)](https://www.npmjs.com/package/m.test) [![npm-license](https://img.shields.io/npm/l/m.test.svg?style=flat-square)](https://spdx.org/licenses/MIT) [![npm-package-quality](http://npm.packagequality.com/shield/m.test.svg?style=flat-square)](http://packagequality.com/#?package=m.test) [![standard-js](https://img.shields.io/badge/standard-javascript-yellow.svg?style=flat-square)](http://standardjs.com/)

`wip` test runner from the [m!cro](https://github.com/ivoputzer/m.cro#readme) series (~3kb).

#### install

install [m.test](https://github.com/ivoputzer/m.test) directly from [npm](https://www.npmjs.com) to project's [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies).

```sh
npm install --save-dev m.test
```

#### usage

test files are run by simply passing them to [node](https://nodejs.org). for a given `test/index.js` run the following command to execute the suite:

```sh
node test
```

#### cli

more utilities to run your suites are available through the cli. if no files are given they will be looked up from `./test` recursively.

```sh
m.test [options] [files]
```

when executing suites through the cli `m.test` will be assigned to `global.test` by design. the following line can be omitted:

```javascript
const {test} = require('m.test')
```

further instructions can be accessed via `--help` flag and [man-pages](https://github.com/ivoputzer/m.test/tree/master/man) by executing either `m.test --help` or `man m.test` within your shell.

---

#### basic usage

```javascript
const {ok} = require('assert')

test('it just works!', function () {
  ok(true)
})
```

#### async usage

```javascript
const {ok} = require('assert')

test('it works async too!', function (done) {
  setTimeout(function () {
    ok(true)
    done()
  }, 0)
})

test('done takes a error argument!', function (done) {
  setTimeout(function (err = null) {
    done(err)
  }, 0)
})
```

#### context usage

```javascript
test('can be used as a context', function () {
  test('works!', function (done) {
    done(null)
  })
  test('works!', function (done) {
    done(null)
  })
})
```

#### alias usage

```javascript
const {test: context, test: describe, test: it} = require('m.test')

context('given some context', function () {
  describe('your subject', function () {
    it('just works!', (done) => done(null))
  })
})
```

#### beforeEach afterEach usage

```javascript
test('description', function (done) {
  done(null)
})
beforeEach(done => setup(done))
afterEach(done => teardown(done))
```

it is important to call `beforeEach` and `afterEach` wrap functions after `test` functions themselves. when using wraps within nested suites consider their contextual binding.

```javascript
test('description 1', function () {
  test('description 1.1', Function.prototype)
  test('description 1.2', Function.prototype)
  beforeEach(done => setup(done))
  afterEach(done => teardown(done))
})
test('description 2', function () {
  test('description 2.1', Function.prototype)
  test('description 2.2', Function.prototype)
})
```
_(in the example above hooks would be called for `1.1` e `1.2`)_

---

#### skip modifier

```javascript
test.skip('description', function () {
  // this function will never be called
})
```

the [skip](#skip-modifier) modifier comes with an optional `switch` parameter which may disable the skip behavior according to what is provided.

```javascript
test.skip('description', function () {
  // this test will be skipped on the ci
}, /CI/g.test(process.env.NODE_ENV))
```

[view more](https://github.com/ivoputzer/m.test/tree/master/test)
