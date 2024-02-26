import React, { Component } from 'react';
import { connect } from 'react-redux';
import api from 'src/api';
import { Table, Button, DatePicker, Popover } from 'antd';
import { Grid, message } from 'src/components';
import { Content, TableContent, MenuTitle, } from 'src/containers';
import { defaultPagination } from 'src/config/index';
import upload from './Modal/UploadModal';
import './Contract.scss';
import KEYS from '../config';


class Contract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      dataSource: {},
      pagination: { ...defaultPagination },
      visible: false,
      date: {

      },
    };
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    const { searchKeyword, pagination } = this.state;
    const params = {
      searchKeyword,
      ...pagination
    };

    api.supplyPoList(params).then(res => {
      const dataSource = res.result || {};
      this.setState({ dataSource });
    });
  }

  onDownload = (downloadUrl) => {
    if (downloadUrl) {
      if (!downloadUrl.match(/http:\/\/|https:\/\//)) {
        downloadUrl = 'http://' + downloadUrl;
      }

      window.open(downloadUrl);
    } else {
      message.warning('无可下载的文件', 3);
    }
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

  uploadPo = (record) => {
    upload(record, this.getList)
  }

  confirmOrder = (moment, record) => {
    if (!moment) return message.warning('请选择预计到货日期');
    const arriveTime = moment.valueOf();
    api.supplyConfirm({
      id: record.id,
      arriveTime,
    }).then(() => {
      message.success('确认成功');
      this.getList();
    });
  }

  render() {
    const columns = [
      {
        title: '抬头',
        dataIndex: 'header',
      },
      {
        title: '采购单',
        dataIndex: 'purchaseIdList',
      }, {
        title: '是否上传PO',
        render: (text) => {
          let status = text === '0' ? '否' : '是'
          return <span>{status}</span>;
        },
      }, {
        title: 'PO文件名',
        dataIndex: 'poName',
      },
      {
        title: 'PO状态',
        dataIndex: 'status',
        render: (text, record) => {
          let status = text === '0' ? '待供应商上传合同' : (text === '1' ? '待采购组确认' : '已生效')
          return <span>{status}</span>;
        },
      }, {
        title: '操作',
        dataIndex: '',
        render: (text, record, index) => {
          // console.log(record.status)
          return <span>
            <Button onClick={row => (this.onDownload(record.poPath))} type="primary" ghost>
              下载合同{/* <Icon type="download" /> */}
            </Button>
            <Button onClick={row => (this.uploadPo(record))} type="primary">
              {/* disabled={record.status >= 28} */}
              上传合同
            </Button>
            {/* <Upload {...defaultUploadProps} showUploadList={false} onChange={ info => this.onUploadChange(info, record) }>
              <Button>
                上传合同
              </Button>
            </Upload> */}
          </span>
        },
      },
    ];

    const items = [
      { name: '合同', key: '/supplier/contract' },
    ]


    const expandedRowRender = (record, i) => {
      const columns = [
        {
          title: '采购单号',
          dataIndex: 'purchaseId',
        },
        {
          title: '品牌',
          dataIndex: 'brand',
        },
        {
          title: '设备名称',
          dataIndex: 'deviceName',
        },
        {
          title: '设备型号',
          dataIndex: 'model',
        },
        {
          title: '配置',
          dataIndex: 'configuration',
        },
        {
          title: '数量',
          dataIndex: 'count',
        },
        {
          title: '到货机房',
          dataIndex: 'arrivalSite',
        },
        {
          title: '单价',
          dataIndex: 'price',
        },
        {
          title: '总价',
          dataIndex: 'totalPrice',
        },
        {
          title: '资产号',
          dataIndex: 'pn',
        },
        {
          title: '接单确认',
          render: (text, record, index) => {
            return (
              <Popover
                placement="top"
                visible={i + index === this.state.visible}
                content={
                  < div className="contrat-confirm-order" ref={(ref) => this.popoverDateNode = ref
                  }>
                    <p>请选择预计到货日期：</p>
                    <DatePicker
                      value={this.state.date[i + index]}
                      allowClear={false}
                      className="date-picker"
                      onChange={(moment) => {
                        const date = this.state.date;
                        this.setState({
                          date: Object.assign({}, date, { [i + index]: moment }),
                        });
                      }}
                      getCalendarContainer={() => this.popoverDateNode}
                    />
                    <div>
                      <Button
                        size="small"
                        style={{ width: 70 }}
                        onClick={() => this.setState({
                          visible: -1,
                        })}
                      >取消</Button>
                      <Button
                        type="primary"
                        size="small"
                        style={{ width: 70 }}
                        onClick={() => this.confirmOrder(this.state.date[i + index], record)}
                      >确认</Button>
                    </div>
                  </div >
                }
                trigger="click"
              >
                <Button
                  type="primary"
                  size="small"
                  style={{ width: 70 }}
                  onClick={() => this.setState({ visible: i + index })}
                >确认接单</Button>
              </Popover >
            )
          },
        },
      ];

      return (
        <Table
          columns={columns}
          pagination={false}
          dataSource={record.list}
          rowKey='id'
        />
      );
    }



    return (

      <Content >
        <MenuTitle items={items} />
        <div className="m-supplier-contract">

          <TableContent title="" search={{
            value: this.state.searchKeyword,
            onChange: (e) => this.setState({ searchKeyword: e.target.value }),
            onPressEnter: this.getList,
          }}>
            <Grid
              KEYS = {KEYS}
              rowKey='id'
              columns={columns}
              data={this.state.dataSource}
              expandedRowRender={expandedRowRender}
              onChange={this.onGridChange}
            />
          </TableContent>

        </div>
      </Content>

    );
  }
}

export default function ContractPage(props) { return <Contract {...props} />; }