import qs from 'qs';
let isAddMatchedWatcher = false;
export default function parse404(tree) {
  if (!tree)
    return tree;
  if (typeof qs === 'undefined')
    throw new Error("The plugin 'parse404' for AuthTree need 'npm install qs' first.");
  if (!tree?.extractive)
    throw new Error("Please install the plugin 'extractive' in AuthTree before the plugin 'parse404'.");
  if (!tree?.notfoundPath)
    throw new Error("Please install the plugin 'addUsefulPaths' in AuthTree before the plugin 'parse404'.");
  if (!tree?.addMatchedWatcher)
    throw new Error("Please install the plugin 'matcher' in AuthTree before the plugin 'parse404'.");

  const usePathname = window.location.pathname === '/404';
  const useHash = window.location.hash.match(/^#\/404(\?.*)/);

  if (usePathname || useHash) {
    const { sys, biz } = qs.parse(window.location.search || RegExp.$1, { ignoreQueryPrefix: true });

    if (sys) {
      const value = tree.find(({ code }) => code === sys);
      tree?.extractive?.recalculate({ type: 'sys', value });
    }
    if (biz) {
      const value = tree.find(({ code }) => code === biz);
      tree?.extractive?.recalculate({ type: 'biz', value });
    }
  }
  if (!isAddMatchedWatcher) {
    isAddMatchedWatcher = true;
    tree?.addMatchedWatcher?.((tree) => {
      // 添加一个监听，当 matched 发生更新时，同步更新本插件提供的 parse404
      parse404(tree);
    });
  }
  tree.onUnmounted(() => (isAddMatchedWatcher = false));
  return tree;
}
