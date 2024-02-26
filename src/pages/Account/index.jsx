/**
 * @file 财务管理
 * @author yangfan03@corp.netease.com
 * 
 */


import React, { Component } from 'react';
import './Account.scss';
import { Grid, Content, message } from 'src/components';
import api from 'src/api';
import { Select, Button, Modal } from 'antd';
import _ from 'lodash';
import { formatCashNumber } from 'src/libs/util'

const Option = Select.Option;

class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [],
      params: {
        accountTime: undefined,
        accountState: undefined,
      },
      stateList: [],
      accountTimeList: []
    }
  }

  componentDidMount() {
    let query = this.props.match.params;
    let { accountTime } = query;
    let accountState = query.state;
    const { params } = this.state;
    this.setState({
      params: { ...params, accountState, accountTime }
    }, () => this.getData());

    this.getAccountStateList();
    this.getAccountTimeList();
  }


  getData = () => {
    const { params } = this.state;
    this.setState(state => {
      return {
        history: state.history.concat([_.cloneDeep(params)])
      }
    });
  }

  onFormChange = (key, value) => {
    const { params } = this.state;
    this.setState({
      params: { ...params, [key]: value }
    });
  }

  onReset = () => {
    this.setState({
      params: {
        accountTime: undefined,
        accountState: undefined,
      },
    }, () => {
      this.getData();
    });
  }

  getAccountStateList = () => {
    api.getAccountStateList().then((res) => {
      if (res.code === 0) {
        let list = Object.keys(res.msg.list).map(elem => {
          return {
            value: elem,
            label: res.msg.list[elem]
          }
        });
        console.log(list);
        this.setState({ stateList: list })
      }
    });
  }

  getAccountTimeList = () => {
    api.getAccountTimeList().then((res) => {
      if (res.code === 0) {
        let list = res.msg.list;
        this.setState({ accountTimeList: list })
      }
    });
  }

  ondetail = (record) => {
    this.props.history.push({
      pathname: `/accountdetail/${record.accountTime}`,
    })
  }

  hasAuth = (auth) => {
    const { info } = this.state;
    return info.auth.indexOf(auth) == -1 ? false : true;
  }
  
  // 审核通过
  onapprove = (row) => {
    const params = {
      accountTime: row.accountTime,
      pass: 1
    }
    let that = this;
    Modal.confirm({
      title: '确定审核通过',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        api.confirmAccount(params).then(res => {
          if (res.code === 0) {
            message.success('操作成功');
            that.getData();
          } else {
            message.error(res.msg);
          }
        }).catch(err => err)
      },
    });
  }
  // 退回修正
  onrefuse = (row) => {
    const params = {
      accountTime: row.accountTime,
      pass: 0
    }
    let that = this;
    Modal.confirm({
      title: '确定退回修正',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        api.confirmAccount(params).then(res => {
          if (res.code === 0) {
            message.success('操作成功');
            that.getData();
          } else {
            message.error(res.msg);
          }
        }).catch(err => err)
      },
    });
  }

  render() {
    const operationDic = {
      detail: '账单明细',
      approve: '审核通过',
      refuse: '退回修正'
    }
    // 账单状态 WAIT_CONFIRM/CONFIRM/FILING/REFUSE
    // 状态状态名称 待审核/已审核/已打款/已拒绝

    const columns = [{
      title: '对账状态',
      dataIndex: 'accountStateName',
      width: 160,

    }, {
      title: '对账周期',
      dataIndex: 'accountTime',
      width: 180,

    }, {
      title: '商品数量(件)',
      dataIndex: 'goodsNum',
      width: 180,

    },{
      title: '采购总价(元)',
      dataIndex: 'purchaseTotalPrice',
      width: 180,
      render: (text, record) => {
        return (<span style={{ color: `${parseFloat(text) < 0 ? '#E13737' : ''}` }}>{formatCashNumber(text)}</span>)
      }
    }, {
      title: '历史售后总价(元)',
      dataIndex: 'historyTotalPrice',
      width: 180,
      render: (text, record) => {
        return (<span style={{ color: `${parseFloat(text) < 0 ? '#E13737' : ''}` }}>{formatCashNumber(text)}</span>)
      }
    }, {
      title: '对账总金额(元)',
      dataIndex: 'accountTotalPrice',
      width: 180,
      render: (text, record) => {
        return (<span style={{ color: `${parseFloat(text) < 0 ? '#E13737' : ''}` }}>{formatCashNumber(text)}</span>)
      }
    },{
      title: '网易宝对账金额(元)',
      dataIndex: 'wangAccountPrice',
      width: 180,
      render: (text, record) => {
        return (<span style={{ color: `${parseFloat(text) < 0 ? '#E13737' : ''}` }}>{formatCashNumber(text)}</span>)
      }
    },{
      title: '支付宝对账金额(元)',
      dataIndex: 'zhiAccountPrice',
      width: 180,
      render: (text, record) => {
        return (<span style={{ color: `${parseFloat(text) < 0 ? '#E13737' : ''}` }}>{formatCashNumber(text)}</span>)
      }
    }, {
      title: '操作',
      width: 180,
      key: 'operation',
      render: (text, record) => {
        return (
          <div>
            {
              record.auth.map((elem, index) => {
                return elem && <a key={index} style={{ marginRight: '7px', color: `${elem === 'refuse' ? '#E13737' : ''}`}} onClick={() => this[`on${elem}`](record)}>{`${operationDic[elem]}`}</a>
              })
            }
          </div>)
      }
    }];
    const formStyle = { width: 200, marginRight: 19 };
    const { params, stateList, accountTimeList } = this.state;

    return (
      <Content size="full">
        <div className="g-account">
          <div className="m-search">
            <div className="search-item">
              <label>账期</label>
              <Select className="u-search-item" value={params.accountTime} onChange={(value) => { this.onFormChange('accountTime', value) }} placeholder='请选择账期开始月份' allowClear>
                {accountTimeList.map(item => <Option value={item} key={item}>{item}</Option>)}
              </Select>
            </div>
            <div className="search-item">
              <label>对账状态</label>
              <Select className="u-search-item" value={params.accountState} onChange={(value) => { this.onFormChange('accountState', value) }} allowClear>
                {stateList.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
              </Select>
            </div>

            <div className="search-item">
              <Button type="primary" onClick={this.getData} className="u-search" >搜索</Button>
              <Button onClick={this.onReset} className="u-reset">重置</Button>
            </div>
          </div>
          <div className="g-content">
            <Grid
              api={api.getAccountList}
              size="large"
              columns={columns}
              history={this.state.history}
              // data={{ data: msg.list, records: msg.count, page_now: params.offset, limit: params.limit }}
              onResHandler={(res, params) => { return { data: { data: res.msg.list, records: res.msg.count, page_now: params.offset, limit: params.limit } } }}
              scroll={{ x: 1950, y: 500 }}
              locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
            />
          </div>
        </div>
      </Content>
    )
  }
}

export default function AccountPage(props) { return <Account {...props} />; }