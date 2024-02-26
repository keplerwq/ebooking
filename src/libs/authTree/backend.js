export default function route(tree) {
  tree
    .setPath({
      name: '联系人管理',
      code: 's_user_manage',
      path: '/contactsManage',
    })
    .setPath({
      name: '角色管理',
      code: 's_role_manage',
      path: '/roleManage',
      children: [
        {
          name: '角色新增(改｜查)',
          path: '/roleManage/roleRightsManage',
        },
      ],
    });
}
