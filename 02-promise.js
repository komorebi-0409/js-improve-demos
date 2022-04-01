function RPromise(executor) {
  this.onfulfilledFns = []
  this.onrejectedFns = []
  this.status = RPromise.STATUS_PENDING
  var _this = this
  
  function resolve (result) {
    // result 是一个 promise 对象或 thenable 的处理
    if (typeof (result && result.then) === 'function') {
      result.then(resolve, reject)
      return
    }

    // 如果状态已经改变 直接不添加任务
    if (_this.status !== RPromise.STATUS_PENDING) {
      return
    }
    // 对于支持的环境，可以使用queueMicrotask
    setTimeout(function() {
      // 应在延时任务内改变状态，否则 then 方法返回的 promise 内永远都不是 pending 状态
      if (_this.status !== RPromise.STATUS_PENDING) {
        return
      }
      _this.status = RPromise.STATUS_FULFILLED
      _this.value = result
      _this.onfulfilledFns.forEach(function(fn) {
        fn(result)
      })
    })
  }
  function reject(reason) {
    if (_this.status !== RPromise.STATUS_PENDING) {
      return
    }
    // 对于支持的环境，可以使用 queueMicrotask 代替 setTimeout
    setTimeout(function() {
      if (_this.status !== RPromise.STATUS_PENDING) {
        return
      }
      _this.status = RPromise.STATUS_REJECTED
      _this.value = reason
      // 如果有错误但是没有处理，那么报错
      if (!_this.onrejectedFns.length) {
        throw new Error('Uncaught (in promise) ' + reason)
      }
      _this.onrejectedFns.forEach(function(fn) {
        fn(reason)
      })
    })
  }

  // 执行 executor, 出错的话进入 rejected 状态
  try {
    executor(resolve, reject)
  } catch (err) {
    reject(err)
  }
  
}

// 定义 promise 的三种状态
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
 * 供 then 调用的方法：当 promise 状态改变时调用
 * @param { function } fn 要执行的函数，应该是 onfulfilled 或 onrejected 中的一个
 * @param { any } result 调用 resolve/reject 时传入的参数
 * @param { resolve } resolve then 方法返回的 promise 的 resolve 对象
 * @param { reject } reject then 方法返回的 promise 的 reject 对象
 */
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
    // 返回一个新的 promise，其状态调用者的回调函数执行状态决定：正常-fulfilled，异常-rejected
    return new RPromise(function(resolve, reject) {
      // 调用 then 方法时，如果 promise 状态已经发生改变，直接调用回调函数
      if (_this.status === RPromise.STATUS_FULFILLED) {
        onRPromiseStatusChanged(onfulfilled, _this.value, resolve, reject)
        return
      }
      if (_this.status === RPromise.STATUS_REJECTED) {
        onRPromiseStatusChanged(onrejected, _this.value, resolve, reject)
        return
      }

      // 保存回调函数，在 promise 状态发生改变时调用
      _this.onfulfilledFns.push(function(result) {
        onRPromiseStatusChanged(onfulfilled, result, resolve, reject)
      })
      _this.onrejectedFns.push(function(reason) {
        onRPromiseStatusChanged(onrejected, reason, resolve, reject)
      })
    })
  },
  catch: function(onrejected) {
    return this.then(undefined, onrejected)
  },
  finally: function(onStatusChanged) {
    return this.then(onStatusChanged, onStatusChanged)
  }
}
// 修正构造器
Object.defineProperty(RPromise.prototype, 'constructor', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: RPromise
})

// 静态方法
var RPromiseStaticMethods = {
  resolve: function(result) {
    return new RPromise(function(resolve) {
      resolve(result)
    })
  },
  reject: function(reason) {
    return new RPromise(function(resolve, reject) {
      reject(reason)
    })
  }
}

for (var method in RPromiseStaticMethods) {
  if (Object.hasOwnProperty.call(RPromiseStaticMethods, method)) {
    RPromise[method] = RPromiseStaticMethods[method]
  }
}

module.exports = RPromise