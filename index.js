process.setMaxListeners(0)
process.once('beforeExit', next)
const queue = []
exports.test = (label, fn) => push({label, fn})
exports.test.skip = (label, fn, doSkip = true) => push({
  label,
  fn: doSkip ? Function.prototype : fn
})
exports.test.timeout = (label, fn, ms, doTimeout = true) => push({
  label,
  fn (done, timeoutError = null) {
    try {
      const error = new Error(`TimeoutError: ${ms}ms exceeded.`)
      const timeout = setTimeout(doTimeout ? done : Function.prototype, ms, error)
      fn((err) => {
        clearTimeout(timeout)
        if (!timeout._called || !doTimeout) done(err)
      })
      if (fn.length === 0) done(null)
    } catch (err) {
      done(err)
    }
  }
})
exports.beforeEach = (before, {assign} = Object) => {
  queue.map(context => {
    const fn = context.fn
    return assign(context, {
      fn (done) {
        try {
          before()
          fn(done)
          if (fn.length === 0) done(null)
        } catch (err) {
          done(err)
        }
      }
    })
  })
}
exports.afterEach = (after, {assign} = Object) => {
  queue.map(context => {
    const fn = context.fn
    return assign(context, {
      fn (done) {
        try {
          fn((err) => {
            try {
              after(() => done(err))
              if (after.length === 0) done(err)
            } catch (err) {
              done(err)
            }
          })
          if (fn.length === 0) {
            try {
              after(done)
              if (after.length === 0) done(null)
            } catch (err) {
              done(err)
            }
          }
        } catch (err) {
          done(err)
        }
      }
    })
  })
}
function push () {
  queue.push(...arguments)
}
function next () {
  if (queue.length === 0) return
  const {fn, done} = shift(queue)
  const handle = trap(done)
  try {
    queue.length = 0
    fn(handle)
    if (fn.length === 0) handle(null)
  } catch (err) {
    handle(err)
  }
  function trap (done) {
    process.once('uncaughtException', done)
    return (err = null) => {
      process.removeListener('uncaughtException', done)
      done(err)
    }
  }
}
function shift ([context, ...pending]) {
  const {elapsed} = timerFor(context)
  return {
    done (err) {
      const indent = indentFor(context)
      if (queue.length > 0) { // context
        console.log('%s%s', indent, context.label)
      } else { // test
        if (err) {
          process.exitCode = 1
          console.log('%s\x1b[31m✘\x1b[0m %s (%dms)', indent, context.label, elapsed())
          if (err.name) {
            console.log('  %s\x1b[31m%s\x1b[0m', indent, err.name, err.message)
            console.error(err.stack.toString().split('\n').splice(1).join('\n'))
          } else {
            console.log('  %s%s', indent, err)
          }
        } else {
          if (context.fn === Function.prototype) {
            console.log('%s- %s', indent, context.label)
          } else {
            console.log('%s\x1b[32m✔\x1b[0m %s (%dms)', indent, context.label, elapsed())
          }
        }
      }
      queue.forEach(bindTo(context))
      push(...pending)
      next(err)
    },
    fn: context.fn
  }
}
function indentFor (context, length = 0) {
  if (context.parent === undefined) {
    return Array.from({length}).fill('  ').join('')
  }
  return indentFor(context.parent, ++length)
}
function bindTo (parent, {assign} = Object) {
  return (context) => assign(context, {parent})
}
function timerFor (context, initial = Date.now()) {
  return {
    elapsed () {
      return Date.now() - initial
    }
  }
}
