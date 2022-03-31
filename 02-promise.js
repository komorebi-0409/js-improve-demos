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

  try {
    executor(resolve, reject)
  } catch (err) {
    reject(err)
  }
  
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

function onRPromiseStatusChanged(fn, result, resolve, reject) {
  try {
    resolve(fn(result))
  } catch (err) {
    reject(err)
  }
}

/**
 * 实例方法
 */
RPromise.prototype = {
  then: function(onfulfilled, onrejected) {
    if (typeof onfulfilled !== 'function') {
      onfulfilled = function(res) {
        return res
      }
    }
    if (typeof onrejected !== 'function') {
      onrejected = function(err) {
        throw err
      }
    }
    var _this = this
    return new RPromise(function(resolve, reject) {
      _this.onfulfilledFns.push(function(result) {
        onRPromiseStatusChanged(onfulfilled, result, resolve, reject)
      })
      if (onrejected) {
        _this.onrejectedFns.push(function(reason) {
          onRPromiseStatusChanged(onrejected, reason, resolve, reject)
        })
      }
    })
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