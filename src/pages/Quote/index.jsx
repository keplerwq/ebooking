/**
 * @file 报价管理
 * @author hzwanglintao@corp.netease.com
 * 
 */


import React, { Fragment, Component } from 'react';
import './Quote.scss';
import { Grid, Content, message, CopyTextToClipboard } from 'src/components';
import api from 'src/api';
import QUOTE_CONSTANTS from './constant';
import { Select, Input, Button, Popover } from 'antd';
import _ from 'lodash';
import addBatchQuote from './addBatchQuote';
import addQuote from './addQuote';


const Option = Select.Option;

class Quote extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [],
      params: {
        name: '',
        brand: '',
        state: undefined,
      },
      selectedRowKeys: [],   //表格选中项
      selectedRows: []
    }
  }

  componentDidMount() {
    let query = this.props.match.params;
    let { state } = query;
    const { params } = this.state;
    this.setState({
      params: { ...params, state: state }
    }, () => this.getData());
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
        name: '',
        brand: '',
        state: undefined,
      },
    }, () => {
      this.getData();
    });
  }


  onSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  }


  /**
   *  报价
   * 
   */
  onPriceQuote = (record) => {
    addQuote(record, () => {
      this.getData();
    })
  }


  /**
   * 批量报价
   * 
   */
  onBatchPriceQuote = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    if (selectedRows.length) {
      for (let item of selectedRows) {
        if (['INQUIRY', 'INVALID'].indexOf(item.state) < 0) {
          message.warning('仅待报价、已失效状态可以批量报价!');
          break;
        }
        else {   //批量报价
          addBatchQuote({ list: selectedRowKeys }, () => {
            this.getData();
          });
        }
      }
    }
    else {
      message.warning('请选择需要报价的条目!');
    }
  }


  render() {

    const columns = [{
      title: 'ID',
      dataIndex: 'sid',
      width: 200
    }, {
      title: '状态',
      dataIndex: 'state',
      width: 100,
      render: (text) => {
        const stateObj = _.find(QUOTE_CONSTANTS.status, function (o) { return o.value == text });
        return stateObj ? stateObj.name : '';
      }
    }, {
      title: '商品类目',
      dataIndex: 'cat',
      width: 150
    }, {
      title: '商品品牌',
      dataIndex: 'brand',
      width: 150
    }, {
      title: '商品名称',
      dataIndex: 'name',
      width: 150
    }, {
      title: '属性',
      dataIndex: 'property',
      width: 150
    }, {
      title: '数量',
      dataIndex: 'num',
      width: 80
    }, {
      title: '到货地点',
      dataIndex: 'address',
      width: 150
    }, {
      title: '含税单价',
      dataIndex: 'price',
      width: 150
    }, {
      title: '未税单价',
      dataIndex: 'unTaxPrice',
      width: 120
    }, {
      title: '未税总价',
      dataIndex: 'unTaxTotalPrice',
      width: 120
    }, {
      title: '询价时间',
      dataIndex: 'inquiryTime',
      width: 120
    }, {
      title: '报价时间',
      dataIndex: 'quoteTime',
      width: 120
    }, {
      title: '确认时间',
      dataIndex: 'confirmTime',
      width: 150
    }, {
      title: '价格有效时间',
      width: 200,
      render: (text, record) => {
        return `${record.effectSt}${record.effectSt ? '至' : ''}${record.effectEt}`;
      }
    }, {
      title: '保修信息',
      width: 100,
      dataIndex: 'guarantee'
    }, {
      title: '备注',
      width: 80,
      dataIndex: 'remarkList',
      fixed: 'right',
      render: (text, record) => {
        return text && text.length ?
          <Popover
            content={
              <div style={{ width: 200 }}>
                {
                  text.map((item, index) => (
                    <Fragment key={index}>
                      <div style={{ wordWrap: 'break-word', lineHeight: '26px' }}>
                        {item.state}&nbsp;&nbsp;
                        {item.createTime}<br />
                        {item.remark}
                      </div>
                      <br />
                    </Fragment>
                  ))
                }
                <div>
                  <CopyTextToClipboard text={`${text.map(item => {
                    return `${item.state}  ${item.createTime}\n${item.remark}\n`;
                  })}`}>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '10 0',
                        borderTop: '1px solid #e8e8e8',
                        margin: 'auto -16px',
                        lineHeight: '26px'
                      }}
                    >
                      <a>复制</a>
                    </div>
                  </CopyTextToClipboard>
                </div>
              </div>
            }
            trigger="click"
          >
            <a>查看</a>
          </Popover>
          : null
      }
    }, {
      title: '操作',
      width: 80,
      key: 'operation',
      fixed: 'right',
      render: (record) => {
        return ['INQUIRY', 'INVALID'].indexOf(record.state) > -1 ? <a onClick={() => this.onPriceQuote(record)}>报价</a> : null
      }
    }];
    const formStyle = { width: 200, marginRight: 19 };
    const { params } = this.state;

    return (
      <Content size="full">
        <div className="g-quote">
          <div className="g-search">
            <span style={{ marginRight: 10 }}>状态</span>
            <Select
              style={formStyle}
              value={params.state}
              onChange={value => this.onFormChange('state', value)}
              placeholder="请选择"
              allowClear
            >
              {QUOTE_CONSTANTS.status.map(item => <Option key={item.value}>
                {item.name}
              </Option>)}
            </Select>
            <span style={{ marginRight: 10 }}>商品名称</span>
            <Input
              style={formStyle}
              value={params.name}
              onChange={e => this.onFormChange('name', e.target.value)}
              placeholder="请输入"
            >
            </Input>
            <span style={{ marginRight: 10 }}>商品品牌</span>
            <Input
              style={formStyle}
              value={params.brand}
              onChange={e => this.onFormChange('brand', e.target.value)}
              placeholder="请输入"
            >
            </Input>
            <Button type="primary" onClick={this.getData} style={{ marginRight: 20 }}>搜索</Button>
            <Button type="primary" ghost onClick={this.onReset}>重置</Button>
          </div>
          <div className="g-content">
            <div className="clearfix">
              <div style={{ cssFloat: 'right', marginBottom: 13 }}>
                <Button type="primary" ghost onClick={this.onBatchPriceQuote}>批量报价</Button>
              </div>
            </div>
            <div className="clearfix">
              <Grid
                api={api.getQuoteList}
                size="large"
                columns={columns}
                rowSelection={{ type: 'checkbox', onChange: this.onSelectionChange }}
                rowKey="id"
                history={this.state.history}
                onResHandler={(res, params) => { return { data: { data: res.msg.list, records: res.msg.count, page_now: params.offset, limit: params.limit } } }}
                scroll={{ x: 2370, y: 500 }}
                locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
              />
            </div>

          </div>
        </div>
      </Content>
    )
  }
}

export default function QuotePage(props) { return <Quote {...props} />; }