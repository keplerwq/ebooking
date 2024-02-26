
// 表单转为前端适用的结构
function convertForTables(data) {
  return data.map(el => ({
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
  
// 表单的后台数据结构
const _MOCK_ = [
  {
    "bizType": "administrative",
    "applicationId": 1,
    "secBizCode": "product",
    "thirdBizId": 40,
    "thirdBizName": "桌子类",
    "checked": false,
    "operationList": [{
      "operationId": 27,
      "operationCode": "product_modify",
      "operationName": "编辑商品",
      "uriName": "编辑商品",
      "checked": false
    }, {
      "operationId": 28,
      "operationCode": "product_deletion",
      "operationName": "删除商品",
      "uriName": "删除商品",
      "checked": false
    }]
  },
  {
    "bizType": "administrative",
    "applicationId": 1,
    "secBizCode": "product",
    "thirdBizId": 41,
    "thirdBizName": "椅子类",
    "checked": true,
    "operationList": [{
      "operationId": 27,
      "operationCode": "product_modify",
      "operationName": "编辑商品",
      "uriName": "编辑商品",
      "checked": true
    }, {
      "operationId": 28,
      "operationCode": "product_deletion",
      "operationName": "删除商品",
      "uriName": "删除商品",
      "checked": false
    }]
  }
]
  
const dataForTable = convertForTables(_MOCK_)
  
// 左边的树的结构
const rightsTree = [
  {
    title: '商务采购与合作部',
    key: '0',
    selectable: false,
    children: [
      { title: '基建采购', selectable: false, key: '0-1' },
      {
        title: '职能采购',
        key: '0-2',
        selectable: false,
        children: [
          { title: '物品类', key: '0-2-1', isLeaf: true },
          { title: '服务类', key: '0-2-2', isLeaf: true },
        ]
      },
      { title: '行政采购', key: '0-3' },
    ],
  },
  {
    title: '商务采购与合作部x',
    key: '1',
    children: [
      { title: '基建采购z', key: '1-1' },
      {
        title: '职能采购g',
        key: '1-2',
        isLeaf: false,
        children: [
          { title: '物品类h', key: '1-2-1'},
          { title: '服务类l', key: '1-2-2'},
        ]
      },
      { title: '行政采购', key: '1-3' },
    ],
  },
];
  
// 左边的树的结构
const rightsTreeForPage = [
  {
    title: '商务采购与合作部',
    key: '0',
    selectable: false,
    children: [
      { title: '基建采购', selectable: false, key: '0-1' },
      {
        title: '职能采购',
        key: '0-2',
        selectable: false,
        children: [
          { title: '物品类', key: '0-2-1', selectable: false,
            children: 
            [
              {
                title: '页面-A',
                key: 'A',
                checked: true,
                isLeaf: true,
                operation: [
                  {
                    key: 'view',
                    checked: true,
                    title: '查看',
                  },
                  {
                    key: 'edit',
                    checked: true,
                    title: '编辑',
                  },
                  {
                    key: 'add',
                    checked: true,
                    title: '添加',
                  },
                ]
              },
              {
                title: '页面-B',
                key: 'B',
                isLeaf: true,
                checked: true,
                operation: [
                  {
                    key: 'all',
                    checked: true,
                    title: '全部权限',
                  }
                ]
              },
            ]
          
          },
          { title: '服务类', key: '0-2-2', children: [
            {
              title: '页面-B-2',
              key: 'B-2',
              checked: true,
              isLeaf: true,
              operation: [
                {
                  key: 'all',
                  checked: true,
                  title: '全部权限',
                }
              ]
            }
          ] },
        ]
      },
      { title: '行政采购', key: '0-3' },
    ],
  },
  {
    title: '商务采购与合作部x',
    key: '1',
    children: [
      { title: '基建采购z', key: '1-1' },
      {
        title: '职能采购g',
        key: '1-2',
        children: [
          { title: '物品类h', key: '1-2-1', children: [
            {
              title: '页面-A-2',
              key: 'A-2',
              checked: true,
              isLeaf: true,
              operation: [
                {
                  key: 'view',
                  checked: true,
                  title: '查看',
                },
                {
                  key: 'edit',
                  checked: true,
                  title: '编辑',
                },
                {
                  key: 'add',
                  checked: true,
                  title: '添加',
                },
              ]
            }
          ]},
          { title: '服务类l', isLeaf: true, key: '1-2-2'},
        ]
      },
      { title: '行政采购', key: '1-3' },
    ],
  },
];
  
  
const rightsTreeForPageSets = [
  {
    title: '采购供应商',
    key: '01',
    children: _.cloneDeep(rightsTreeForPage),
  },
  {
    title: '管理后台',
    key: '02',
    children: [_.cloneDeep(rightsTreeForPage)[1]],
  },
]