export default function plugin(tree) {
  if (!tree) return tree;

  function getPage(code) {
    const { page } = tree.types;
    return page[code] || null;
  }
  Reflect.defineProperty(tree, 'getPage', {
    value: getPage,
    enumerable: true,
  });
  function getPageOperation({ pageCode, operationCode, }) {
    const { page } = tree.types;
    const node = page?.[pageCode]?.children?.find?.((el) => el.code === operationCode);
    return node || null;
  }
  Reflect.defineProperty(tree, 'getPageOperation', {
    value: getPageOperation,
    enumerable: true,
  });

  return tree;
}
