/**
 * @file 财务管理
 * @author yangfan03@corp.netease.com
 * 
 */


import React, { Component } from 'react';
import './Detail.scss';
import { Grid, Content, message } from 'src/components';
import api from 'src/api';
import { Select, Input, Button, Popover, Row, Col, Modal } from 'antd';
import _ from 'lodash';
import qs from 'qs';
import addRemark from './addRemark';
import editEOrder from './editEOrder';
import addEOrder from './addEOrder'
import { textEllipsis, subStringWithChinese, formatCashNumber } from 'src/libs/util'

const Option = Select.Option;

class AccountDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [],
      params: {
        sid: '',
        payType: undefined,
        accountTime: '',
      },
      info: {
        auth: []
      },
      payTypeList: [],
      stateList: []
    }
  }

  componentWillMount() {
    let query = this.props.match.params;
    let { accounttime } = query;
    this.setState({
      accountTime: accounttime,
    });
    this.getAccountStateList();
  }

  componentDidMount() {
    this.search();
    this.getAccountPayTypeList();
  }

  search = () => {
    const { params } = this.state;
    params.sid = params.sid.trim();
    this.getData();
    api.getAccountDetail({ ...params, offset: 0, limit: 10 }).then(res => {
      if (res.code === 0) {
        let info = res.msg;
        this.setState({ info });
      }
    });
  }

  getData = () => {
    const { params, accountTime } = this.state;
    params.accountTime = accountTime;
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
        sid: '',
        payType: undefined,
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

  getAccountPayTypeList = () => {
    api.getAccountPayTypeList().then((res) => {
      if (res.code === 0) {
        let list = Object.keys(res.msg.list).map(elem => {
          return {
            value: elem,
            label: res.msg.list[elem]
          }
        });
        this.setState({ payTypeList: list })
      }
    });
  }

  hasAuth = (auth) => {
    const { info } = this.state;
    return info.auth.indexOf(auth) == -1 ? false : true;
  }

  /**
   *  备注
   * 
   */
  onremark = (record) => {
    addRemark(record, () => {
      message.success('备注成功!');
      this.getData();
    })
  }

  onBatchExport = () => {
    const { params, info } = this.state;
    params.limit = 1000;
    params.offset = 0;
    // params.state = info.accountStateName;
    var queryString = qs.stringify(params);
    window.open("/supplier/Account/exportAccount.do?" + queryString);
  }

  onedit = (record) => {
    let editInfo = {
      settleStatus: record.settleStatus,
      price: record.purchasePrice
    }
    localStorage.setItem('editInfo', JSON.stringify(editInfo));
    editEOrder(record, () => {
      message.success('修改成功!');
      this.search();
    })
  }

  onapprove = (info) => {
    const params = {
      accountTime: info.accountTime,
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
            that.search();
          } else {
            message.error(res.msg);
          }
        }).catch(err => err)
      },
    });
  }

  onrefuse = (info) => {
    const params = {
      accountTime: info.accountTime,
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
            that.search();
          } else {
            message.error(res.msg);
          }
        }).catch(err => err)
      },
    });
  }

  onBatchNewOrder = (info) => {
    addEOrder(info, () => {
      message.success('添加成功!');
      this.search();
    })
  }

  render() {

    const status = {
      '1': '已计算',
      '2': '待结算',
      '3': '结算中'
    }

    const columns = [
      {
        title: '子订单ID',
        dataIndex: 'sid',
        width: 160
      }, {
        title: '订单ID',
        dataIndex: 'oid',
        width: 160
      },{
        title: '对账状态',
        dataIndex: 'stateName',
        width: 160,
      }, {
        title: '结算状态',
        dataIndex: 'settleStatusName',
        width: 160,
        // render: (text, record) => {
        //   return (
        //     <div>
        //       {status[text]}
        //     </div>
        //   )
        // }
      },{
        title: '商品品牌',
        dataIndex: 'brand',
        width: 220,
        render: (text, record) => {
          return (
            <div>
              <Popover content={text} title={null} trigger="hover">
                <span>{textEllipsis(text)}</span>
              </Popover>
            </div>
          )
        }
      }, {
        title: '商品名称',
        dataIndex: 'name',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              <Popover content={text} title={null} trigger="hover">
                <span>{textEllipsis(text)}</span>
              </Popover>
            </div>
          )
        }
      }, {
        title: '属性',
        width: 200,
        dataIndex: 'property',
        render: (text, record, index) => {
          if (record.property !== '[]') {
            let propertys = JSON.parse(record.property);
            let content = (
              <div>{propertys.map((pro, index) => {
                return <p key={index} style={{ 'marginBottom': 0 }}>{pro.propertyName}：{pro.propertyValue}</p>;
              })}
              </div>
            );
            return <Popover content={content} title={null} trigger="hover">
              <div>{propertys.map((pro, index) => {
                return <p key={index} style={{ 'marginBottom': 0 }}>{pro.propertyName}：{subStringWithChinese(pro.propertyValue, 10)}</p>;
              })}
              </div>
            </Popover>
          } else {
            return '';
          }
        }
      }, {
        title: '数量(件)',
        dataIndex: 'num',
        width: 120
      }, {
        title: '采购单价(元)',
        dataIndex: 'purchasePrice',
        width: 150
      }, {
        title: '采购总价(元)',
        dataIndex: 'purchaseTotalPrice',
        width: 120
      }, {
        title: '支付方式',
        dataIndex: 'payType',
        width: 120
      },{
        title: '交易流水单号',
        dataIndex: 'transactionId',
        width: 120
      },{
        title: '下单时间',
        dataIndex: 'orderTime',
        width: 120
      }, {
        title: '发货时间',
        dataIndex: 'deliverTime',
        width: 120
      }, {
        title: '历史账单售后订单金额(元)',
        dataIndex: 'historyAccountPrice',
        width: 120,
      }, {
        title: '退款时间',
        dataIndex: 'rawbackTime',
        width: 200
      },{
        title: '客服备注',
        dataIndex: 'accountRemark',
        width: 200
      },{
        title: '供应商备注',
        dataIndex: 'supplierRemark',
        width: 300
      }, {
        title: '操作',
        width: 150,
        key: 'operation',
        fixed: 'right',
        render: (text, record) => {
          return (
            <div>
              {
                record.auth.map((elem, index) => {
                  return elem && <a key={index} style={{ marginRight: '7px' }} onClick={() => this[`on${elem}`](record)}>{`${sonOperationDic[elem]}`}</a>
                })
              }
            </div>)
        }
      }];
    const infoStyle = {
      span0: 1,
      span1: 2,
      span2: 3,
      span3: 2,
      span4: 3,
      span5: 2,
      span6: 3,
      spanReason: 20  //24-span0-span1
    };
    const { params, payTypeList, accountTime, info, stateList } = this.state;

    const operationDic = {
      approve: '审核通过',
      refuse: '退回修正',
    }

    const sonOperationDic = {
      remark: '备注',
      edit: '修改'
    }

    let authTop = info.auth.filter(item => item !== 'add');
    let authBtm = info.auth.filter(item => item === 'add');

    return (
      <Content size="full">
        <div className="g-account-detail">
          <div className="m-total">
            <div style={{overflow: 'hidden'}}>
              <div className="m-title" style={{cssFloat: 'left'}}>{accountTime}账期</div>
              <div className="m-operation-btns" style={{cssFloat: 'right'}}>
                {
                  authTop.map((elem, index) => {
                    return elem && <Button key={index} danger={elem === "refuse"} type='primary' style={{ marginRight: '7px' }} onClick={() => this[`on${elem}`](info)}>{`${operationDic[elem]}`}</Button>
                  })
                }
              </div> 
            </div>

            <div className="m-total-info">
              <Row>
                <Col
                  span={infoStyle.span1}
                  className="form-label"
                >对账状态：</Col>
                <Col
                  span={infoStyle.span2}
                  className={`u-value`}
                >{info.accountStateName}</Col>

                <Col
                  span={infoStyle.span1}
                  className="form-label"
                >对账周期：</Col>
                <Col
                  span={infoStyle.span2}
                  className="u-value"
                >{info.accountTime}</Col>

                <Col
                  span={infoStyle.span1}
                  className="form-label"
                >商品数量(件)：</Col>
                <Col
                  span={infoStyle.span2}
                  className="u-value"
                >{formatCashNumber(info.goodsNum)}</Col>

                <Col
                  span={infoStyle.span1}
                  className="form-label"
                >采购总价(元)：</Col>
                <Col
                  span={infoStyle.span2}
                  className={`u-value ${info.accountTotalPrice < 0 ? 'red' : ''}`}
                >{formatCashNumber(info.purchaseTotalPrice)}</Col>

                {/* {info.state === 'REFUSE' ? <Col span={infoStyle.spanReason}><span
                  className="form-label"
                  style={{ 'marginLeft': '-20px' }}
                >（{info.refuseReason}）</span> </Col> : ''} */}

              </Row>
            </div>

            <div className="m-total-info">
              <Row>
                {/* <Col
                  span={infoStyle.span0}
                  className="m-sub-title"
                >账务说明</Col> */}
                
                <Col
                  span={infoStyle.span3}
                  className="form-label"
                >历史售后总价(元)：</Col>
                <Col
                  span={infoStyle.span4}
                  className={`u-value ${info.finishAccount < 0 ? 'red' : ''}`}
                >{formatCashNumber(info.historyTotalPrice)}</Col>
                <Col
                  span={infoStyle.span3}
                  className="form-label"
                >对账总金额(元)：</Col>
                <Col
                  span={infoStyle.span4}
                  className={`u-value ${info.finishAccount < 0 ? 'red' : ''}`}
                >{formatCashNumber(info.accountTotalPrice)}</Col>

                <Col
                  span={infoStyle.span1}
                  className="form-label"
                >网易宝对账金额(元)：</Col>
                <Col
                  span={infoStyle.span2}
                  className="u-value"
                >{formatCashNumber(info.wangAccountPrice)}</Col>
                <Col
                  span={infoStyle.span3}
                  className="form-label"
                >支付宝对账金额(元)：</Col>
                <Col
                  span={infoStyle.span4}
                  className="u-value"
                >{formatCashNumber(info.zhiAccountPrice)}</Col>

              </Row>
            </div>
          </div>
          <div className="g-content">
            <div className="m-search" style={{ marginBottom: 0 }}>
              <div className="search-item">
                <label>子订单ID</label>
                <Input className="u-search-item" allowClear maxLength={500} value={params.sid} onChange={(e) => { this.onFormChange('sid', e.target.value) }} />
              </div>

              <div className="search-item">
                <label>对账状态</label>
                <Select className="u-search-item" value={params.state} onChange={(value) => { this.onFormChange('state', value) }} allowClear>
                  {stateList.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
                </Select>
              </div>

              <div className="search-item">
                <Button type="primary" onClick={this.search} className="u-search" >搜索</Button>
                <Button onClick={this.onReset} className="u-reset">重置</Button>
              </div>
            </div>
            <div className="m-button clearfix">
              <div style={{ position: 'absolute', right: 0, top: '-36px', }}>
                <Button type="primary" ghost onClick={this.onBatchExport}>导出</Button>
                {
                  authBtm.length !== 0 ? <Button type="primary" onClick={() => this.onBatchNewOrder(info)}>新增订单</Button> : null
                }
                
              </div>
            </div>

            <Grid
              api={api.getAccountDetail}
              size="large"
              columns={columns}
              rowKey="id"
              history={this.state.history}
              // data={{ data: msg.list, records: msg.count, page_now: params.offset, limit: params.limit }}
              onResHandler={(res, params) => { return { data: { data: res.msg.list, records: res.msg.count, page_now: params.offset, limit: params.limit } } }}
              rowClassName={(record, index) => { if (record.historyAccountis === 1) { return 'm-row-red' } }}
              scroll={{ x: 1950, y: 500 }}
              locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
            />

          </div>
        </div>
      </Content>
    )
  }
}

export default function AccountDetailPage(props) { return <AccountDetail {...props} />; }