// feature:
// 1、比对 location.pathname 与当前 tree 中的路径，不匹配时（比对能力是 matcher 插件赋予的，通过 tree.matched查看），则添加 fallback
function fallback(tree) {
  if (!tree) return tree;

  if (!tree?.addMatchedWatcher)
    throw new Error("Please install the plugin 'matcher' in AuthTree before the plugin 'fallback'.");

  if (tree.matched) {
    if (tree.fallback) Reflect.deleteProperty(tree, 'fallback');
    return tree;
  }

  const pathExistFn = (el) => el.path;

  // 使用深度遍历顺序找到第一个有 path 的节点
  const matched = tree.find(pathExistFn, { type: 'DFS' });

  Reflect.defineProperty(tree, 'fallback', {
    value: matched,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  return tree;
}

export default fallback;
