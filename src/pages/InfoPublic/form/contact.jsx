// 联系人信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input,Select,Empty } from 'antd';
import { FormEx2 } from 'src/components';
import { descriptor, } from 'src/libs';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';

const { Item } = FormEx2;
const { Option } = Select;
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
      <div id="sation-contact">
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
          // extraInfo={
          //   <span style={{ color: '#999', display: 'inline-block' }}>(订单、询价等业务邮件将发送至所有联系人的邮箱)</span>
          // }
          />
          <table className="ant-table table-contact">
            <thead className="ant-table-thead">
              <tr>
                <th><div>联系人姓名<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>职务<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>联系人电话<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                <th><div>联系人邮箱<span style={{ color: "#ff4d4f" }}> *</span></div></th>
                {
                  isEditing ? <th><div>操作</div></th> : null
                }
              </tr>
            </thead>
            {contactKeys&&contactKeys.length>=1 &&(
              <tbody className="ant-table-tbody">
                {
                  contactKeys.map((k, index) => (
                    <tr key={index}>
                      <td>
                    
                        
                        {  isEditing ?
                          
                          ( <Item
                            label=""
                            required
                            // style={{width:300}}
                          >
                            <Item
                              colon={false}
                              label=""
                              required
                              dataIndex={`contactList[${index}].contactName`}
                              style={{
                                display:"inline-block",
                                width:"calc(100%-90px)",
                          
                              }}
                              rules={[{ required: true, message: '请输入联系人姓名' },]}
                              decorator = {
                                <Input style={{width:"90%"}}   placeholder="请输入联系人姓名" />
                              }
                            />
                    
                            <Item
                              colon={false}
                              label=""
                              defaultValue={"先生"}
                              dataIndex={`contactList[${index}].gender`}
                              style={{
                                display: "inline-block",
                                width: "90px"
                              }}
                              rules={[{ required: true, message: '请选择性别' }]}
                              decorator={
                                <Select>
                                  <Option value="先生">先生</Option>
                                  <Option value="女士">女士</Option>
                                </Select>
                              }/>
                          </Item>
                          )
                          : <span>{_.get(updateForm, `contactList[${index}].contactName`, '')}&nbsp;{_.get(updateForm, `contactList[${index}].gender`, '')}</span>
                        }
                       
                      
                      </td>
                      <td>
                        {
                          <Item
                            label=""
                            required
                            dataIndex={`contactList[${index}].position`}
                            // style={{width:300}}
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
                          // style={{width:300}}
                          rules={[{ required: true, message: '请输入联系人手机号码' }]}
                          decorator={
                            isEditing ?
                              <Input  placeholder="联系人手机号码" />
                              : <span>{_.get(updateForm, `contactList[${index}].mobilePhone`, '')}</span>
                          }
                        />
                      </td>
                      <td>
                        <Item
                          required
                          label=""
                          dataIndex={`contactList[${index}].contactEmail`}
                          // style={{width:300}}
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
            )
            }
          </table>
          {!(contactKeys && contactKeys.length >= 1) && (
            <Empty
              style={{ marginTop: "10px" }}
              description={<span >暂无数据 </span>}
            ></Empty>
          )}
       
        </FormEx2>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoPublic.updateForm,
    contactKeys: state.infoPublic.contactKeys,
    contactUuid: state.infoPublic.contactUuid
  };
}

export default connect(
  mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true }
)(Contact)
