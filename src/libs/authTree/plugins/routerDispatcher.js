let menuListForSetPaths = null;
class Router {
  constructor(tree) {
    this.tree = tree;
  }
  setPath({ code, path, children }) {
    if (!menuListForSetPaths)
      menuListForSetPaths = this.tree.filter(({ type }) => type === 'menu');
    const matchedIndex = menuListForSetPaths.findIndex((el) => el.code === code);
    if (matchedIndex > -1) {
      const matchedItem = menuListForSetPaths.splice(matchedIndex, 1)[0];
      Reflect.set(matchedItem, 'path', path);
      if (children?.length) {
        Reflect.set(matchedItem, 'pathChildren', children);
      }
    }
    return this;
  }
}
export default function plugin(tree, dispatchers) {
  if (!tree)
    return tree;
  dispatchers.forEach((dispatch) => dispatch(new Router(tree)));
  tree.onUnmounted(() => (menuListForSetPaths = null));
  return tree;
}
