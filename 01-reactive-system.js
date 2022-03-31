class DependenciesController {
  constructor() {
    this.dependencies = new Set()
  }
  /**
   * 收集依赖（每次收集一个函数，和watchEffect挂钩）
   */
  addDependency() {

  }
  /**
   * 触发依赖
   */
  notify() {

  }
}


const dependenciesMap = new WeakMap() // 用于存放所有的依赖

function watchEffect(fn){

}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, property) {
      // todo: 收集依赖
      return Reflect.get(target, property)
    },
    set(target, property, value) {
      // todo: 触发依赖
      Reflect.set(target, property, value)
    }
  })
}

module.exports = {
  reactive,
  watchEffect
}