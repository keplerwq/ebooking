// 基建类企业基本信息

import React, { Component } from "react";
import _ from "lodash";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Content, message } from "src/components";
import { ClockCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Anchor, Modal } from "antd";
import api from "src/api";
import infoConfirm from "./InfoConfirm";
import {
  Account,
  Base,
  License,
  Authorization,
  Branch,
  Contact,
  Bank,
  Insurance,
  Fund,
  Finance,
  Case,
} from "./components";
import "./infoBase.scss";
import { regBaseFormSubmit } from "src/helps/regFormSubmit";
const { Link } = Anchor;

class InfoBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
  }

  handleAnchorClick = (e, { href = "" }) => {
    e.preventDefault();
    // window.scrollTo(window.pageXOffset, 800)
  };

  onEdit = () => {
    this.setState({
      isEditing: true,
    });
  };

  onBack = () => {
    this.props.actions.authGetInfo();
    this.setState({
      isEditing: false,
    });
  };

  updateInfo = (form, close) => {
    api.infoModify(form).then((res) => {
      // console.log(res)
      message.success("提交成功", 3);
      _.isFunction(close) && close();
      this.props.actions.authGetInfo();
      this.setState({
        isEditing: false,
      });
    });
  };

  onSubmitAll = () => {
    // 做校验
    let validateBase = false;
    let validateLicense = false;
    let validateAuth = false;
    let validateBranch = false;
    let validateContact = false;
    let validateBank = false;
    let validateInsurance = false;
    let validateFund = false;
    let validateFinance = false;
    let validateCase = false;
    let { branchKeys,caseKeys} = this.props;

    this.baseRef.form.submit(() => {
      validateBase = true;
    });
    this.licenseRef.form.submit(() => {
      validateLicense = true;
    });
    this.authRef.form.submit(() => {
      validateAuth = true;
    });
    if (branchKeys && branchKeys.length >= 1) {
      this.branchRef.form.submit(() => {
        validateBranch = true;
      });
    } else {
      validateBranch = true;
    }
    this.contactRef.form.submit(() => {
      validateContact = true;
    });
    this.bankRef.form.submit(() => {
      validateBank = true;
    });
    const { updateForm } = this.props;
    const { bankCardList } = updateForm;
    const flagSwift = bankCardList.some(
      (item) => item.settCurrency !== "人民币" && !item.swiftCode
    );
    if (flagSwift) {
      Modal.error({
        title: "信息不全",
        content: (
          <div style={{ lineHeight: "35px" }}>
            非人名币结算的银行卡，需填写Swiftcode的字段信息，以保证后续可打款结算
          </div>
        ),
      });
      validateBank = false;
    }
    this.insuranceRef.form.submit(() => {
      validateInsurance = true;
    });
    this.fundRef.form.submit(() => {
      validateFund = true;
    });
    this.financeRef.form.submit(() => {
      validateFinance = true;
    });
    if (caseKeys && caseKeys.length >= 1) {
      this.caseRef.form.submit(() => {
        validateCase = true;
      });
    } else {
      validateCase = true;
    }

    if (
      validateBase &&
      validateLicense &&
      validateAuth &&
      validateBranch &&
      validateContact &&
      validateBank &&
      validateInsurance &&
      validateFund &&
      validateFinance &&
      validateCase
    ) {
      const formData = _.cloneDeep(updateForm);
      const form = regBaseFormSubmit(formData);
      const config = {
        title: "是否确认提交供应商信息变更？",
        icon: (
          <ExclamationCircleFilled style={{ color: "#f89f4d" }} />
        ),
        width: 420,
        okText: "确定",
      };
      infoConfirm(
        "提交审核后，供应商信息将进行再次审核，审核过程中无法进行修改，是否确认提交？",
        config,
        (close) => {
          //弹框确认
          this.updateInfo(form, close);
        },
        () => {
          //取消
        }
      );
    } else {
      message.error("信息填写有误，请检查后提交", 3);
    }
  };
  render() {
    let { updateForm, mapBaseStatusToText } = this.props;
    const { isEditing } = this.state;
    const { emailAccount = {} } = updateForm;
    // let { status } = emailAccount;
    let  status  = 1;

    return (
      <div className="m-info-base" id="m-info-base">
        <div className="m-sub-header">
          <span>
            {_.get(updateForm, "company.companyName", "")}
            <span className="m-sub-header-status">
              <ClockCircleFilled style={{ fontSize: "14px", color: "#f89f4d" }} />
              {mapBaseStatusToText(status)}
            </span>
          </span>
          {!isEditing && status !== 0 && (
            <div className="m-sub-header-btns">
              <Button type="primary" ghost onClick={this.onEdit}>
                编辑供应商信息
              </Button>
            </div>
          )}
          {isEditing && status !== 0 && (
            <div className="m-sub-header-btns">
              <Button type="primary" ghost onClick={this.onBack}>
                取消编辑
              </Button>
              <Button type="primary" onClick={this.onSubmitAll}>
                提交审核
              </Button>
            </div>
          )}
        </div>
        <div className="m-header-anchor">
          <Anchor onClick={this.handleAnchorClick}>
            <Link href="#m-info-base" title="帐号信息" />
            <Link href="#sation-base" title="基本信息" />
            <Link href="#sation-license" title="营业执照信息"></Link>
            <Link href="#sation-auth" title="授权及特定资质"></Link>
            <Link href="#sation-branch" title="分公司信息"></Link>
            <Link href="#sation-contact" title="人员信息"></Link>
            <Link href="#sation-bank" title="银行卡信息"></Link>
            <Link href="#sation-insurance" title="社保登记信息"></Link>
            <Link href="#sation-fund" title="出资信息"></Link>
            <Link href="#sation-finance" title="近3年财务信息"></Link>
            <Link href="#sation-case" title="近3年案例信息"></Link>
          </Anchor>
        </div>
        <div className="refuse--text--container">
          {/*<span>供应商状态:  {mapStatusToText(userInfo.status)}</span>*/}
          {/* !isEditing &&  */}
          {status == -1 && (
            <div className="refuse--text--show">
              <p className="refuse--text">
                <CloseCircleFilled style={{ fontSize: "14px", color: "#d9001b",marginRight:"15px" }} />
                审核被驳回 驳回原因：{_.get(updateForm, "refuseReason", "")}
              </p>
            </div>
          )}
        </div>
        <Content size="full">
          <section className={`${isEditing ? "m-edit-info" : "m-read-info"}`}>
            <Account
              emailAccount={emailAccount}
              ref={(ref) => (this.accountRef = ref)}
              id="sation-account"
            />

            <Base isEditing={isEditing} ref={(ref) => (this.baseRef = ref)} />

            <License
              isEditing={isEditing}
              ref={(ref) => (this.licenseRef = ref)}
            />

            <Authorization
              isEditing={isEditing}
              ref={(ref) => (this.authRef = ref)}
            />

            <Branch
              isEditing={isEditing}
              ref={(ref) => (this.branchRef = ref)}
            />

            <Contact
              isEditing={isEditing}
              ref={(ref) => (this.contactRef = ref)}
            />

            <Bank isEditing={isEditing} ref={(ref) => (this.bankRef = ref)} />

            <Insurance
              isEditing={isEditing}
              ref={(ref) => (this.insuranceRef = ref)}
            />

            <Fund isEditing={isEditing} ref={(ref) => (this.fundRef = ref)} />

            <Finance
              isEditing={isEditing}
              ref={(ref) => (this.financeRef = ref)}
            />

            <Case isEditing={isEditing} ref={(ref) => (this.caseRef = ref)} />
          </section>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    updateForm: state.infoBase.updateForm,
    mapBaseStatusToText: state.app.mapBaseStatusToText,
    branchKeys: state.infoBase.branchKeys,
    caseKeys: state.infoBase.caseKeys,
  };
};
// m-header-anchor-content
const InfoBaseWithConnect = connect(
  mapStateToProps,
  dispatchs("app", "infoBase")
)(InfoBase)

export default function InfoBaseWithConnectPage(props) { return <InfoBaseWithConnect {...props} />; }