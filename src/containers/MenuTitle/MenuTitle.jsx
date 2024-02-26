
//标签切换菜单，根据当前url自动选中
//传入菜单数组对象刑如 [
//   { name: '全部申请单', key: '/purchase/apply/bill/total' },
//   { name: '我的申请单', key: '/purchase/apply/bill/my' },
// ];

import React, { Component } from 'react';
import _ from 'lodash';
import { Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import './style.scss';
const TabPane = Tabs.TabPane;

class MenuTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemSel: '',
    };
  }

  componentDidMount() {
    this.setMenu();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setMenu(nextProps);
    }
  }

  setMenu = (props) => {
    props = props || this.props;

    let item = props.items.find(x =>  props.location.pathname.includes(x.key)) || {};
    this.setState({itemSel: item.key || ''});
  }

  onMenuItemClick = (item) => {
    this.setMenu();
  }

  render() {
    const {staticContext, ...rest} = this.props;
    return (
      <div className="g-tabs">
        <Tabs>
          {this.props.items.map(x =>
            <TabPane tab={x.name}  key={x.key}>
            </TabPane>
          )}
          
        </Tabs>
      </div>
    );
  }
}

export default withRouter(MenuTitle);
