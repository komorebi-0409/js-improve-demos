function RPromise(executor) {
  this.onfulfilledFns = []
  this.onrejectedFns = []
  this.status = RPromise.STATUS_PENDING
  var _this = this

  var resolve = function(result) {
    if (_this.status !== RPromise.STATUS_PENDING) {
      return
    }
    _this.status = RPromise.STATUS_FULFILLED
    // 对于支持的环境，可以使用queueMicrotask
    setTimeout(function() {
      _this.onfulfilledFns.forEach(function(fn) {
        fn(result)
      })
    })
  }
  var reject = function(reason) {
    if (_this.status !== RPromise.STATUS_PENDING) {
      return
    }
    _this.status = RPromise.STATUS_REJECTED
    // 对于支持的环境，可以使用queueMicrotask
    setTimeout(function() {
      _this.onrejectedFns.forEach(function(fn) {
        fn(reason)
      })
    })
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
    this.onfulfilledFns.push(onfulfilled)
    if (onrejected) {
      this.onrejectedFns.push(onrejected)
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