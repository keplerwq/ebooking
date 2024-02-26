function createOperationList(data, parent, newData = []) {
  data?.forEach?.(({ operationName, operationCode }) => {
    const newNode = {
      type: 'operation',
      name: operationName,
      code: operationCode,
      parent,
    };
    newData.push(newNode);
  });
}
function createMenuList(data, parent, newData = []) {
  data?.forEach?.(({ menuName, menuCode, children, menuLevel, operationList }) => {
    const newNode = {
      type: '',
      name: menuName,
      code: menuCode,
      parent,
      menuLevel: null,
      path: null,
      children: [],
    };
    if (menuLevel === 3) {
      newNode.type = 'page';
      Reflect.deleteProperty(newNode, 'menuLevel');
      Reflect.deleteProperty(newNode, 'path');
      createOperationList(operationList, newNode, newNode.children);
    }
    else {
      newNode.type = 'menu';
      newNode.menuLevel = menuLevel;
    }
    newData.push(newNode);
    if (children?.length) {
      createMenuList(children, newNode, newNode.children);
    }
  });
  return newData;
}
// 这里我们从数据中提取出业务端的数据
function getPureBusinessData(data, code) {
  // 业务服务数据
  const businessSide = data.find((el) => el.applicationCode === code);
  if (!businessSide)
    return null;
  const result = {
    type: 'sys',
    name: businessSide.applicationName,
    code: businessSide.applicationCode,
    children: [],
    parent: null,
  };
  businessSide?.bizTypeList?.forEach((el) => {
    const bizItem = {
      type: 'biz',
      name: el.bizName,
      code: el.bizCode,
      parent: result,
      children: null,
    };
    bizItem.children = createMenuList(el?.menuDO || [], bizItem);
    result.children.push(bizItem);
  });
  return result;
}
// 这里我们从数据中提取出后台管理端的数据
function getPureBackendData(data, code) {
  // 业务-后台数据
  const backendSide = data.find((el) => el.applicationCode === code);
  if (!backendSide)
    return null;
  const result = {
    type: 'sys',
    name: backendSide.applicationName,
    code: backendSide.applicationCode,
    children: null,
    parent: null,
  };
  result.children = createMenuList(backendSide?.menuList, result);
  return result;
}
function getPureData(data, { businessCode, backendCode }) {
  if (!data)
    return data;
  return {
    value: [
      getPureBusinessData(data, businessCode),
      getPureBackendData(data, backendCode),
    ].filter(Boolean),
  };
}
export default getPureData;
