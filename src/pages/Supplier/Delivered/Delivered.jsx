import React, { Component } from 'react';
import { connect } from 'react-redux';
import api from 'src/api';
import {  Grid } from 'src/components';
import { Content, TableContent, MenuTitle, } from 'src/containers';
import './Delivered.scss';
import { comdify } from 'src/libs';
import KEYS from '../config';


class Delivered extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKeyword: '',
      status: '1',
      selectedRows: [],
      history: [],
    };
  }

  componentDidMount() {

  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    const { searchKeyword, history, status } = this.state;
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
    api.supplyToDeliver({list}).then(res => {

    });
  }

  onRowClick = (record) => {
    this.props.history.push( `/supplierDelivered/delivereddetail?id=${record.id}` );
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
        render: (text) => (<span>{comdify(text)}</span>),
      }, {
        title: '合同数量',
        dataIndex: 'deviceNum',
      },
      // {
      //   title: '是否全部到货',
      //   dataIndex: 'deliverStatus',
      //   render: (text, record) => {
      //     let status = text === '0' ? '否' : '是'
      //     return <span>{status}</span>;
      //   },
      // }
    ];

    const items = [
      { name: '已发货清单', key: '/supplier/delivered' },
    ]
    
    return (

      <Content >
        <MenuTitle items={items}/>
        <div className="m-supplier-sn">
          <TableContent 
            search={{
              value: this.state.searchKeyword,
              onChange: (e) => this.setState({ searchKeyword: e.target.value}),
              onPressEnter: this.getList,
            }}>
            <Grid
              KEYS={KEYS}
              columns={columns}
              history={this.state.history}
              api={api.supplyQueryDeliverPo}
              rowKey='poId'
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

export default function DeliveredPage(props) { return <Delivered {...props} />; }