
import React, {useEffect, useMemo} from 'react';
import { Input, Button, Modal, Select, Form } from 'antd';
import {descriptor} from 'src/libs';
import style from './.module.scss';

const { Option } = Select;

const requiredRules = { required: true, message: '不能为空'};

const standardFormItemSize = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
}


export default  function ContactInfoOperateModal ({
  visibleHandler,
  visible,
  title,
  roleList,
  onSubmit,
  type,
  defaultValues,
  onCancel,
  onEmailInputBlur,
  tips
}) {
  const [form] = Form.useForm();

  const shouldDisabled = useMemo(() => type === 'modify', [type]);
  const shouldDisabledSome = useMemo(() => type === 'disableSomeOptions', [type]);


  const handleNameRule = (rule, value) => {
    const { message, pattern } = descriptor.chinaName;

    if (!value?.trim())
      return Promise.resolve();
    else if (value?.match(/\*/g) && shouldDisabledSome)
      return Promise.resolve();
    else if (!pattern.test(value))
      return Promise.reject(new Error(message));

    return Promise.resolve();
  }

  const handleTelephoneRule = (rule, value) => {
    const { message, pattern } = descriptor.telephone;

    if (!value?.trim())
      return Promise.resolve();
    if (value?.match(/\*/g) && shouldDisabledSome)
      return Promise.resolve();
    else if (!pattern.test(value))
      return Promise.reject(new Error(message));

    return Promise.resolve();
  }


  useEffect(() => {
    form.setFieldsValue({
      email: defaultValues.email,
      userName: defaultValues.userName,
      gender: defaultValues.gender,
      duties: defaultValues.duties,
      phoneNo: defaultValues.phoneNo,
      roleId: defaultValues.roleId,
    })
  }, [defaultValues, form]);


  function handleOk(e) {
    e.preventDefault();
    form.validateFields()
      .then(async values => {
        await onSubmit({...values, userId: defaultValues?.userId, originRoleId: defaultValues?.roleId});
        form.resetFields();
        visibleHandler(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function handleCancel() {
    typeof onCancel === 'function' && onCancel();
    visibleHandler(false);
    form.resetFields();
  }

  function footerNode() {
    return (
      <div className={style.modalFooter}>
        <Form.Item key="back" style={{ marginBottom: 0 }}>
          <Button onClick={handleCancel}>
                取消
          </Button>
        </Form.Item>
        <Form.Item key="submit" style={{ marginLeft: 8, marginBottom: 0 }}>
          <Button htmlType="submit" type="primary" onClick={handleOk}>
                确定
          </Button>
        </Form.Item>
      </div>
    )
  }

  const onValuesChange = ({phoneNo}) => {
    if (phoneNo?.length > 11) {
      form.setFieldsValue({
        phoneNo: phoneNo.slice(0, 11),
      })
    }
  }

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title={title}
      onCancel={handleCancel}
      footer={footerNode()}
    >
      <Form  onValuesChange={onValuesChange} layout="horizontal" form={form}>
        <Form.Item
          extra={tips?.email}
          name='email'
          label="邮箱"
          rules={[requiredRules, descriptor.email]}
          {...standardFormItemSize}>
          <Input onBlur={onEmailInputBlur} disabled={shouldDisabled} />
        </Form.Item>
          
        <div className={style.inlineFormItem}>
          <Form.Item
            extra={tips?.userName}
            className={style.formItemName}
            name='userName'
            label="用户姓名"
            rules={[requiredRules, {validator: handleNameRule}]}>
            <Input  disabled={shouldDisabled || shouldDisabledSome} />
          </Form.Item>
        
          <Form.Item
            name='gender'
            rules={[requiredRules]}
            className={style.formItemGender}>
            <Select
              disabled={shouldDisabled || shouldDisabledSome}
              placeholder="请选择"
            >
              <Option value="male">先生</Option>
              <Option value="female">女士</Option>
            </Select>
          </Form.Item>
        </div>
        
        <Form.Item
          name='duties'
          label="职务"
          rules={[requiredRules]}
          {...standardFormItemSize}>
          <Input />
        </Form.Item>

        <Form.Item
          name='phoneNo'
          label="手机号"
          rules={[requiredRules, {validator: handleTelephoneRule}]}
          {...standardFormItemSize}>
          <Input disabled={shouldDisabled || shouldDisabledSome} />
        </Form.Item>
        
        <Form.Item
          name='roleId'
          label="角色"
          rules={[requiredRules]}
          {...standardFormItemSize}>
          <Select
            placeholder="请选择">
            {
              roleList.map(el => <Option value={el.roleId} key={el.roleId}>{el.roleName}</Option>)
            }
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
  