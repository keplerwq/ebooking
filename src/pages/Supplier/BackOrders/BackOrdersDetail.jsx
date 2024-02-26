import React, { Component } from 'react';
import _ from 'lodash';
import qs from 'qs';
import api from 'src/api';
import { Button, InputNumber, Modal, DatePicker } from 'antd';
import { Grid, message, ModalEx } from 'src/components';
import { Content, TableContent, Breadcrumb } from 'src/containers';
import { defaultPagination } from 'src/config/index';
import './BackOrders.scss';
import KEYS from '../config';
import ImportModal from './ImportModal'

class BackOrdersDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      selectedRows: [],
      totalSelectedRows: [],
      id: '',
      dataSource: {},
      pagination: { ...defaultPagination },
      status: '0',
      isRequesting: false,
      isAllRequesting: false,
      ifDeliver: false,
      deliverTime: undefined,
      sendData: {},
    };
    this.checkDeviceNum = _.debounce(this.checkDeviceNum, 500);
  }

  componentWillMount() {
    const params = qs.parse(this.props.location.search.substring(1));
    const { id, } = params;
    this.setState({ id })
  }

  componentDidMount() {
    this.getList();
  }

  fresh = () => {
    this.setState({ selectedRows: [], totalSelectedRows: [], }, () => {
      this.getList();
    })
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
      const dataSource = res.result || { list: [], };
      dataSource.list = dataSource.list.map(d => {
        d._sysCount = d.count;
        return d;
      });
      this.setState({ dataSource });
    });
  }

  onRowSelectionChange = (selectedRowKeys, selectedRows) => {
    const idList = _.get(this.state.dataSource, 'list', []).map(l => l.id);
    let totalSelectedRows = this.state.totalSelectedRows.filter(s => !idList.includes(s.id));
    totalSelectedRows = [...totalSelectedRows, ...selectedRows];
    // console.log(totalSelectedRows)
    this.setState({ selectedRows, totalSelectedRows });
  }

  onDeliver = (type) => {
    let selectedRows = type === 'all' ? _.get(this.state.dataSource, 'list', []) : this.state.totalSelectedRows;
    let errors = [];
    let sendData = {};
    for (let row of selectedRows) {
      if (!row.count || row.count > row._sysCount) {
        errors.push({
          name: row.pn,
        });
      }
    }

    if (errors.length) {
      ModalEx.confirm({
        title: '提示',
        content: <p> {`请填写${errors[0].name}的正确设备数量，不能为0且不能大于代发货设备数量！`}</p>,
        footer: null,
      });
      return;
    }

    if (type === 'all') {
      const { id } = this.state;
      sendData = { id };
    } else {

      const list = selectedRows.map(s => {
        const { id, count, purchaseDeviceId, } = s;
        return {
          id,
          count,
          purchaseDeviceId,
        }
      })
      sendData = { list };
    }

    this.setState({
      ifDeliver: true,
      sendData,
    })
    // this.setState({ isRequesting: true }, () => {
    //   api.supplyToDeliver({ list }).then(res => {
    //     message.success(res.message || '');
    //     this.setState({ isRequesting: false }, () => {
    //       this.fresh();
    //     });
    //   }).catch(() => this.setState({ isRequesting: false }));
    // });

  }
  deliver = () => {
    const { sendData, deliverTime } = this.state;

    const data = Object.assign({}, sendData, { time: deliverTime.valueOf() });

    api.supplyToDeliver(data).then(res => {
      message.success(res.message || '');
      this.setState({ isRequesting: false, ifDeliver: false }, () => {
        this.fresh();
      });
    }).catch(() => this.setState({ isRequesting: false }));
  }

  // onDeliverAll = () => {
  //   const { id } = this.state;
  //   this.setState({ isAllRequesting: true }, () => {
  //     api.supplyToDeliver({ id }).then(res => {
  //       message.success(res.message || '');
  //       this.setState({ isAllRequesting: false }, () => {
  //         this.fresh();
  //       });
  //     }).catch(() => this.setState({ isAllRequesting: false }));
  //   });
  // }

  selectDeliverTime = (moment) => {
    this.setState({ deliverTime: moment })
  }

  onEditCellChange = (value, dataIndex, record) => {
    this.checkDeviceNum(value, record);
    const dataSource = { ...this.state.dataSource };
    const target = dataSource.list.find(item => item.id === record.id);
    if (target) {
      target[dataIndex] = value;
      this.setState({ dataSource });
    }
    const totalSelectedRows = [...this.state.totalSelectedRows];
    const targetTotal = totalSelectedRows.find(item => item.id === record.id);
    if (targetTotal) {
      targetTotal[dataIndex] = value;
      this.setState({ totalSelectedRows });
    }
  }

  checkDeviceNum(value, record) {
    if (value > record._sysCount) {
      message.warning(`待发货设备数量(${value})不能大于订单中的设备数量(${record._sysCount})`)
      return false
    }
    return true;
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

  showModal = () => {
    this.setState({
      modalVisible: true
    })
  }

  onModalCancel = () => {
    this.setState({
      modalVisible: false
    })
  }

  onModalOK = () => {
    this.setState({
      modalVisible: false
    })
    this.getList()
  }

  render() {
    const { ifDeliver, deliverTime, isRequesting } = this.state;
    const columns = [
      // {
      //   title: '发货',
      //   dataIndex: 'index',
      // },
      {
        title: '采购单编号',
        dataIndex: 'purchaseId',
        width: 140,
      }, {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 100,
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        width: 100,
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
        width: 200,
        render: (text, record, index) => {
          return <InputNumber min={1} precision={0} onChange={value => this.onEditCellChange(value && parseFloat(value), 'count', record)} value={text} />
        }
      },
      {
        title: '资产编号',
        dataIndex: 'pn',
        width: 140,
      }, {
        title: 'SN号',
        dataIndex: 'sn',
        width: 100,
      }, {
        title: '到货地点',
        dataIndex: 'arrivalSite',
        width: 200,
      },
    ];

    const totalDetailNav = {
      key: '/supplierBackOrders',
      title: '待发货清单',
      name: '待发货设备清单',
    };

    const title = new Date().toLocaleDateString() !== '2021/12/31' ?  (
      <div>
        <Button type="primary"
          onClick={this.onDeliver}
          loading={this.state.isRequesting}
          disabled={!this.state.selectedRows.length}>确认发货</Button>
        <Button type="primary"
          onClick={() => this.onDeliver('all')}
          loading={this.state.isAllRequesting}
          disabled={!_.get(this.state.dataSource, 'list', []).length}>全单发货</Button> 
      </div>
    ) : <div></div>;

    

    return (
      <Content >
        <Breadcrumb nav={totalDetailNav} />
        <div className="m-supplier-backOrder">
          <TableContent
            title={title}
            header={new Date().toLocaleDateString() !== '2021/12/31' && <Button type="primary" onClick={this.showModal}>按资产编号发货</Button>}
            search={{
              value: this.state.searchKeyword,
              onChange: (e) => this.setState({ searchKeyword: e.target.value }),
              onPressEnter: this.getList,
            }}>
            <Grid
              KEYS={KEYS}
              columns={columns}
              rowSelection={{
                type: 'checkbox',
                onChange: this.onRowSelectionChange,
                selectedRowKeys: this.state.totalSelectedRows.map(s => `${s.id}-${s.purchaseDeviceId}`)
              }}
              rowKey={record => `${record.id}-${record.purchaseDeviceId}`}
              data={this.state.dataSource}
              onChange={this.onGridChange}
              scroll={{ x: 1500, y: 600 }}
            />
          </TableContent>
          {/* getCheckboxProps: record => ({
                  disabled: record.count > record._sysCount, 
                }), */}
          <Modal
            title="预计到货时间"
            width="300px"
            visible={ifDeliver}
            onCancel={() => this.setState({ ifDeliver: false })}
            footer={(
              <Button
                type="primary"
                disabled={!deliverTime}
                onClick={this.deliver}
                loading={isRequesting}
              >确定</Button>
            )}
          >
            <div
              style={{ textAlign: 'center', height: 120 }}

            >
              <p>请选择预计到货日期</p>
              <DatePicker
                value={deliverTime}
                onChange={this.selectDeliverTime}
              />
            </div>
          </Modal>
        </div>
        <ImportModal id={this.state.id} visible={this.state.modalVisible} onOk={this.onModalOK} onCancel={this.onModalCancel}/>
      </Content>
    );
  }
}

export default function BackOrdersDetailPage(props) { return <BackOrdersDetail {...props} />; };