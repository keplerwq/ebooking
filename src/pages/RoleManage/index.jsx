import React, { useContext, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { 
  Layout,
  Typography,
  Input,
  Button,
  Table,
  Divider,
  Modal,
  Affix,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import { AuthTreeContext } from 'src/libs/context';
import {actions, asyncActions} from './reduxJs';
import style from './.module.scss';

const { Content } = Layout;
const { Text } = Typography;

function getAuth(authTree) {
  const { getPageOperation } = authTree;
  const auth = (code) => getPageOperation({pageCode: 's_role_list', operationCode: code});
  
  return {
    addition: () => auth('contract_role_addition'),
    modify: () => auth('contract_role_modify'),
    deletion: () => auth('contract_role_deletion'),
    detail: () => auth('contract_role_detail'),
  }
}

function deleteHandler({relatedUserNum, roleId}, dispatch) {
  if (relatedUserNum)
    Modal.info({
      title: '不能删除角色',
      content: '当前角色仍有关联用户，请将对应用户解除关联关系后再删除角色',
      okText: '知道了',
    });
  else
    Modal.confirm({
      title: '确定删除当前角色？',
      icon: <ExclamationCircleOutlined />,
      okText: '删除',
      cancelText: '取消',
      onOk: () => dispatch(asyncActions.deleteSupplierRole(roleId)),
      onCancel: (...arg) => console.log(arg),
    });
}

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
  },
  {
    title: '用户人数',
    dataIndex: 'relatedUserNum',
    key: 'relatedUserNum',
    render: function RelatedUserNum(num, record) {
      const history = useHistory();
      const to = {pathname: "/contactsManage", search: `roleId=${record.roleId}`};
      return <a onClick={() => history.push(to)} >{num}</a>
    }
  },
  {
    title: '操作',
    render: function Operation(text, record) {
      const notAdmin = record.roleCode !== 'admin';
      const authTree = useContext(AuthTreeContext);
      const pageAuth = getAuth(authTree);
      const detailAuth = pageAuth.detail();
      const modifyAuth = pageAuth.modify() && notAdmin;
      const deletionAuth = pageAuth.deletion() && notAdmin;


      const dispatch = useDispatch();
      const history = useHistory();
      const to = (type) => history.push({pathname: '/roleManage/roleRightsManage', search: `type=${type}&roleId=${record.roleId}`});
      return (
        <span>
          {
            detailAuth &&
            <a onClick={() => to('view')}>查看</a>
          }
          {detailAuth && modifyAuth && <Divider type="vertical" />}
          {
            modifyAuth &&
            <a onClick={() => to('modify')}>编辑</a>
          }
          {deletionAuth && modifyAuth && <Divider type="vertical" />}
          {
            deletionAuth &&
            <a onClick={() => deleteHandler(record, dispatch)}>删除</a>
          }
        </span>
      )}
  },
];


export default function RoleManage(props) {
  const authTree = useContext(AuthTreeContext);
  const pageAuth = getAuth(authTree);
  const dispatch = useDispatch();
  const state = useSelector(state => state.roleManage);
  const {roleNameInFilter, roleListData } = state;
  const { pageNo, pageSize, total, data: roleList } = roleListData;

  useEffect(() => {
    dispatch(asyncActions.getSupplierRoles())
    return () => actions.resetState();
  }, [dispatch]);
    
  return (
    <>
      <Layout>
        <Affix offsetTop={0}>
          <div className={style.header}>
            <Text>角色管理</Text>
          </div>
        </Affix>

        <Content>
          {/* 筛选功能 */}
          <div className={`${style.toRight} ${style.content}`}>
            <div className={style.input}>
              <span>角色名称：</span>
              <Input
                allowClear
                onChange={e => dispatch(actions.setRoleNameInFilter(e.currentTarget.value))}
                value={roleNameInFilter}
                placeholder="请输入" />
            </div>
            
            <Button onClick={() => {
              dispatch(actions.setFinalForFilter('search'));
              dispatch(asyncActions.getSupplierRoles());
            }} type="primary" style={{marginRight: '10px'}}>搜索</Button>
            <Button onClick={() => {
              dispatch(actions.setFinalForFilter('reset'));
              dispatch(asyncActions.getSupplierRoles());
            }}>重置</Button>
          </div>

          {/* 列表 */}
          <div className={style.content}>
            {
              pageAuth.addition() &&
              <div className={style.toLeft}>
                <Button onClick={() => {
                  props.history.push({pathname: '/roleManage/roleRightsManage', search: 'type=create'})}
                } type="primary">新增角色</Button>
              </div>
            }

            <Table
              rowKey={({roleId}) => roleId}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条数据`,
                onShowSizeChange: (current, size) => {
                  // 触发页数调整也会触发 onChange
                  dispatch(actions.setRoleListData({ pageNo: 1, pageSize: size }));
                },
                total,
                pageSize,
                current: pageNo,
                onChange: (currentPage) => {
                  dispatch(actions.setRoleListData({ pageNo: currentPage }));
                  dispatch(asyncActions.getSupplierRoles());
                },
              }}
              dataSource={roleList}
              columns={columns}
              className={style.table}
              tableLayout={'fixed'} />
          </div>
        </Content>
      </Layout>
    </>
  )
}