/**
 * @file 售后管理
 * @author yangfan03@corp.netease.com
 * 
 */


import React, { Component } from 'react';
import './AfterSale.scss';
import { Grid, Content, message } from 'src/components';
import api from 'src/api';
import { Select, Input, Button, DatePicker, Popover } from 'antd';
import _ from 'lodash';
import afterSaleManage from './afterSaleManage';
import addRemark from './addRemark';
import { textEllipsis, subStringWithChinese } from 'src/libs/util'

const { RangePicker } = DatePicker;
const Option = Select.Option;

class AfterSale extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [],
      params: {
        name: '',
        brand: '',
        property: '',
        state: undefined,
        timeRange: [null, null],
        approveSt: '',
        approveEt: ''
      },
      stateList: []
    }
  }

  componentDidMount() {
    this.getAfterSaleStateList();
    let query = this.props.match.params;
    let { state } = query;
    const params = { ...this.state.params, state: state };
    this.setState({ params }, () => this.getData());
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

  onTimeChange = (timeRange) => {
    const params = { ...this.state.searchParams, timeRange, approveSt: timeRange[0] && timeRange[0].startOf('day').valueOf(), approveEt: timeRange[1] && timeRange[1].endOf('day').valueOf() };
    this.setState({ params });
  }

  onReset = () => {
    this.setState({
      params: {
        property: '',
        name: '',
        brand: '',
        state: undefined,
        timeRange: [null, null],
        approveSt: '',
        approveEt: ''
      },
    }, () => {
      this.getData();
    });
  }

  getAfterSaleStateList = () => {
    api.getAfterSaleStateList().then((res) => {
      if (res.code === 0) {
        let list = Object.keys(res.msg).map(elem => {
          return {
            value: elem,
            label: res.msg[elem]
          }
        });
        this.setState({ stateList: list })
      }
    });
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

  /**
  *  售后管理
  * 
  */
  onsalemanage = (record) => {
    afterSaleManage(record, () => {
      message.success('操作成功!');
      this.getData();
    })
  }

  render() {
    const operationDic = {
      salemanage: '售后管理',
      remark: '备注'
    }

    const stateColor = {
      WAIT_APPROVE: '#E02520',
      WAIT_CANCEL: '#FF5955',
      WAIT_RECEIVE: '#FF9100',
      FINISH_ASS: '#19C448',
      REFUSE_ASS: '#67B4CA',
      CANCEL_ASS: '#9B9B9B'
    }

    const columns = [{
      title: '订单ID',
      dataIndex: 'sid',
      width: 160
    }, {
      title: '售后状态',
      dataIndex: 'state',
      width: 160,
      render: (text, record) => {
        return (
          <div><span style={{ 'fontSize': '18px', color: `${stateColor[text]}`, marginRight: '6px' }}>●</span>{record.statename}</div>
        )
      }
    }, {
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
      title: '采购单价',
      dataIndex: 'price',
      width: 150
    }, {
      title: '采购总价',
      dataIndex: 'totalprice',
      width: 120
    }, {
      title: '退货物流',
      dataIndex: 'expressType',
      width: 200,
      render: (text, record) => {
        if (text === '物流') {
          return record.company + "：" + record.expressid
        } else {
          return text;
        }
      }
    }, {
      title: '下单时间',
      dataIndex: 'orderTime',
      width: 120
    }, {
      title: '申请售后时间',
      dataIndex: 'approveSaleTime',
      width: 120
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
                return elem && <a key={index} style={{ marginRight: '7px' }} onClick={() => this[`on${elem}`](record)}>{`${operationDic[elem]}`}</a>
              })
            }
          </div>)
      }
    }];
    const formStyle = { width: 200, marginRight: 19 };
    const { params, stateList } = this.state;

    return (
      <Content size="full">
        <div className="g-aftersale">
          <div className="m-search">
            <div className="search-item">
              <label>申请售后时间</label>
              <RangePicker className="u-search-item" value={params.timeRange} onChange={this.onTimeChange} allowClear />
            </div>
            <div className="search-item">
              <label>售后状态</label>
              <Select className="u-search-item" value={params.state} onChange={(value) => { this.onFormChange('state', value) }} allowClear>
                {stateList.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
              </Select>
            </div>
            <div className="search-item">
              <label>商品名称</label>
              <Input className="u-search-item" maxLength={500} value={params.name} onChange={(e) => { this.onFormChange('name', e.target.value) }} />
            </div>

            <div className="search-item">
              <label>商品品牌</label>
              <Input className="u-search-item" maxLength={500} value={params.brand} onChange={(e) => { this.onFormChange('brand', e.target.value) }} />
            </div>
            <div className="search-item">
              <label>商品属性</label>
              <Input className="u-search-item" maxLength={20} value={params.property} onChange={(e) => { this.onFormChange('property', e.target.value) }} />
            </div>
            <div className="search-item">
              <Button type="primary" onClick={this.getData} className="u-search" >搜索</Button>
              <Button onClick={this.onReset} className="u-reset">重置</Button>
            </div>
          </div>
          <div className="g-content">
            <Grid
              api={api.getAfterSaleList}
              size="large"
              columns={columns}
              rowKey="sid"
              history={this.state.history}
              onResHandler={(res, params) => { return { data: { data: res.msg.list, records: res.msg.count, page_now: params.offset, limit: params.limit } } }}
              scroll={{ x: 1800, y: 500 }}
              locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
            />
          </div>
        </div>
      </Content>
    )
  }
}

export default function AfterSalePage(props) { return <AfterSale {...props} />; }