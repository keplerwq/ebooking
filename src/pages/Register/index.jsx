
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { QuestionCircleOutlined } from '@ant-design/icons';
import dispatchs from 'src/redux/dispatchs';
import './register.scss';
import { Account, Contact, Company, Credentials, ResourcesContact, ResourcesCompany, ResourcesCredentials,PublicCompany,PublicContact,PublicManagement,StationsContact, StationsCompany, StationsOperating } from './form';
import backIcon from 'src/resource/img/reg/back.png';


const SupplierGuide = function (props) {

  const query = props?.match?.params;
  const { type = '0' } = query;


  const getPdfUrl = (type) => {
    let name = '';
    switch (type) {
      case '0':  name = 'it'; break;
      case '1':  name = 'resource'; break;
      case '2':  name = 'hardware'; break;
      case '10':  name = 'administrative'; break;
      default: console.error('没有匹配！');
    }

    return name ? `/resource/supplier-guide/${name}.pdf` : false;
  }

  const url = getPdfUrl(type);

  return (
    <div
      onClick={() => window.open(url)}
      style={{
        position: 'fixed',
        left: '25px',
        bottom: '50px',
        cursor: 'pointer',
        zIndex: 999999,
        display: url ? void 0 : 'none',
        fontSize: '18px'
      }}>
      <QuestionCircleOutlined />
      {' 帮助'}
    </div>
  )
}

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillUnmount() {
    const { registerDataReset } = this.props.actions;
    registerDataReset();
  }

  previousStep = () => {
    const { changeStep } = this.props.actions;
    let { step } = this.props;
    changeStep(--step);
  }

  render() {
    let { step, history } = this.props;
    // step=22;
    return (
      <div className="g-register">
        <SupplierGuide {...this.props} />
        <header className="g-banner"></header>
        <div className="g-wrapper">
          <div className={(step === 33 || step === 34) ? "m-reg m-big-reg" : "m-reg"}>
            <div className="g-reg-body">
              {
                (step !== 1 && step !== 11 && step !== 21  && step !== 31) &&
                <a className="u-back" onClick={this.previousStep}>
                  <img src={backIcon} alt="" />
                  返回上一步
                </a>
              }

              {/* <Account />
              <Contact />
              <Company />
              <Credentials history={history} /> */}
              {/* <ResourcesContact /> */}
              {/* <ResourcesCompany /> */}
              {/* <ResourcesCredentials /> */}

              {
                (step === 1 || step === 11||step === 21 || step === 31) && <Account history={history} />
              }
              {
                step === 2 && <Contact />
              }
              {
                step === 3 && <Company />
              }
              {
                step === 4 && <Credentials history={history} />
              }

              {
                step === 12 && <ResourcesContact />
              }
              {
                step === 13 && <ResourcesCompany />
              }
              {
                step === 14 && <ResourcesCredentials history={history} />
              }
              {
                step === 22 && <PublicContact />
              }
              {
                step === 23 && <PublicCompany />
              }
              {
                step === 24 && <PublicManagement history={history} />
              }
              {
                step === 32 && <StationsContact />
              }

              {
                step === 33 && <StationsCompany />
              }

              {
                step === 34 && <StationsOperating history={history} />
              }
            </div>

          </div>
        </div>

        <footer className="g-ft">
          <div>
            <span>
              <a href="https://jubao.163.com/" target="_blank" style={{color: "#1890FF"}}>廉正举报</a>
            </span>
          </div>
          <div>
            <span>
              <a href="http://beian.miit.gov.cn/" target="_blank" style={{}}>工业和信息化部备案管理系统&nbsp;&nbsp;粤B2-20090191-2</a>
            </span>
          </div>
          <span>网易公司版权所有 © 1997-2020</span>
        </footer>
        {/* <footer className="g-ft">网易公司版权所有 © 1997-2020</footer> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    step: state.register.step,
  };
}

const RegisterWithConnect = connect(mapStateToProps, dispatchs('app', 'register'))(Register)

export default function RegisterWithConnectPage(props) { return <RegisterWithConnect {...props} />; }