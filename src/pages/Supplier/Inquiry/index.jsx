import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import api from 'src/api';
import { Button, DatePicker, Table, } from 'antd';
import { Grid, message, modalEx, } from 'src/components';
import { Content, TableContent, MenuTitle, Price } from 'src/containers';
import { defaultPagination } from 'src/config/index';
import './Inquiry.scss';
import KEYS from '../config';

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      status: 0,
      dataSource: {},
      pagination: { ...defaultPagination },
      selectedRowKeys: [],
    };
  }

  componentDidMount() {

  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    const { searchKeyword, status, pagination, } = this.state;
    const params = {
      searchKeyword,
      status,
      ...pagination
    };

    api.supplyQueryPriceList(params).then(res => {
      const dataSource = res.result || {};
      this.setState({ dataSource });
    });
  }

  onEditCellChange = (value, dataIndex, record) => {
    // console.log(value, dataIndex, record)
    const dataSource = { ...this.state.dataSource };
    const target = dataSource.list.find(item => item.id === record.id);
    if (target) {
      target[dataIndex] = value;
      target.totalPrice = _.round((target.count || 0) * (target.price || 0), 2);
      this.setState({ dataSource });
    }
    console.log(dataSource)
  }

  onQuote = (record = {}) => {

    if (!record.price && !(typeof record.price === 'number'
    && !isNaN(record.price))) {
      modalEx.confirm({
        title: '提示',
        content: <p>请输入单价，不能为空！</p>,
        footer: null,
      });
      return
    }
    if (!record.arriveTime) {
      modalEx.confirm({
        title: '提示',
        content: <p>请输入预计货期，不能为空！</p>,
        footer: null,
      });
      return
    }
    if (record.tax==null) {

      modalEx.confirm({
        title: '提示',
        content: <p>请输入税率，不能为空！</p>,
        footer: null,
      });
      return
    }

    api.supplyQuote({
      id: record.id,
      price: record.price,
      count: record.count,
      tax: record.tax,
      supplyId: record.supplyId,
      supplyRemark: record.supplyRemark,
      path: record.path,
      arriveTime: record.arriveTime,
    }).then(res => {
      message.success(res.message || '');
      this.getList();
    });
  }


  onGridChange = (pagination, filters, sorter) => {
    const { current, pageSize, } = pagination;
    const nextPagination = {
      pageNum: current,
      pageSize,
    }
    this.setState({ pagination: nextPagination }, () => {
      this.getList();
    });

  }

  onUploadChange = (info, record) => {
    let fileList = info.fileList;
    fileList = fileList.slice(-1);
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.code === '0';
      }
      return true;
    });

    const filePath = _.get(fileList, '[0].response.result.url');

    const code = _.get(info, 'file.response.code', null);

    if (code === '0') {
      message.success(`${info.file.name} 上传成功`, 3);
    }
    if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    }
    if (code === '1') {
      message.error(`${_.get(info, 'file.response.message', '')}`, 3);
    }

    if (filePath) {
      const dataSource = { ...this.state.dataSource };
      const target = dataSource.list.find(item => item.id === record.id);

      if (target) {
        target.path = filePath;
        this.setState({ dataSource }, () => {
          // this.getList();
        });
      }
    }

  }
  onSubmit = () => {
    const { selectedRowKeys, dataSource } = this.state;
    let rowList = selectedRowKeys.map(key => dataSource.list.find(item => item.id === key));
    // rowList = rowList.filter(record => record.price && record.arriveTime);
    rowList = rowList.filter(record => record && record.price && record.arriveTime);

    if (rowList.length === 0) return message.error('提交的数据没有填写')
    const apiList = rowList.map(record => (
      api.supplyQuote({
        id: record.id,
        price: record.price,
        count: record.count,
        tax: record.tax,
        supplyId: record.supplyId,
        supplyRemark: record.supplyRemark,
        path: record.path,
        arriveTime: record.arriveTime,
      })
    ));
    Promise.all(apiList).then(res => {
      message.success(res[0].message || '');
      this.getList();
    });
  }


  render() {
    // const defaultUploadProps = {
    //   name: 'file',
    //   action: api._config.upload.url,
    // };

    const columns = [
      {
        title: '品牌',
        dataIndex: 'brand',
        width: 100,
      }, {
        title: '设备型号',
        dataIndex: 'model',
        width: 100,
      }, {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 100,
      }, {
        title: '配置',
        dataIndex: 'configuration',
        width: 400,
      }, {
        title: '数量',
        dataIndex: 'count',
        width: 100,
      }, {
        title: '含税单价',
        dataIndex: 'price',
        width: 140,
        render: (text, record, index) => {
          return <Price onChange={value => this.onEditCellChange(value, 'price', record)} value={text} />
        }
      }, {
        title: '含税总价',
        dataIndex: 'totalPrice',
        width: 120,
      },
      /**临时注释*/
      {
        title: '含税率',
        dataIndex: 'tax',
        width: 140,
        render: (text, record, index) => {
          return (<div>
            <Price value={text} onChange={value => this.onEditCellChange(value, 'tax', record)}></Price>
            <span>%</span>
          </div>
          )}
      }, {
        title: '抬头公司',
        width: 150,
        dataIndex: 'header',
      }, {
        title: '预计货期',
        width: 220,
        dataIndex: 'arriveTime',
        render: (text, record, index) => {
          return <DatePicker value={text ? moment(text) : undefined} style={{ width: 160 }} onChange={moment => this.onEditCellChange(moment.valueOf(), 'arriveTime', record)} />;
        },
      },

      // {
      //   title: '备注',
      //   width: 220,
      //   dataIndex: 'supplyRemark',
      //   render: (text, record, index) => {
      //     return <Reason  value={record.supplyRemark} onChange={e => this.onEditCellChange(e.target.value, 'supplyRemark', record) }/>
      //   }
      // },
      // {
      //   title: '退回原因',
      //   dataIndex: 'returnReason',
      //   width: 150,
      // },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 300,
        fixed: 'right',
        render: (text, record, index) => {
          return <span>
            {/* <Upload {...defaultUploadProps} showUploadList={false} onChange={ info => this.onUploadChange(info, record) }>
              <Button>
                上传附件
              </Button>
            </Upload> */}
            <Button type="primary" onClick={() => this.onQuote(record)}>
              提交报价
            </Button>
          </span>
        },
      },
    ];

    const items = [
      { name: '询价', key: '/supplier/inquiry' },
    ]

    const expandedRowRender = (record) => {
      const columns = [
        { title: '到货机房', dataIndex: 'arrivalSite', },
        { title: '数量', dataIndex: 'count', },
      ];

      return (
        <Table
          columns={columns}
          pagination={false}
          dataSource={record.arrivalSiteList}
        />
      );
    }
    const { selectedRowKeys } = this.state;
    return (

      <Content >
        <MenuTitle items={items} />

        <div className="m-supplier-inquiry">

          <TableContent
            title={
              <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={this.onSubmit}>批量提交</Button>
            }
            search={{
              value: this.state.searchKeyword,
              onChange: (e) => this.setState({ searchKeyword: e.target.value }),
              onPressEnter: this.getList,
            }}>
            <Grid
              KEYS = {KEYS}
              rowSelection={{ onChange: (selectedRowKeys) => { this.setState({ selectedRowKeys }) } }}
              columns={columns}
              data={this.state.dataSource}
              rowKey="id"
              expandedRowRender={expandedRowRender}
              scroll={_.get(this.state.dataSource, 'list', []).length ? { x: 1900, y: 600 } : {}}
              onChange={this.onGridChange}
            />
          </TableContent>

        </div>


      </Content>

    );
  }
}

export default function OrderPage(props) { return <Order {...props} />; }