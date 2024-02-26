import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Space, Row, Col, Radio, Form, message } from 'antd';
import api from 'src/api';

let modalRoot;

function SetSupplierModal() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [supplierList, setSupplierList] = useState([]);

  const handleOk = () => {
    form.validateFields().then(({ value }) => {
      api.setSupplierEntity({ supplierId: value }).then(({ code }) => {
        if (code === '0') {
          modalRoot = null;
          setIsModalVisible(false);
          window.location.reload();
        }
      });
    });
  };

  useEffect(() => {
    api.getMySupplierEntities().then(({code, data}) => {
      if (code === '0') {
        if (data?.length) setSupplierList([...data]);
        else {
          setIsModalVisible(false);
          message.error('您当前没有权限，即将返回登录页...', 3);

          setTimeout(() => {
            modalRoot = null;
            sessionStorage.setItem('isLinkToLogin', '1');
            window.location.href = '/#/login';
          }, 3000);
        }
      }
    });
  }, []);

  return (
    <Modal
      title="选择登录企业"
      visible={isModalVisible}
      closable={false}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row>
          <Col span={24}>
            <span>检测到您的账户下有多个企业，请选择企业进行登录：</span>
          </Col>
        </Row>

        <Form form={form}>
          <Form.Item
            rules={[{ required: true, message: '请至少选择一个企业' }]}
            name="value"
          >
            <Radio.Group style={{ width: '100%' }}>
              {supplierList.map((el) => (
                <Row key={el.id}>
                  <Col span={24}>
                    <Radio.Button
                      style={{
                        marginBottom: 10,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                      value={el.id}
                    >
                      {el.companyName}
                    </Radio.Button>
                  </Col>
                </Row>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}


function choseSupplierHandler() {
  // 单例处理
  if (modalRoot) return;

  // 卸载掉根容器（位于 src/pages/index.tsx），避免不必要的子应用加载（因未选择实体，容易导致子应用请求报错）
  const contentRoot = document.getElementById('content-root');
  contentRoot?.parentNode?.removeChild(contentRoot);

  modalRoot = document.createElement('div');

  document.body.appendChild(modalRoot);

  ReactDOM.render(<SetSupplierModal />, modalRoot);
}

export default choseSupplierHandler;
