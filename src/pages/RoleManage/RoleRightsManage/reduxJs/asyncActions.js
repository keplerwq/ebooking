import { actions } from '.';
import qs from 'qs';
import api from 'src/api';

const getCurrentSupplier = () => JSON.parse(localStorage.getItem('USER_META_INFO'))?.supplierInfoDO;

const getSearchVal = () => {
  const [, search] = window.location.hash.split('?');
  return qs.parse(search);
}

// 转换为 Tree 菜单格式
function convertForMenuTree(data, convertedData = []) {

  data.forEach((item) => {
    const convertedItem = {
      title: item.bizName,
      key: item.bizCode,
      isLeaf: item.leaf,
    };

    convertedData.push(convertedItem);

    if (item.children?.length && !item.leaf) {
      const children = [];
      Reflect.set(convertedItem, 'children', children);
      Reflect.set(convertedItem, 'selectable', false);
      convertForMenuTree(item.children, children);
    }
  });

  return convertedData;
}


// 表单数据转为 Table 适用的结构
function convertForTables(data) {
  return data.map(el => ({
    applicationId: el?.applicationId,
    bizType: el?.bizType,
    key: el.thirdBizId,
    label: el.thirdBizName,
    dataIndex: el.secBizCode,
    checked: el.checked,
    subset: el?.operationList?.map(subEl => ({
      title: subEl?.operationName,
      dataIndex: subEl?.operationCode,
      checked: subEl?.checked,
      operationId: subEl?.operationId
    })),
  }))
}

function convertForPagesOperation(data) {
  const newData = [];
  const checkedLeafs = {};

  function createTree(tree, tab, parent) {
    if (!tree?.length) return [];

    return tree.map(el => {

      const isLeaf = el?.menuLevel === 2
      const isOperation = el?.menuLevel > 2

      if (isOperation) {
        return {
          isLeaf,
          title: el.menuName,
          key: el.menuCode,
          menuId: el.menuId,
          selectable: isLeaf,
          checked: el.checked,
          operation: el?.operationList?.map(op => ({
            key: op?.operationCode,
            operationId: op?.operationId,
            checked: op?.checked,
            title: op?.operationName,
          })),
          parentTitle: parent.menuName,
          parentId: parent.menuId
        }
      }
      else if (isLeaf) {

        const leafs = createTree(el.children, tab, el)

        Reflect.deleteProperty(el, 'children')

        const node = {
          isLeaf,
          title: el.menuName,
          key: el.menuCode,
          menuId: el.menuId,
          selectable: isLeaf,
          checked: true,
          leafs
        }

        if (leafs.some(el => el.checked))
          (checkedLeafs[tab.key] || (checkedLeafs[tab.key] = [])).push(node);

        return node
      } 
      else {
        return {
          isLeaf,
          title: el.menuName,
          key: el.menuCode,
          menuId: el.menuId,
          selectable: isLeaf,
          children: createTree(el.children, tab)
        }
      }
    })
  }

  data.forEach(tab => {
    const newTab = {
      title: tab.applicationName,
      key: tab.applicationCode,
      children: [],
    }

    tab?.bizTypeList?.forEach?.(menu => {
      if (menu.menuDO)
        newTab.children.push({
          title: menu.bizName,
          key: menu.bizCode,
          children: createTree(menu.menuDO, newTab),
        })
    })

    if (tab.menuList)
      newTab.children = newTab.children.concat(createTree(tab.menuList, newTab));

    newData.push(newTab);
  })

  return {data: newData, checkedLeafs};
}

export const getSupplierRoleDetails = () => (dispatch) => {

  const {roleId} = getSearchVal();
  const roleIdAsNumber = Number(roleId);

  const params = {
    "roleId": roleIdAsNumber || void 0, // 不传代表新增角色
    "supplier": getCurrentSupplier()?.id,
  }

  return api.getSupplierRoleDetails(params).then((res) => {

    const {roleBaseInfo, menuList} = res.data;

    if (roleBaseInfo?.roleName)
      dispatch(actions.setRoleName(roleBaseInfo.roleName))

    if (
      roleBaseInfo?.privilegeType !== undefined &&
      roleBaseInfo?.privilegeType !== null
    )
      dispatch(actions.setPrivilegeType(roleBaseInfo.privilegeType))

    if (menuList){
      const {data, checkedLeafs} = convertForPagesOperation(menuList);
      dispatch(actions.setSupplierMenuListGrant(data));
      dispatch(actions.setSupplierMenuListLeftChecked(checkedLeafs));
    }

    return {roleCode: roleBaseInfo?.roleCode}
  });
};

