// 本插件对 matcher 具有强依赖，请将本插件安装在上述插件的后面
function changedByBiz(biz, tree) {
  const menu = tree.find((el) => el.path, { type: 'DFS', data: [biz] });
  return changedByMenu(menu, tree, { biz, sys: biz.parent });
}
function changedBySys(sys, tree) {
  const menu = tree.find((el) => el.path, { type: 'DFS', data: [sys] });
  const options = { sys };
  const [child] = sys.children;
  if (child?.type === 'biz') {
    Reflect.set(options, 'biz', child);
  }
  return changedByMenu(menu, tree, options);
}
function changedByMenu(menu = null, tree, options) {
  const current = {
    sys: null,
    biz: null,
    menu,
  };
  if (options?.sys) {
    Reflect.set(current, 'sys', options.sys);
  }
  if (options?.biz) {
    Reflect.set(current, 'biz', options.biz);
  }
  let currentMenu = menu;
  while (currentMenu?.parent) {
    currentMenu = currentMenu.parent;
    if (currentMenu.type === 'biz')
      current.biz = currentMenu;
    if (currentMenu.type === 'sys')
      current.sys = currentMenu;
  }
  // 直接从上一层级找 menu list
  const menuList = (current.biz || current.sys)?.children;
  const list = {
    biz: current.biz ? current.sys.children : null,
    menu: menuList?.length ? menuList : null,
    sys: tree.value || null,
  };
  const extractive = {
    current,
    list,
  };
  return extractive;
}
function createExtractive(tree, changes) {
  if (!tree) {
    console.warn('未提供 "tree.value" 。');
  }
  // 每次菜单变化都传入变更的节点，若都未传入，则默认根据 tree.matched 进行更新
  const { menu, biz, sys } = changes?.type
    ? { [changes.type]: changes.value }
    : { menu: tree.matched };
  const extractive = {};
  if (menu) {
    Object.assign(extractive, changedByMenu(menu, tree));
  }
  if (sys) {
    Object.assign(extractive, changedBySys(sys, tree));
  }
  if (biz) {
    Object.assign(extractive, changedByBiz(biz, tree));
  }
  Reflect.defineProperty(extractive, 'recalculate', {
    value: createExtractive.bind(null, tree),
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Reflect.defineProperty(tree, 'extractive', {
    value: extractive,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  return tree;
}
// 本插件对 matcher 具有强依赖，请将本插件安装在上述插件的后面
export default function plugin(tree) {
  if (!tree)
    return tree;
  if (!tree?.addMatchedWatcher)
    throw new Error("Please install the plugin 'matcher' in AuthTree before the plugin 'extractive'.");
  tree?.addMatchedWatcher?.((tree) => {
    // 添加一个监听，当 matched 发生更新时，同步更新本插件提供的 extractive
    createExtractive(tree);
  });
  return createExtractive(tree);
}