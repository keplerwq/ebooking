
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './forget.scss';
import {  Find, Reset  } from './form';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      email: '',
    };
  }

  previousStep = () => {
    this.props.history.push('/login')
  }

  changeStep = (step, form = {}) => {
    const { email } = form;
    this.setState({step, email});
  }

  render() {
    const { step, email } = this.state;
    const { history } = this.props;
    
    return (
      <div className="g-forget">
        <header className="g-banner"></header>
        <div className="g-wrapper">
          <div className="m-reg">
            <div className="g-reg-body">
              {
                step === 1 && <a  className="u-back" onClick={this.previousStep}><ArrowLeftOutlined /> &nbsp; 返回上一步</a>
              }
              
              {
                step === 1 && <Find changeStep={this.changeStep}/>
              }
            
              {
                step === 2 && <Reset email={email} history={history}/>
              }
            </div>
           
          </div>
        </div>


        <footer className="g-ft">网易公司版权所有 © 1997-2020</footer>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const MainWithConnect = connect(mapStateToProps, dispatchs('app', 'register'))(Main);

export default function MainWithConnectPage(props) { return <MainWithConnect {...props} />; }