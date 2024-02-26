export default function plugin (tree) {
  if (!tree)
    return tree;

  const sys = Object.values(tree.types?.sys || {});
  const biz = Object.values(tree.types?.biz || {});

  const firstPath = ({ path }) => path;
  const setDefaultPath = (el) => Reflect.set(el, 'defaultPath', tree.find(firstPath, { data: [el] })?.path);
  sys.forEach((el) => {
    setDefaultPath(el);
    Reflect.set(el, 'notfoundPath', `/404?sys=${el.code}`);
  });
  biz.forEach((el) => {
    setDefaultPath(el);
    Reflect.set(el, 'notfoundPath', `/404?biz=${el.code}`);
  });
  Reflect.defineProperty(tree, 'notfoundPath', {
    value: tree.find(({ notfoundPath }) => notfoundPath)
      ?.notfoundPath,
    enumerable: true,
  });
  Reflect.defineProperty(tree, 'defaultPath', {
    value: tree.find(firstPath, { type: 'DFS' })?.path,
    enumerable: true,
  });
  return tree;
}
