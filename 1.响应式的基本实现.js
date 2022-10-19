// 储存副作用函数的桶
const bucket = new WeakMap()
// 原始数据
const data = { text: 'vue' }
// 对原始数据进行代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key) {
        // activeEffect不存在直接return
        if (!activeEffect) return target[key]
        // 根据target，从桶中取出dapsMap
        let depsMap = bucket.get(target)
        if (!depsMap) {
            // 如果不存在depsMap，新建一个Map并与target关联
            bucket.set(target, (depsMap = new Map()))
        }
        let deps = depsMap.get(key)
        if (!deps) {
            depsMap.set(key, (deps = new Set()))
        }
        // 最后将当前激活的副作用添加到桶里
        deps.add(activeEffect)

        return target[key]
    },
    // 拦截设置操作
    set(target, key, newVal) {
        // 设置属性值 data[text]=新数据
        target[key] = newVal
        const depsMap = bucket.get(target)
        if (!depsMap) return
        const effects = depsMap.get(key)
        // 遍历副作用桶中的方法拿出来执行
        effect && effects.forEach(fn => fn())
    }
})


// 1秒后修改数据，会触发副作用函数重新调用
setTimeout(() => {
    obj.text = "vue3!!!!"
}, 1000)
let activeEffect
function effect(fn) {
    activeEffect = fn
    fn()
}
effect(
    () => {
        console.log(obj.text);
    })