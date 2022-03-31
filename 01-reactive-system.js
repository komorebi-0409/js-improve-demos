let currentDependency = null // 利用外部变量做到 addDependency 时不需要关心添加的依赖是什么，而由 watchEffect控制
class DependenciesController {
  constructor() {
    this.dependencies = new Set()
  }
  /**
   * 收集依赖（每次收集一个函数，和watchEffect挂钩）
   */
  addDependency() {
    if (currentDependency) {
      this.dependencies.add(currentDependency)
    }
  }
  /**
   * 触发依赖
   */
  notify() {
    this.dependencies.forEach(fn => fn())
  }
}


const dependenciesMap = new WeakMap() // 用于存放所有的依赖

function getDependenciesController(target, property){
  let propertyMap = dependenciesMap.get(target)
  if (!propertyMap) {
    propertyMap = new Map()
    dependenciesMap.set(target, propertyMap)
  }
  let dc = propertyMap.get(property)
  if (!dc) {
    dc = new DependenciesController()
    propertyMap.set(property, dc)
  }
  return dc
}

function watchEffect(fn){
  currentDependency = fn
  currentDependency()
  currentDependency = null
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, property) {
      const dc = getDependenciesController(target, property)
      dc.addDependency()
      return Reflect.get(target, property)
    },
    set(target, property, value) {
      Reflect.set(target, property, value)
      const dc = getDependenciesController(target, property)
      dc.notify()
    }
  })
}

module.exports = {
  reactive,
  watchEffect
}