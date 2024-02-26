import React, { Component } from 'react';
import api from 'src/api';
import {  Grid } from 'src/components';
import { Content, TableContent, MenuTitle, } from 'src/containers';
import './BackOrders.scss';
import { comdify } from 'src/libs';
import KEYS from '../config';
import { Button } from 'antd';


class BackOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      selectedRows: [],
      history: [],
      status: '0',
      modalVisible: false,
    };
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    const { searchKeyword, history, status} = this.state;
    const nextHistory = history.concat([{
      searchKeyword,
      status
    }]);
    this.setState({
      history: nextHistory,
    });
  }

  onRowSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({  selectedRows });
  }

  onDeliver = () => {
    const { selectedRows } = this.state;
    const list = selectedRows.map(s => {
      const { poId, deviceList = [],  } = s;
      const deviceSnId = deviceList.map(d => d.deviceSnId);
      return {
        poId,
        deviceSnId,
      }
    })
    api.supplyToDeliver({list});
  }

  onRowClick = (record) => {
    // PURCHASE-321  【线上】E-booking-待发货清单，点击清单进入详情页报404 http://jira.netease.com/browse/PURCHASE-321
    this.props.history.push( `/supplierBackOrders/backOrdersdetail?id=${record.id}` );
  }

  render() {
    const columns = [
      {
        title: '合同号',
        dataIndex: 'poId',
      }, {
        title: '抬头',
        dataIndex: 'header',
      },
      {
        title: '合同金额',
        dataIndex: 'price',
        render: (text) => comdify(text),
      }, {
        title: '合同数量',
        dataIndex: 'deviceNum',
      }
    ];

    const items = [
      { name: '待发货清单', key: '/supplier/backOrders' },
    ]

    return (

      <Content >
        <MenuTitle items={items}/>

        <div className="m-supplier-backOrder">

          <TableContent  search={{
            value: this.state.searchKeyword,
            onChange: (e) => this.setState({ searchKeyword: e.target.value}),
            onPressEnter: this.getList,
          }}>
            <Grid
              KEYS={KEYS}
              columns={columns}
              history={this.state.history}
              api={api.supplyQueryDeliverPo}
              rowKey='id'
              onRow={
                (record, index) => {
                  return {
                    onClick: () => {this.onRowClick(record)},      
                  };
                }
              }
            />
          </TableContent>

        </div>
      </Content>

    );
  }
}

export default function BackOrdersPage(props) { return <BackOrders {...props} />; }