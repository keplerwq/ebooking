import React, {useState, useMemo, useEffect, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { 
  Layout,
  Input,
  Button,
  Card,
  Breadcrumb,
  Form,
  Typography,
  Divider,
  Affix,
} from 'antd';
import _ from 'lodash';
import qs from 'qs';
import { AuthTreeContext } from 'src/libs/context';
import { actions, asyncActions } from "./reduxJs";
import RightsTree from './components/rightsTree';
import PageRightsOperation from './components/pageRightsOperation';
import DataRightsOperation from './components/dataRightsOperation';

import style from './.module.scss';

const { Content } = Layout;
const { Title } = Typography;

function getAuth(authTree) {
  const { getPageOperation } = authTree;
  const auth = (code) => getPageOperation({pageCode: 's_role_list', operationCode: code});
  
  return {
    modify: () => auth('contract_role_modify'),
  }
}

export default function RoleRightsManage(props) {
  const authTree = useContext(AuthTreeContext);
  const [modifyAuth, setModifyAuth] = useState(false);
  const dispatch = useDispatch();
  const state = useSelector(state => state.roleRightsManage);
  const [form] = Form.useForm();

  const supplierMenuListGrant = useMemo(
    () => _.cloneDeep(state.supplierMenuListGrant), [state.supplierMenuListGrant]
  );

  const supplierDataGrantItem = useMemo(
    () => _.cloneDeep(state.activeSupplierDataGrantItem), [state.activeSupplierDataGrantItem]
  );

  useEffect(() => {
    
    dispatch(asyncActions.getSupplierRoleDetails()).then(({roleCode}) => {
      setModifyAuth(getAuth(authTree).modify() && roleCode !== 'admin');
    });

    dispatch(asyncActions.getSupplierBizEntities());

    return () => dispatch(actions.resetState());
  }, [dispatch, modifyAuth, authTree]);

  useEffect(() => {
    form.setFieldsValue({
      roleName: state.roleName,
    })
  }, [state.roleName, form]);

  const onLeafClick = (selectedItem) => {
    dispatch(asyncActions.getSupplierDataGrantItem(selectedItem))
  };
    
  const isViewStatus = useMemo(() => {
    const {type} = qs.parse(props.history.location.search, {ignoreQueryPrefix: true});
    return type === 'view';
  }, [props.history.location.search]);

  const title =  useMemo(() => {
    const {type} = qs.parse(props.history.location.search, {ignoreQueryPrefix: true});
    switch (type) {
      case 'view': return '角色权限';
      case 'modify': return '编辑角色';
      case 'create': return '添加角色';
      default: return null;
    }
  }, [props.history.location.search]);


  return (
    <Layout>
      <Affix offsetTop={0}>
        <div className={style.header}>
          <Breadcrumb className={style.toLeft}>
            <Breadcrumb.Item>
              <a onClick={() => props.history.push('/roleManage')}>角色管理</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
          {
            isViewStatus ?
              <>
                {
                  modifyAuth &&
                  <Button
                    type="primary"
                    onClick={() => {
                      const {pathname, search} = props.history.location;
                      props.history.push({pathname, search: search.replace('view', 'modify')});
                    }}
                    style={{marginRight: '10px'}}>
                    编辑
                  </Button>
                }
              </>
              :
              <div>
                <Button onClick={() => props.history.push('/roleManage')} style={{marginRight: '10px'}}>
                取消
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form.validateFields().then(() => {
            
                      const {type} = qs.parse(
                        props.history.location.search, {ignoreQueryPrefix: true}
                      );

                      if (type === 'create')
                        dispatch(asyncActions.createSupplierRole())
                          .then(() => props.history.push('/roleManage'))
            
                      if (type === 'modify')
                        dispatch(asyncActions.modifySupplierRole())
                          .then(() => props.history.push('/roleManage'))
                    })
                  }}>保存</Button>
              </div>
          }
        </div>
      </Affix>
      <Content className={style.content}>
        <Form
          layout="horizontal"
          form={form}
          // 同步到 redux，方便提交时获取数据
          onFieldsChange={([data]) => dispatch(actions.setRoleName(data.value))}>
          <Title level={4}>基本信息</Title>
          <Form.Item
            name='roleName'
            label="角色名称"
            rules={[{ required: true, message: '不能为空'}]}
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 12 }}>
            <Input disabled={isViewStatus} placeholder="请输入" />
          </Form.Item>

          <Divider />{/* 分割线 */}

          <Title level={4}>数据权限</Title>
          <Card>
            <Card.Grid hoverable={false} className={style.cardLeft}>
              <RightsTree
                data={state.supplierBizEntities}
                onLeafClick={onLeafClick} />
            </Card.Grid>

            <Card.Grid hoverable={false} className={style.cardRight}>
              <DataRightsOperation
                disabled={isViewStatus}
                data={supplierDataGrantItem}
                callback={(data) => dispatch(actions.setSupplierDataGrantItem({data}))} />
            </Card.Grid>
          </Card>

          <Divider />{/* 分割线 */}

          <Title level={4}>
            页面操作权限
            <span style={{ fontSize: '14px', color: '#ccc', paddingLeft: '8px' }}>
            请在左侧【全部菜单】中勾选菜单权限，勾选后默认赋予该菜单下全部页面的权限；如需更精细的设置，可在右侧【已选页面】中勾选/取消详细页面及操作权限；
            </span>
          </Title>
          <PageRightsOperation
            disabled={isViewStatus}
            data={supplierMenuListGrant}
            leftChecked={state.checkedMenuLeafs}
            onChange={(data) => dispatch(actions.setActiveSupplierMenuListGrant(data))} />

        </Form>
      </Content>
    </Layout>
  )
}
