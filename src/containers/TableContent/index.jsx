/**
 * 表格文本区域
 */
import React from 'react';
import ToolBar from '../ToolBar';
import { Input, } from 'antd';
import './style.scss';
export default function TableContent (props){

  const { onPressEnter = () => {} , ...rest  } = props.search || {}; 

  return (
    <div className="g-table-content">
      <ToolBar>
        <div>{props.title}</div>
        <div className="u-table-content-extra">
        
          <div className="u-searcher" >
            {props.header}
            {
              props.extra ? props.extra : <Input.Search style={{width: 440}} placeholder="请输入搜索条件" {...rest } onSearch={onPressEnter} />
            } 
          </div>
        </div> 
      </ToolBar>
      
      { props.children }
    </div>
  )
}

