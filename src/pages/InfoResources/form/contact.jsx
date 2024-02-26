// 联系信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input } from 'antd';
import { FormEx2 } from 'src/components';
import { descriptor, } from 'src/libs';
import OpHeader from '../components/OpHeader';
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

  componentDidMount() {

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
    // const { dataSource } = this.state;
    // const newData = {
    //   key: contactUuid,
    //   contactName: '',
    //   position: '',
    //   mobilePhone: '',
    //   contactEmail: ''
    // }
    // this.setState({ dataSource: [...dataSource, newData]});
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

    // this.setState({});

    let contact = _.cloneDeep(this.form.getValue('contactList'));
    contact.splice(index, 1);
    this.form.setValue('contactList', contact);
  }

  render() {
    const { updateForm = {}, isEditing = false, contactKeys = [] } = this.props;
    const { status } = updateForm;
    // const { dataSource } = this.state;
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
          canEdit={canEdit && contactKeys.length < 10}
          isEditing={isEditing}
          clickMethod={() => this.addContactItem()}
          buttonTitle="新增联系人"
          extraInfo={
            <span style={{ color: '#999', display: 'inline-block' }}>(订单、询价等业务邮件将发送至所有联系人的邮箱)</span>
          }
        />
        <table className="ant-table table-contact">
          <thead className="ant-table-thead">
            <tr>
              <th><div>联系人姓名</div></th>
              <th><div>职务</div></th>
              <th><div>联系人电话</div></th>
              <th><div>联系人邮箱</div></th>
              {
                isEditing ? <th><div>操作</div></th> : null
              }
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
            {
              contactKeys.map((k, index) => (
                <tr key={index}>
                  <td>
                    {
                      <Item
                        label=""
                        required
                        dataIndex={`contactList[${index}].contactName`}
                        rules={[{ required: true, message: '请输入联系人姓名' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="联系人姓名" />
                            : <span>{_.get(updateForm, `contactList[${index}].contactName`, '')}</span>
                        }
                      />
                    }
                  </td>
                  <td>
                    {
                      <Item
                        label=""
                        required
                        dataIndex={`contactList[${index}].position`}
                        rules={[{ required: true, message: '请填写职务' }]}
                        decorator={
                          isEditing ?
                            <Input maxLength={maxLength} placeholder="联系人职务" />
                            : <span>{_.get(updateForm, `contactList[${index}].position`, '')}</span>
                        }
                      />
                    }
                  </td>
                  <td>
                    <Item
                      required
                      label=""
                      dataIndex={`contactList[${index}].mobilePhone`}
                      rules={[{ required: true, message: '请输入联系人手机号码' }]}
                      decorator={
                        isEditing ?
                          <Input style={{width:200}} placeholder="联系人手机号码" />
                          : <span>{_.get(updateForm, `contactList[${index}].mobilePhone`, '')}</span>
                      }
                    />
                  </td>
                  <td>
                    <Item
                      required
                      label=""
                      dataIndex={`contactList[${index}].contactEmail`}
                      rules={[{ required: true, message: '请输入联系人邮箱' }, descriptor.email]}
                      decorator={
                        isEditing ?
                          <Input maxLength={maxLength} placeholder="联系人邮箱" />
                          : <span>{_.get(updateForm, `contactList[${index}].contactEmail`, '')}</span>
                      }
                    />
                  </td>
                  {
                    isEditing && index > 0 &&
                    <td>
                      <a onClick={() => this.removeContactItem(k, index)}>删除</a>
                    </td>
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
        {/* <Table
          rowKey={record => record.key}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        /> */}
      </FormEx2>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    updateForm: state.infoResources.updateForm,
    contactKeys: state.infoResources.contactKeys,
    contactUuid: state.infoResources.contactUuid
  };
}

export default connect(mapStateToProps, dispatchs('app', 'infoResources'), null, { forwardRef: true })(Contact)
