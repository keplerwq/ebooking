import React, {useEffect, useState, useMemo, useContext} from 'react';
import { useLocation } from "react-router-dom";
import { 
  Layout,
  Typography,
  Input,
  Select,
  Button,
  Table,
  Divider,
  Modal,
  Affix,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import loadable from '@loadable/component'
import qs from 'qs';
import { AuthTreeContext } from 'src/libs/context';
import {actions, asyncActions} from './reduxJs';
import { useSelector, useDispatch } from 'react-redux'
import style from './.module.scss';

const ContactInfoOperateModal =
    loadable(() => import(/* webpackChunkName: 'ContactInfoOperateModal' */"./components/ContactInfoOperateModal"));

const { Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

function confirm(cb) {
  Modal.confirm({
    title: '联系人将从当前供应商删除，不可再登录到此供应商中。确定删除？',
    icon: <ExclamationCircleOutlined />,
    okText: '删除',
    cancelText: '取消',
    onOk: () => cb(),
    onCancel: (...arg) => console.log(arg),
  });
}

export default function ContactsManage() {
  const { getPageOperation } = useContext(AuthTreeContext);
  const auth = (code) => getPageOperation({pageCode: 's_user_list', operationCode: code});
  const additionAuth = auth('supplier_user_addition');
  const modifyAuth = auth('supplier_user_modify');
  const deletionAuth = auth('supplier_user_deletion');

  const location = useLocation();
  const dispatch = useDispatch();
  const state = useSelector(state => state.contactsManage);
  const {filterRoleList, selectedRoleInFilter, usernameInFilter, contactsListData } = state;
  const { pageNo, pageSize, total, data: contactsList } = contactsListData;
  
  const [modalVisible, modalVisibleHandler] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('');
  const [modalDefaultValues, setModalDefaultValues] = useState({});

  useEffect(() => {
    const {roleId} = qs.parse(location.search, {ignoreQueryPrefix: true})
    if (roleId)
      dispatch(actions.initFilterState(+roleId));
    
    dispatch(asyncActions.getSupplierRoleList()).then(
      () => dispatch(asyncActions.getSupplierContactsList())
    )
 
    return () => dispatch(actions.resetState());
  }, [dispatch, location]);

  const columns = useMemo(() => [
    {
      title: '用户姓名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phoneNo',
      key: 'phoneNo',
    },
    {
      title: '职务',
      dataIndex: 'duties',
      key: 'duties',
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '操作',
      render: (text, record) => (
        <span>
          {
            modifyAuth &&
            <a onClick={() => {
              setModalDefaultValues(record);
              setModalTitle('编辑联系人');
              setModalType('modify');
              modalVisibleHandler(true);
            }}>编辑</a>
          }
          {
            modifyAuth && deletionAuth &&
            <Divider type="vertical" />
          }
          {
            deletionAuth &&
            <a onClick={() => {
              const params = {
                userId: record.userId,
                roleId: record.roleId
              }
              confirm(() => dispatch(asyncActions.deleteSupplierContacts(params)))
            }}>删除</a>
          }
        </span>
      )
    },
  ], [dispatch, modifyAuth, deletionAuth]);


  async function onModalEmailInputBlur(e) {
    const data = await dispatch(asyncActions.findUserByEmail(e.target.value));
    if (data) {
      const {
        email,
        userName,
        gender,
        phoneNo,
      } = data;
      
      setModalDefaultValues({
        email,
        userName,
        gender,
        phoneNo,
      });
      setModalType('disableSomeOptions');
    } else {
      setModalType('create');
    }
  }


  return (
    <>
      <Layout>
        <Affix offsetTop={0}>
          <div className={style.header}>
            <Text>联系人管理</Text>
          </div>
        </Affix>
        <Content>
          {/* 筛选功能 */}
          <div className={`${style.toRight} ${style.content}`}>
            <div className={style.input}>
              <span>用户姓名：</span>
              <Input
                allowClear
                value={usernameInFilter}
                onChange={e => dispatch(actions.setUsernameInFilter(e.currentTarget.value))}
                placeholder="请输入"  />
            </div>
            <div className={style.input}>
              <span>角色：</span>
              <Select
                className={style.select}
                showSearch
                allowClear
                placeholder="请选择"
                optionFilterProp="children"
                onChange={(payload) => dispatch(actions.selectRoleInFilter(payload))}
                value={selectedRoleInFilter}
              >
                {
                  filterRoleList.map(el => <Option key={el.roleId} value={el.roleId}>{el.roleName}</Option>)
                }
              </Select>
            </div>

            <Button onClick={() => {
              dispatch(actions.setFinalForFilter('search'));
              dispatch(asyncActions.getSupplierContactsList());
            }} type="primary" style={{marginRight: '10px'}}>搜索</Button>
            <Button onClick={() => {
              dispatch(actions.setFinalForFilter('reset'));
              dispatch(asyncActions.getSupplierContactsList());
            }}>重置</Button>
          </div>

          {/* 列表 */}
          <div className={style.content}>
            {
              additionAuth &&
              <div className={style.toLeft}>
                <Button onClick={() => {
                  setModalTitle('添加联系人');
                  setModalType('create');
                  modalVisibleHandler(true);
                }} type="primary">添加联系人</Button>
              </div>
            }
            <Table
              rowKey={(record) => record.email + record.roleId}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条数据`,
                onShowSizeChange: (current, size) => {
                  // 触发页数调整也会触发 onChange
                  dispatch(actions.setContactsListData({ pageNo: 1, pageSize: size }));
                },
                total,
                pageSize,
                current: pageNo,
                onChange: (currentPage, ...arg) => {
                  dispatch(actions.setContactsListData({ pageNo: currentPage }));
                  dispatch(asyncActions.getSupplierContactsList());
                },
              }}
              dataSource={contactsList} 
              columns={columns} 
              className={style.table} />
          </div>
        </Content>
      </Layout>
      {/*  */}
      <ContactInfoOperateModal
        tips={{email: '账号登录请使用系统默认密码：Admin123'}}
        onCancel={() => setModalDefaultValues({})}
        defaultValues={modalDefaultValues}
        title={modalTitle}
        type={modalType}
        visible={modalVisible}
        roleList={filterRoleList}
        visibleHandler={modalVisibleHandler}
        onEmailInputBlur={onModalEmailInputBlur}
        onSubmit={async (payload) => {
          if (
            modalType === 'modify'
          ) {
            const {code} = await dispatch(asyncActions.modifySupplierContacts(payload));
            return code === '0';
          } else if (
            modalType === 'create' ||
            modalType === 'disableSomeOptions'
          ) {
            const {code} = await dispatch(asyncActions.createSupplierContacts(payload));
            return code === '0';
          }
        }} />
    </>
  )
}