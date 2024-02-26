/**
 * 表格文本区域
 */
import React, { Component } from 'react';
import ToolBar from '../ToolBar';
import { Input, } from 'antd';
import './style.scss';
export default class TableContent  extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }
  static defaultProps = {
    
  }



  componentDidMount(nextProps) {}

  render() {
    debugger

    const { onPressEnter = () => {} , ...rest  } = this.props.search || {}; 

    return (
      <div className="g-table-content">
        <ToolBar>
          <div>{this.props.title}</div>
          <div className="u-table-content-extra">

            { 
              this.props.extra ? this.props.extra :
                <div className="u-searcher" >
                  <Input.Search placeholder="请输入搜索条件" {...rest } onSearch={onPressEnter} />
                </div>
            }
          </div> 
        </ToolBar>
       
        { this.props.children }
      </div>
    )
  }
}

