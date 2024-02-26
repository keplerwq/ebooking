import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import qs from 'qs';
import api from 'src/api';
import { Button, Upload } from 'antd';
import {  Grid, message, } from 'src/components';
import { Content, TableContent, Breadcrumb } from 'src/containers';
import { defaultPagination } from 'src/config/index';
import axios from 'axios';
import './Delivered.scss';
import KEYS from '../config';

class DeliveredDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      selectedRows: [],
      id: '',
      dataSource: {},
      pagination: {...defaultPagination},
      status: '1'
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentWillMount() {
    const params = qs.parse(this.props.location.search.substring(1));
    const { id, } = params;
    this.setState({id})
  }

  getList = () => {
    const { searchKeyword, pagination, id, status } = this.state;
    const params = {
      searchKeyword,
      id,
      status,
      ...pagination
    };
    api.supplyQueryDeliverDevice(params).then(res => {
      const dataSource = res.result || {};
      this.setState({ dataSource });
    });
  }

  beforeUpload = (file, record) => {
    const { id, purchaseDeviceId, parentId, } = record;

    let params = new FormData();
    params.append('file', file);
    params.append('id', id);
    params.append('purchaseDeviceId', purchaseDeviceId)
    params.append('parentId', parentId)

    axios({
      method: 'post',
      url: '/supply/importSn',
      headers: {'Content-Type': 'multipart/form-data'},
      data: params,
    }).then(res => {
      const code = _.get(res, 'data.code', null)
      if (code === '0') {
        message.success('导入成功！');
      } else {
        message.error(`${_.get(res, 'data.message', '')}`);
      } 
    }).catch(res => {
      message.error('请求失败！');
    });
    
    return false;
  }

  onExport = (record) => {
    const { id, purchaseDeviceId, parentId } = record;
    const params = {
      id,
      purchaseDeviceId,
      parentId
    };
    const queryString = qs.stringify(params);
    window.open(`/supply/exportSn?${queryString}`);
  }

  onGridChange = (pagination, filters, sorter) => {   
    const { current, pageSize, } = pagination;
    const nextPagination = {
      pageNum: current,
      pageSize,
    }
    this.setState({ pagination: nextPagination}, () => {
      this.getList();
    });
  }

  render() {

    const columns = [
      {
        title: '采购单编号',
        dataIndex: 'purchaseId',
        width: 120,
      }, {
        title: '合同号',
        dataIndex: 'poId',
        width: 100,
      }, {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 100,
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        width: 180,
      }, {
        title: '型号',
        dataIndex: 'model',
        width: 100,
      },
      {
        title: '描述',
        dataIndex: 'configuration',
        width: 400,
      }, {
        title: '设备数量',
        dataIndex: 'count',
        width: 100,
      },
      {
        title: '资产编号',
        dataIndex: 'pn',
        width: 100,
      }, {
        title: 'SN号',
        dataIndex: 'sn',
        width: 100,
      }, {
        title: '到货地点',
        dataIndex: 'arrivalSite',
        width: 200,
      },{
        title: '是否全部到货',
        dataIndex: 'deliverStatus',
        width: 120,
        render: (text, record) => {
          let status = text?  '是' : '否';
          return <span>{status}</span>;
        },
      },{
        title: '操作',
        dataIndex: 'operate',
        width: 300,
        fixed: 'right',
        render: (text, record, index) => {
          return <span className="u-supplier-deliver-operate">
            <Button onClick={row => this.onExport(record)}>
              导出SN{/* <Icon type="download" /> */}
            </Button>
            <Upload  showUploadList={false} beforeUpload={ (file ) => this.beforeUpload(file, record) }>
              <Button>
                导入SN{/* <Icon type="upload"></Icon> */}
              </Button>
            </Upload>
          </span>
        },
      },
    ];

    const totalDetailNav = {
      key: '/supplierDelivered',
      title: '已发货清单',
      name: '已发货设备清单',
    };

    return (
      <Content >
        <Breadcrumb nav={totalDetailNav} />
        <div className="m-supplier-sn">
          <TableContent 
            search={{
              value: this.state.searchKeyword,
              onChange: (e) => this.setState({ searchKeyword: e.target.value }),
              onPressEnter: this.getList,
            }}>
            <Grid
              KEYS={KEYS}
              columns={columns}
              rowKey={record => `${record.parentId}${record.purchaseDeviceId}` }
              data={this.state.dataSource}
              onChange={this.onGridChange }
              scroll={{x: 1950, y:600}}
            />
          </TableContent>
        </div>
      </Content>

    );
  }
}

export default function DeliveredDetailPage(props) { return <DeliveredDetail {...props} />; }