//行政类企业基本信息

import React, { Component, useContext } from 'react';
import _ from 'lodash';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { Content, message } from 'src/components';
import { ClockCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Row, Col, Modal, Anchor } from 'antd';
import { FormEx2 } from 'src/components';
import api from 'src/api';
import './InfoPublic.scss';
import { AuthTreeContext } from 'src/libs/context';
import { Company, Credentials, Bank,Authorization,Customer,Financial} from './form';
import { regPublicFormSubmit } from 'src/helps/regFormSubmit'
import infoConfirm from './InfoConfirm';

import { convertSubmitDataToNew } from '../../utils/convert'

const { Link } = Anchor;

class InfoPublic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      showPwd: false,
      isEditing: false,   //是否处于编辑状态
      isDirty: false,
    };
  }

  componentDidMount() {
    this.props.actions.authGetInfo();
  }


  handleAnchorClick = (e, { href = "" }) => {
    e.preventDefault();
  };

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
    const isNewEdition = Boolean(localStorage.getItem('NEW_EDITION'));
    //判断是否为新接口编辑
    if (isNewEdition) {
      const formData = convertSubmitDataToNew(form);
      // return
      api.supplierDetailsModify(formData).then(res => {
        message.success('提交成功', 3);
        _.isFunction(close) && close();
        this.props.actions.authGetInfo();
        this.setState({
          isEditing: false
        });
      })
    } else{
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
  }


  /**
   * @function 提交审核
   *
   */
  onSubmitAll = () => {
    // 做校验
    // TODO：Contact 功能已经去除，保留注释一段时间备用，后期再删除
    // let validateContact = false;
    let validateCompany = false;
    let validateCredentials = false;
    let validateBank = false;
    let validateAuthorization = false;
    let validateFinancial = false;
    let validateCustomer = false;
    let { customerKeys, financialKeys,authorKeys} = this.props;
    if (customerKeys && customerKeys.length <= 0) {
      validateCustomer = true;
    } else {
      this.customerRef.form.submit(() => {
        validateCustomer = true;
      });
    }

    if (financialKeys && financialKeys.length <= 0) {
      validateFinancial = true;
    } else {
      this.financialRef.form.submit(() => {
        validateFinancial = true;
      });
    }
    if (authorKeys && authorKeys.length <= 0) {
      validateAuthorization = true;
    } else {
      this.authorizationRef.form.submit(() => {
        validateAuthorization = true;
      });
    }
    // TODO：Contact 功能已经去除，保留注释一段时间备用，后期再删除
    // this.contactRef.form.submit(
    //   () => {  //联系人信息校验通过
    //     validateContact = true;
    //     console.log('validateContact1'+validateContact)
    //   }
    // );
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
    this.bankRef.form.submit(
      () => {  //银行卡校验通过
        validateBank = true;
      }
    );
    const { updateForm } = this.props;
    const {bankCardList} = updateForm ;
    const flagSwift = bankCardList.some((item)=> item.settCurrency !=='人民币'&&!item.swiftCode);
    if(flagSwift){
      Modal.error({
        title:'信息不全',
        content:(
          <div style={{lineHeight:"35px"}}>
            非人民币结算的银行卡，需填写Swiftcode的字段信息，以保证后续可打款结算
          </div>
        )
      });
      validateBank = false;
    }


    if (
    // TODO：Contact 功能已经去除，保留注释一段时间备用，后期再删除
    // validateContact &&
      validateCompany && validateCredentials & validateBank & validateAuthorization & validateFinancial & validateCustomer
    ) {
      const { updateForm,initFormData } = this.props;
      const formData = _.cloneDeep(updateForm);
      const form = regPublicFormSubmit(formData);

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
   * @function 取消编辑
   *
   */
  onBack = () => {
    // this.props.form.resetFields();
    this.props.actions.authGetInfo();
    this.setState({
      isEditing: false
    });
  }

  getEditAuth = () => {
    const { getPageOperation } = this.props.authTree;
    return getPageOperation({
      pageCode: 's_front_supplier_detail',
      operationCode: 'edit_supplier_info'
    });
  }

  render() {
    const colLeft = {
      span: 11,
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


    const { isEditing } = this.state;
    let { updateForm,  mapBaseStatusToText } = this.props;
    const {emailAccount={}}=updateForm;
    let { status }= emailAccount;

    return (
      <div className="m-info-public" id="m-info-public">

        <div className="m-sub-header">
          <span>
            {_.get(updateForm, "company.companyName", "")}
            <span className="m-sub-header-status">
              <ClockCircleFilled style={{ fontSize: "14px", color: "#f89f4d" }} />
              {mapBaseStatusToText && mapBaseStatusToText(status)}
            </span>
          </span>
          {
            !isEditing && status !== 0 && this.getEditAuth() &&
           (<div className="m-sub-header-btns">
             <Button type="primary" ghost onClick={this.onEdit} >编辑供应商信息</Button>
           </div>)
          }

          {
            isEditing && status !== 0 &&
              (
                <div className="m-sub-header-btns" >
                  <Button type="default" onClick={this.onBack}>取消编辑</Button>
                  <Button type="primary" style={{marginLeft:"10px"}} onClick={this.onSubmitAll}>提交审核</Button>
                </div>
              )
          }
        </div>
        <div className="m-header-anchor">
          <Anchor onClick={this.handleAnchorClick}>
            {/* <Link href="#m-info-public" title="账户信息" /> */}
            <Link href="#sation-company" title="公司信息" />
            <Link href="#sation-credentials" title="资质信息"></Link>
            <Link href="#sation-authorization" title="授权及特定资质证明"></Link>
            {/* <Link href="#sation-contact" title="联系人信息"></Link> */}
            <Link href="#sation-bank" title="银行卡信息"></Link>
            <Link href="#sation-financial" title="近3年财务信息"></Link>
            <Link href="#sation-customer" title="主要客户信息"></Link>
          </Anchor>
        </div>
        <div className="refuse--text--container" >
          {/*<span>供应商状态:  {mapStatusToText(userInfo.status)}</span>*/}
          {
            status == -1 &&
            (
              <div className="refuse--text--show">
                <p className="refuse--text">
                  <CloseCircleFilled style={{ fontSize: "14px", color: "#d9001b",marginRight:"15px" }} />
                审核被驳回 驳回原因：{_.get(updateForm, "emailAccount.refuseReason", "")}
                </p>
              </div>
            )
          }

        </div>


        <Content size="full">
          <section className={`m-info ${ isEditing ? 'm-edit-info' : 'm-read-info' }`}>
            {/* <div className="g-panel">
              <OpHeader name="账户信息" canEdit={false}/>

              <Row className="u-ct g-wrapper s-edit" >
                <Col {...colLeft} >
                  <Item {...formItemLayout} label="账号">
                    { _.get(updateForm, 'emailAccount.email', '') }
                  </Item>
                </Col>
              </Row>
            </div> */}


            <div className="g-panel">
              <Company  isEditing={isEditing} ref={ref => this.companyRef = ref}/>
            </div>

            <div className="g-panel">
              <Credentials  isEditing={isEditing} ref={ref => this.credentialsRef = ref}/>
            </div>
            <div className="g-panel">
              <Authorization  isEditing={isEditing} ref={ref => this.authorizationRef = ref}/>
            </div>
            {
              // TODO：Contact 功能已经去除，保留注释一段时间备用，后期再删除
              /* <div className="g-panel">
                <Contact  isEditing={isEditing} ref={ref => this.contactRef = ref}/>
              </div> */
            }
            <div className="g-panel">
              <Bank isEditing={isEditing} ref={ref => this.bankRef = ref}/>
            </div>
            <div className="g-panel">
              <Financial  isEditing={isEditing} ref={ref => this.financialRef = ref}/>
            </div>
            <div className="g-panel">
              <Customer  isEditing={isEditing} ref={ref => this.customerRef = ref}/>
            </div>
          </section>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initFormData: state.infoPublic.initFormData,
    updateForm: state.infoPublic.updateForm,
    mapBaseStatusToText: state.app.mapBaseStatusToText,
    userInfo: state.app.userInfo,
    financialKeys:state.infoPublic.financialKeys,
    customerKeys:state.infoPublic.customerKeys,
    authorKeys:state.infoPublic.authorKeys
  };
}

const InfoPublicWithConnect = connect(
  mapStateToProps, dispatchs('app', 'infoPublic'),null,{forwardRef:true}
)(InfoPublic)

const InfoPublicWithForm = Form.create()(InfoPublicWithConnect)

export default function ContextEnhance(props) {
  const authTree = useContext(AuthTreeContext);

  return <InfoPublicWithForm {...props} authTree={authTree} />
}