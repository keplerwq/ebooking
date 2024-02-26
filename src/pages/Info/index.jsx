//通用类企业基本信息

import React, { Component } from 'react';
import _ from 'lodash';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Content, message } from 'src/components';
import { Button, Row, Col } from 'antd';
import { FormEx2 } from 'src/components';
import api from 'src/api';
import './Info.scss';
import OpHeader from './components/OpHeader';
import {  Contact, Company, Credentials,   } from './form';
import downloadIcon from 'src/resource/img/info/download.png';
import { regFormSubmit } from 'src/helps/regFormSubmit'
import editPng from 'src/resource/img/info/edit.png';
import infoConfirm from './InfoConfirm';

const { Item } = FormEx2;

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      showPwd: false,
      isEditing: false,   //是否处于编辑状态
      isDirty: false,
    };
  }

  hasSave = () => {
    this.setState({isDirty: true})
  }

  toggleEye = () => {
    this.setState((preState) => {
      return {
        showPwd: !preState.showPwd
      }
    });
  }


  /**
   * @function 点击编辑，进行修改操作
   *
   */
  onEdit = () => {
    this.setState({
      isEditing: true
    });
  }


  /**
   * @function 修改数据，调用后端接口，如果存在二次确认，则在修改成功后关闭弹框
   *
   */
  updateInfo = (form, close) => {
    api.infoModify(form).then((res) => {
      console.log(res)
      message.success('提交成功', 3);
      _.isFunction(close) && close();
      this.props.actions.authGetInfo();
      this.setState({
        isEditing: false
      });
    });
  }


  /**
   * @function 确认
   *
   */
  onSubmitAll = () => {
    // 做校验
    let validateContact = false;
    let validateCompany = false;
    let validateCredentials = false;
    this.contactRef.form.submit(
      () => {  //联系人信息校验通过
        validateContact = true;
        console.log('validateContact1'+validateContact)
      }
    );
    this.companyRef.form.submit(
      () => {  //公司信息校验通过
        validateCompany = true;
        console.log('validateCompany2'+validateCompany)
      }
    );
    this.credentialsRef.form.submit(
      () => {  //资质信息校验通过
        validateCredentials = true;
        console.log(' validateCredentials3'+ validateCredentials)
      }
    );
    if (validateContact && validateCompany && validateCredentials) {
      const { initFormData, updateForm } = this.props;
      const formData = _.cloneDeep(updateForm);
      const form = regFormSubmit(formData);
      console.log(initFormData, formData, '*************', !_.isEqual(initFormData.company, formData.company) || !_.isEqual(initFormData.qualification, formData.qualification));
      if (!_.isEqual(initFormData.company, formData.company) || !_.isEqual(initFormData.qualification, formData.qualification)) {
        infoConfirm({}, (close) => {  //弹框确认
          this.updateInfo(form, close);
        }, () => {  //取消
        });
      }
      else {
        this.updateInfo(form);
      }
    }
  }



  /**
   * @function 返回操作
   *
   */
  onBack = () => {
    this.props.actions.authGetInfo();
    this.setState({
      isEditing: false
    });
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
        xl: { span: 8},
        xxl: { span : 5},
      },
      wrapperCol: {
        sm: { span: 16 },
        xl: { span: 16},
        xxl: { span : 19},
      },
    };


    const {  showPwd, isDirty, isEditing } = this.state;
    const { updateForm, editStatus, userInfo, mapStatusToText } = this.props;
    console.log(editStatus);
    console.log(isDirty);
    /**
     * status
     * 0   审核中
     * 1   审核通过
     * -1  审核不通过
     */
    const { status } = updateForm;


    return (
      <div>

        <div className="m-sub-header">
          <span>供应商状态:  {mapStatusToText(userInfo.status)}</span>
          {
            !isEditing && status !== 0 &&
            <a style={{ marginLeft: 40 }} onClick={this.onEdit}>
              <img src={editPng} alt=""/>
              <span>修改信息</span>
            </a>
          }
        </div>
        <div >
          {/*<span>供应商状态:  {mapStatusToText(userInfo.status)}</span>*/}
          {
            !isEditing && status == -1 &&
            <div className="refuse--text--show">
              <p className="refuse--text">审核被驳回 驳回原因：{ _.get(updateForm, 'refuseReason', '') }</p>
            </div>
          }
        </div>

        <Content size="full">
          <section className={`m-info ${ isEditing ? 'm-edit-info' : 'm-read-info' }`}>
            <div className="g-panel">
              <OpHeader name="账户信息" canEdit={false}/>

              <Row className="u-ct g-wrapper s-edit" >
                <Col {...colLeft} >
                  <Item {...formItemLayout} label="帐号">
                    { _.get(updateForm, 'emailAccount.email', '') }
                  </Item>
                </Col>
                <Col {...colRight}>
                  <Item {...formItemLayout} label="账户密码">
                    { showPwd ? _.get(updateForm, 'emailAccount.password', '') : '********' }
                    <a className={showPwd? 'u-hide-pwd' : ''} onClick={this.toggleEye} style={{marginLeft: '20px'}}>
                      { showPwd ? '隐藏' : '查看' }
                    </a>
                  </Item>
                </Col>
              </Row>
            </div>

            <div className="g-panel">
              <Contact hasSave={this.hasSave} isEditing={isEditing} ref={ref => this.contactRef = ref}/>
            </div>

            <div className="g-panel">
              <Company hasSave={this.hasSave} isEditing={isEditing} ref={ref => this.companyRef = ref}/>
            </div>

            <div className="g-panel">
              <Credentials hasSave={this.hasSave} isEditing={isEditing} ref={ref => this.credentialsRef = ref}/>
            </div>

            <div className="g-panel" style={{border: 0}}>
              <OpHeader name="合作信息" canEdit={false}/>
              <Row className="u-ct g-wrapper s-edit" >
                <Col {...colLeft} >
                  <Item {...formItemLayout} label="框架协议合同号">
                    { _.get(updateForm, 'cooperation.contract', '') }
                  </Item>
                </Col>
                <Col {...colRight}>
                  <Item {...formItemLayout} label="框架协议">
                    <span>
                      { _.get(updateForm, 'cooperation.contractFile', '') ?
                        <span>
                          <a href={ _.get(updateForm, 'cooperation.contractFile', '') } target="_blank">  <img src={downloadIcon} alt=''/>  下载附件 </a>
                        </span>

                        : <span>未签订框架协议</span>
                      }
                    </span>
                  </Item>
                </Col>
              </Row>
            </div>
            {
              isEditing && status !== 0 &&
              <div className="m-operate g-panel">
                <Button type="default" onClick={this.onBack}>返回</Button>
                <Button type="primary" onClick={this.onSubmitAll}>确认</Button>
              </div>
            }
          </section>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initFormData: state.info.initFormData,
    updateForm: state.info.updateForm,
    editStatus: state.info.editStatus,
    mapStatusToText: state.app.mapStatusToText,
    userInfo: state.app.userInfo,
  };
}

const InfoWithConnect = connect(mapStateToProps, dispatchs('app', 'info'))(Info)

export default function InfoWithConnectPage(props) { return <InfoWithConnect {...props} />; }