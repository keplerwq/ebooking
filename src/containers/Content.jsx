/**
 * CDN项目 正文插件
 * 标题功能
 * 成本中心变更事件绑定
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Content } from 'src/components';
import dispatchs from 'src/redux/dispatchs';


class ContentComponent extends Component {
  static defaultProps = {
    className: '',
    title: ['CDN'],
    style: null,
    onProjectSel: null
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.projectSel, nextProps.projectSel)) {
      this.props.onProjectSel && this.props.onProjectSel(nextProps.projectSel);
    }
    if (!_.isEqual(this.props.title, nextProps.title)) {
      this.props.actions.appSetTitle(nextProps.title);
    }
  }

  componentDidMount(nextProps) {
    if (_.isArray(this.props.title)) {
      this.props.actions.appSetTitle(this.props.title);
    }
  }

  render() {
    return (
      <Content size="full" {...this.props} footer={
        <span>2017 &copy; NetEase 网络管理部</span>
      }></Content>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    projectSel: state.app.projectSel
  };
}

export default connect(mapStateToProps, dispatchs('app'))(ContentComponent);