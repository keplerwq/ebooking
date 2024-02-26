// feature:
// 1、比对 location.pathname 或 location.hash 与当前 tree 中的路径；
// 2、提供监听 location.pathname 或 location.hash 变更时自动更新及回调钩子。
let notSetMatcherYet = true;
let watcher = [];
function matcher(tree, params = { type: 'pathname' }) {
  if (!tree) return tree;

  if (notSetMatcherYet) {
    const onPopstate = matcher.bind(null, tree, params);
    window.addEventListener('popstate', onPopstate, { passive: true });
    notSetMatcherYet = false;
    // 卸载的时候重置
    tree.onUnmounted(() => {
      window.removeEventListener('popstate', onPopstate);
      notSetMatcherYet = true;
      watcher = [];
    });
  }

  const pathMatchByHash = ({ path, pathChildren }) => {
    let pathname = window.location.hash;
    if (pathname.startsWith('#'))
      pathname = pathname.slice(1).replace(/\?.*/g, '');

    return (path === pathname || pathChildren?.some?.(({ path, urlMatch }) => {
      if (urlMatch) {
        return (
          path === pathname &&
          window.location.href.indexOf(urlMatch) !== -1
        );
      }
      return path === pathname;
    }));
  };

  const pathMatchByPathname = ({ path, pathChildren }) => {
    return (path === window.location.pathname || pathChildren?.some?.(({ path, urlMatch }) => {
      if (urlMatch) {
        return (
          path === window.location.pathname &&
          window.location.href.indexOf(urlMatch) !== -1
        );
      }
      return path === window.location.pathname;
    }));
  };

  let pathMatch;
  if (params.type === 'pathname') {
    pathMatch = pathMatchByPathname;
  }
  else if (params.type === 'hash') {
    pathMatch = pathMatchByHash;
  }
  else {
    throw new Error(`params.type expect "pathname" or "hash", but got ${params.type}.`);
  }

  const matched = tree.find(pathMatch);

  Reflect.defineProperty(tree, 'matched', {
    value: matched ? matched : false,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  Reflect.defineProperty(tree, 'addMatchedWatcher', {
    value: (cb) => watcher.push(cb),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  watcher.forEach(cb => cb(tree));
  return tree;
}
export default matcher;