export const getSupplierBizEntities = () => (dispatch, getState) => {

  api.getSupplierBizEntities().then((res) => {

    // 生成数据权限操作的左菜单
    const tree = convertForMenuTree(res.data);

    dispatch(actions.setSupplierBizEntities(tree));
  })
}


export const getSupplierDataGrantItem = (selectedItem) => (dispatch, getState) => {
  const {key: bizCode} = selectedItem.find(Boolean) ? selectedItem.find(Boolean) : {key: undefined};

  const {roleRightsManage: state} = getState();

  // 设置 Active 状态的数据
  // bizCode 存在则检查缓存，不存在则直接设置为空
  if (state.supplierDataGrantItem[bizCode] || !bizCode) {
    return dispatch(actions.setActiveSupplierDataGrantItem(bizCode));
  }

  const {roleId} = getSearchVal();
  const roleIdAsNumber = Number(roleId);

  // TODO bizType 这里后期需要改为动态获取业务类型
  const params = {
    bizType: 'administration',
    supplier: getCurrentSupplier()?.id,
    roleId: roleIdAsNumber || void 0, // 不传代表新增角色
    bizCode,
  }

  api.getSupplierDataGrantItem(params).then((res) => {

    const tableData = convertForTables(res.data);

    dispatch(actions.setSupplierDataGrantItem({data: tableData, bizCode}));
    dispatch(actions.setActiveSupplierDataGrantItem(bizCode));
  })
}


const submitSupplierRole = (request) => (dispatch, getState) => {

  const {roleId} = getSearchVal();
  const roleIdAsNumber = Number(roleId);
  const {roleRightsManage: state} = getState();

  const secBizCodeList = Object.keys(state.supplierDataGrantItem);

  const grantItemList = Object.values(state.supplierDataGrantItem)
    .flat()
    .map(el => el.checked === true ? ({
      bizType: el.bizType,
      applicationId: el.applicationId,
      secBizCode: el.dataIndex,
      thirdBizId: el.key,
      operationIdList: el?.subset?.map(
        sEl => sEl.checked === true ? sEl.operationId : null
      )?.filter(Boolean)
    }) : null)?.filter(Boolean);


  const menuListSrc =
    state?.activeSupplierMenuListGrant?.length ?
      state?.activeSupplierMenuListGrant :
      state?.supplierMenuListGrant;

  const operationList = [];

  const generateLeafList = data => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];

      if (node.children)
        generateLeafList(node.children);
      else if (node.isLeaf)
        generateLeafList(node.leafs);
      else
        operationList.push(node);
    }
  };

  generateLeafList(menuListSrc);

  const menuIdList = operationList?.map(el => {
    if (!el.checked) return null;

    return {
      checked: el.checked,
      menuId: el.menuId,
      menuOperationIdList: el.operation.map(
        sEl => sEl.checked ? sEl.operationId : null
      )?.filter(Boolean)
    }
  }).filter(Boolean);

  const params = {
    supplierId: getCurrentSupplier()?.id,
    roleId: roleIdAsNumber || undefined,
    roleName: state?.roleName,
    privilegeType: state?.privilegeType,
    secBizCodeList,
    grantItemList,
    menuIdList,
  };

  return request(params);
}

export const createSupplierRole = () => (dispatch, getState) => {
  return dispatch(submitSupplierRole(api.createSupplierRole)).then((res) => {
  })
}

export const modifySupplierRole = () => (dispatch, getState) => {
  return dispatch(submitSupplierRole(api.modifySupplierRole)).then((res) => {
  })
}
