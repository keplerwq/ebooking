let onUnmounted = [];
let onRunning = [];
class Tree {
  constructor({ value }, onDone) {
    this.value = value;
    // 设置映射集合
    this.setTypes();
    // 插件系统执行结束时调用 running
    onDone(this.running.bind(this));
  }
  running() {
    const queue = [...this.value];
    const execute = (node) => onRunning.forEach(cb => cb(node));
    let node;
    // DFS
    while (queue.length) {
      node = queue.shift();
      execute(node);
      if (node.children?.length) {
        queue.unshift(...node.children);
      }
    }
  }
  onRunning(cb) {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    onRunning.push((...arg) => {
      cb(...arg);
      resolve();
    });
    return promise;
  }
  // 默认广度优先
  find(cb, options) {
    if (!this.value)
      return false;
    const isDFS = options?.type === 'DFS';
    const value = options?.data || this.value;
    const queue = [...value];
    let node;
    let result = false;
    while (queue.length) {
      node = queue.shift();
      if ((result = !!cb(node)))
        break;
      if (node.children?.length)
        if (isDFS)
          queue.unshift(...node.children);
        else
          queue.push(...node.children);
    }
    return result ? node : undefined;
  }
  // 默认广度优先
  filter(cb, options) {
    if (!this.value)
      return false;
    const isDFS = options?.type === 'DFS';
    const value = options?.data || this.value;
    const queue = [...value];
    let node;
    let result = [];
    while (queue.length) {
      node = queue.shift();
      if (cb(node)) {
        result.push(node);
      }
      if (node.children?.length)
        if (isDFS)
          queue.unshift(...node.children);
        else
          queue.push(...node.children);
    }
    return result;
  }
  unmounted() {
    while (onUnmounted.length) {
      onUnmounted.pop()();
    }
    onRunning = [];
  }
  onUnmounted(cb) {
    onUnmounted.push(cb);
  }
  setTypes() {
    this.types = {};
    const queue = [...this.value];
    let node;
    // DFS
    while (queue.length) {
      node = queue.shift();
      if (!this.types[node.type])
        this.types[node.type] = {};
      this.types[node.type][node.code] = node;
      if (node.children?.length) {
        queue.unshift(...node.children);
      }
    }
  }
}
export default function plugin(data) {
  if (!data) return data;
  
  return new Tree(data, this.onDone);
}
