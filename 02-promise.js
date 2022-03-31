function RPromise(executor) {
  this.onfulfilledFns = []
  this.onrejectedFns = []

  var resolve = function() {

  }
  var reject = function() {

  }

  executor(resolve, reject)
}

Object.defineProperties(RPromise, {
  STATUS_FULFILLED: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'fulfilled'
  },
  STATUS_REJECTED: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'rejected'
  },
  STATUS_PENDING: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'pending'
  }
})

/**
 * 实例方法
 */
RPromise.prototype = {
  then: function(onfulfilled, onrejected) {
    if (typeof onfulfilled !== 'function') {
      throw new TypeError('expect a function')
    }
    if (onrejected && typeof onfulfilled !== 'function') {
      throw new TypeError('expect a function')
    }
  }
}
// 修正构造器
Object.defineProperty(RPromise.prototype, 'constructor', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: RPromise
})

module.exports = RPromise