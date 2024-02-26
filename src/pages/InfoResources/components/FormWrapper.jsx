import React, { Component } from 'react';
import { Row, Col } from 'antd';
import './FormWrapper.scss';



class FormWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }



  render() {
    const defaultLayout = {
      left:  {
        span: 11,
      },
      right: {
        span: 11,
        offset: 1,
      } 
    }
    
    let { layout = {}, left, right } = this.props;

    const lay = {...defaultLayout, ...layout};

    return (
      <Row className="c-form-wrapper">
        <Col {...lay.left }>
          { left }
        </Col>

        <Col {...lay.right }>
          { right }
        </Col>
      </Row>
    )
  }
}

export default FormWrapper

