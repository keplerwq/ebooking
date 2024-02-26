
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Content } from 'src/components';
import _ from 'lodash';
import dispatchs from 'src/redux/dispatchs';
import './Home.scss';
import fireIcon from 'src/resource/img/home/fire.png';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Content size="full">
        <div className="m-home">

          <div className="u-panel">
            <header className="u-tt"> 
              <span className="u-name">网易集团供应商火热招募中  <img src={fireIcon} alt=""/> </span>
              
            </header>
            <div className="u-wrapper">
              <div className="u-sbtt">
                <span className="u-name">品类不限</span>
              </div> 
              <div className="u-item">电脑整机、电脑配件、手机整机、手机配件、电视整机、电视配件、外设产品、数码影音、智能设备、软件、SSL证书、家居家装类等等</div>
            </div>
            <div >
              <div className="u-sbtt">
                <span className="u-name">品牌不限</span>
              </div> 
              <div className="u-item">索尼、戴尔、罗技、惠普、苹果、三星、华为、戴森、美的、格力、飞利浦等等</div>
            </div>
          </div>

          <div className="u-panel">
            <header className="u-tt"> 
              <span className="u-name">我们是网易集团采购</span>
            </header>
            <div className="u-item">网易集团采购服务于网易集团以及每一位员工，采购内容包括网易集团层面的桌面类IT设备、数码产品、手机通讯以及智能设备等。</div>
            <div className="u-item">也包括每一位员工所能涉及到的生活、工作等每一个方面的所需品，例如：家用电器、数码产品、家居产品等</div>
          </div>
          <div className="u-wel-msg">
          </div>
        </div>
      </Content>
      
    );
  }
}

const mapStateToProps = () => {
  return {};
}

export default connect(mapStateToProps, dispatchs('app'))(Home)