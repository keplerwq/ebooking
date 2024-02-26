// 联系信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Row, Col } from 'antd';
import { FormEx2 } from 'src/components';
import OpHeader from '../components/OpHeader';
import { descriptor, } from 'src/libs';
import '../Info.scss';

const { Item } = FormEx2;
const maxLength = 50;
class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    }
  }

  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
    this.setState({
      isEditing: false
    })

    this.props.hasSave && this.props.hasSave(true);

  }

  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('contact', true);
  }

  addContactItem = () => {
    let { contactKeys, contactUuid, } = this.props;
    const { saveContactKeys } = this.props.actions;
    const nextKeys = contactKeys.concat(contactUuid);
    contactUuid++;
    saveContactKeys(nextKeys, contactUuid);
  }

  removeContactItem = (k, index) => {

    const { contactKeys, contactUuid } = this.props;
    const { saveContactKeys } = this.props.actions;
    if (contactKeys.length === 1) {
      return;
    }
    saveContactKeys(contactKeys.filter(key => key !== k), contactUuid, () => {

    });

    let contact = _.cloneDeep(this.form.getValue('contactList'));
    contact.splice(index, 1);
    this.form.setValue('contactList', contact);
    console.log(contact);
  }

  render() {
    const colLeft = {
      span: 11,
    }
    const colRight = {
      span: 11,
      offset: 1,
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
        xl: { span: 8 },
        xxl: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 16 },
        xl: { span: 16 },
        xxl: { span: 19 },
      },
    };

    const { updateForm={}, isEditing=false, contactKeys=[] } = this.props;
    const { status } = updateForm;
    const canEdit = status !== 0;

    return (
      <FormEx2
        defaultValues={updateForm}
        onSubmit={(values) => { this.handleSubmit(values); }}
        onChange={(values) => { this.onFormChange(values) }}
        ref={(f) => { this.form = f }}
      >
        <OpHeader
          name="联系人信息"
          isEditing={isEditing}
          onEdit={this.onEdit}
          canEdit={canEdit}
          extraInfo={
            <span style={{ color: '#999', display: 'inline-block' }}>(订单、询价等业务邮件将发送至所有联系人的邮箱)</span>
          }
        />
        {
          contactKeys.map((k, index) => (
            <section className={`g-wrapper m-contact ${!isEditing ? 's-edit' : ''}`} key={index.toString()}>
              <Row className="u-ct" >
                <Col {...colLeft} >
                  <Item
                    {...formItemLayout}
                    label="联系人姓名"
                    required
                    dataIndex={`contactList[${index}].contactName`}
                    rules={[{ required: true, message: '请输入联系人姓名' }]}
                    decorator={
                      isEditing ?
                        <Input maxLength={maxLength} placeholder="联系人姓名" /> : <span>{_.get(updateForm, `contactList[${index}].contactName`, '')}</span>
                    }
                  />
                </Col>
                <Col {...colRight}>
                  <Item
                    {...formItemLayout}
                    label="职务"
                    required
                    dataIndex={`contactList[${index}].position`}
                    rules={[{ required: true, message: '请填写职务' }]}
                    decorator={
                      isEditing ?
                        <Input maxLength={20} placeholder="联系人职务" /> : <span>{_.get(updateForm, `contactList[${index}].position`, '')}</span>
                    }
                  />
                </Col>
              </Row>

              <Row className="u-ct" >
                <Col {...colLeft} >
                  <Item
                    {...formItemLayout}
                    required
                    label="手机"
                    dataIndex={`contactList[${index}].mobilePhone`}
                    rules={[{ required: true, message: '请输入联系人手机号码' }]}
                    decorator={
                      isEditing ?
                        <Input placeholder="联系人手机号码" /> : <span>{_.get(updateForm, `contactList[${index}].mobilePhone`, '')}</span>
                    }
                  />
                </Col>
                <Col {...colRight}>
                  <Item
                    {...formItemLayout}
                    required
                    label="邮箱"
                    dataIndex={`contactList[${index}].contactEmail`}
                    rules={[{ required: true, message: '请输入联系人邮箱' }, descriptor.email]}
                    decorator={
                      isEditing ?
                        <Input maxLength={maxLength} placeholder="联系人邮箱" /> : <span>{_.get(updateForm, `contactList[${index}].contactEmail`, '')}</span>
                    }
                  />
                </Col>
              </Row>
              {
                isEditing && 
                <div className="u-operate-icon" style={{ marginLeft: 20 }}>
                  {
                    index === 0 && contactKeys.length < 10 && 
                    <a onClick={this.addContactItem} style={{ color: '#4680fe', marginRight: 20 }}>添加</a>
                  }
                  {
                    index > 0 &&
                    <a onClick={() => this.removeContactItem(k, index)}>删除</a>
                  }
                </div>
              }

            </section>
          ))
        }
      </FormEx2>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.info.updateForm,
    contactKeys: state.info.contactKeys,
    contactUuid: state.info.contactUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'info'), null, { forwardRef: true })(Contact)