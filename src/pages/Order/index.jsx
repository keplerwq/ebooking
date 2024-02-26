/**
 * @file  订单管理
 * @author dongxu
 * 
 */

import React, { Component } from 'react';
import _ from 'lodash';
import qs from 'qs';
import { Content, message, CopyTextToClipboard } from 'src/components';
import { DownOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Button,
  Input,
  InputNumber,
  Popover,
  Select,
  Table,
  Tabs,
  DatePicker,
  Menu,
  Dropdown,
  Modal,
} from 'antd';
import api from 'src/api';
import './Order.scss';
import addExcelBatchDeliver from './excelBatchDeliver';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchParams: {
        sid: '',
        type: undefined,
        consignee: '',
        goodsInfo: '',
        date: undefined,
        state: 'ALL'
      },
      searchParamsExport: {
        sid: '',
        type: undefined,
        consignee: '',
        goodsInfo: '',
        date: undefined,
        state: 'ALL'
      },
      stateDataList: {},
      stateList: [
        {
          name: "全部",
          value: "ALL",
          color: "#fff"
        },
        {
          name: "待发货",
          value: "WAIT_DELIVER",
          color: "#FF7F00"
        },
        {
          name: "部分发货",
          value: "PART_DELIVERED",
          color: "#FF6679"
        },
        {
          name: "已发货",
          value: "DELIVERED",
          color: "#C1DE26"
        },
        {
          name: "部分签收",
          value: "PART_RECEIVED",
          color: "#71C17C"
        },
        {
          name: "已签收",
          value: "RECEIVED",
          color: "#119422"
        },
        {
          name: "已取消",
          value: "CANCELED",
          color: "#BEBFC1"
        },
        {
          name: "售后中",
          value: "ASS",
          color: "#E1463A"
        }
      ],
      orderType: [],
      data: [],
      page: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      selectedRowKeys: [],
      selectedRows: [],
      /* 批量发货 */
      batchDeliverModal: {
        visible: false,
        confirmLoading: false,
      },
      batchDeliverForm:{
        expressType: '物流',
        company: undefined,
        otherCompany: '',
        expressId: '',
        remark: '',
      },
      /* 单个发货 */
      deliverModal: {
        visible: false,
        confirmLoading: false,
      },
      /* IT_PURCHASE 订单中物流信息列表 */
      orderExpressList: [],
      deliverForm:{
        expressType: '物流',
        company: undefined,
        otherCompany: '',
        expressId: '',
        remark: '',
        num: '',
        brand: '',
        name: '',
        property: '',
        IT_PURCHASE_ID: undefined,
        IT_PURCHASE_index: 0
      },
    };

  }

  componentDidMount() {
    let query = this.props.match.params;
    let { state } = query;
    state = state || "ALL";
    const params = qs.parse(this.props.location.search.substring(1));
    const searchParams = { ...this.state.searchParams, ...params, state: state };
    this.setState({ searchParams, page: {
      current: params.offset ? params.offset - 0 : 1,
      total: 0,
      pageSize: params.limit ? params.limit - 0 : 10
    } }, () => this.getList());
    this.getStateList();
    this.getOrderType();

    // qs.parse(window.location.search)
  }

  componentWillReceiveProps(props) {
  }

  onSearchParamsChange = (value, name) => {
    const searchParams = { ...this.state.searchParams, [name]: value };
    this.setState({ searchParams });
  }


  /**
   * @function 切换顶部状态菜单
   * @params {String} value
   * @params {String} name
  */
  onSearchStateChange = (value, name) => {
    const searchParams = { ...this.state.searchParams, [name]: value };
    this.setState({ searchParams }, () => this.onSearch());
  }

  /**
   * @function 搜索模块，下单时间数据
   * @params {Object} date
   * @params {String} dateString
  */
  onSearchDateChange = (date, dateString) => {
    const searchParams = {
      ...this.state.searchParams,
      date: date
    };
    this.setState({ searchParams });
  }

  onSearch = () => {
    this.setState({ page: { ...this.state.page, current: 1 } }, () => {
      this.getList();
    });
  }

  getList = () => {
    const params = Object.assign({}, this.state.searchParams);
    params.startTime = params.date && params.date.length ? params.date[0].format('YYYY-MM-DD') : '';
    params.endTime = params.date && params.date.length ? params.date[1].format('YYYY-MM-DD') : '';
    delete params.date;
    params.limit = this.state.page.pageSize;
    params.offset = this.state.page.current;


    const searchParamsExport = Object.assign({}, params);
    this.setState({ searchParamsExport: searchParamsExport })

    this.props.history.replace("/order/" + (params.state || 'ALL') + '?' + qs.stringify(params));
    api.queryOrderList(params).then((res) => {
      console.log(params);
      
      if (res.code === 0) {
        let { page } = this.state;
        page.total = res.msg.count;
        this.setState({
          data: res.msg.list,
          page,
          selectedRowKeys: [],
          selectedRows: []
        });
      } else {
        message.error(res.msg, 3);
      }
    });
  }

  getStateList = () => {
    api.queryOrderStateList().then((res) => {
      if (res.code === 0) {
        this.setState({
          stateDataList: res.msg
        });
      }
      else {
        this.setState({
          stateDataList: {}
        });
      }
    });
  }

  getOrderType = () => {
    api.queryOrderType().then((res) => {
      if (res.code === 0) {
        let list = Object.keys(res.msg).map(elem => {
          return {
            value: elem,
            label: res.msg[elem]
          }
        });
        this.setState({ orderType: list })
      } else {
        this.setState({ orderType: [] })
      }
    });
  }

  onReset = () => {
    this.setState({
      searchParams: {
        sid: '',
        type: undefined,
        consignee: '',
        goodsInfo: '',
        date: undefined,
        state: 'ALL'
      }
    }, () => {
      this.onSearch();
    },() => {
      console.log(this.state.searchParams);
      
    })
  }

  onDetail = (record, type, params) => {
    this.props.history.push({
      pathname: `/orderdetail/${record.id}/${type}?${params}`,

    })
  }

  onBatchExport = () => {
    const { selectedRows } = this.state;
    let ids = '';
    if (selectedRows.length > 0) {
      ids = selectedRows.map(x => x.sid).toString();
    };
    const params = Object.assign({},this.state.searchParamsExport)
    delete params.limit;
    params.offset = 0;
    params.sids = ids;
    var queryString = qs.stringify(params);
    window.open("/supplier/order/exportExcel?" + queryString);
  }

  onBatchDelivery = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    let flag = true;
    if (selectedRows.length) {
      for (let item of selectedRows) {
        if (['WAIT_DELIVER', 'PART_DELIVERED'].indexOf(item.state) < 0) {
          message.warning('仅待发货、部分发货状态可以批量发货!');
          flag = false;
          break;
        }
      }
      if(flag) {   //表格批量发货
        const sids = selectedRows.map(item => item.sid);
        addExcelBatchDeliver({ list: sids }, () => {
          this.getList();
          this.setState({
            selectedRowKeys: [],
            selectedRows: []
          });
        });
      }
    }
    else {
      message.warning('请选择需要发货的条目!');
    }
  }

  pageSizeChange = (current, pageSize) => {
    let page = this.state.page;
    page.pageSize = pageSize;
    /* 切换分页条数后，返回第一页*/
    page.current = 1;
    this.setState({ page },() => console.log(this.state.page),'pageSizeChange');
    this.getList();
  }

  onPageChange = (current, pageSize) => {
    let page = this.state.page;
    page.current = current;
    this.setState({ page },() => console.log(this.state.page),'onPageChange')
    this.getList();
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows },console.log(selectedRowKeys, selectedRows, 'selectedRowKeys, selectedRows'));
  }

  /**
   * @function 批量发货modal
   */

  showModalBatchDeliver = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    let flag = true;
    if (selectedRows.length) {
      for (let item of selectedRows) {
        if (['WAIT_DELIVER', 'PART_DELIVERED'].indexOf(item.state) < 0) {
          message.warning('仅待发货、部分发货状态可以批量发货!');
          flag = false;
          break;
        }
      }
      if(flag) {  //批量发货
        const batchDeliverModal = Object.assign({}, this.state.batchDeliverModal, { visible: true })
        this.setState({ batchDeliverModal });
      }
    } else {
      message.warning('请至少选择一笔订单!');
    }
  }

  /**
   * @function 批量发货表单提交
   */
  onOkBatchDeliver = () => {
    const batchDeliverForm = this.state.batchDeliverForm
    if(batchDeliverForm.expressType === '物流') {
      if(!(batchDeliverForm.company && batchDeliverForm.expressId)){
        message.error("必填项不得为空");
        return
      }
      if(batchDeliverForm.company === '其他物流' && !batchDeliverForm.otherCompany) {
        message.error("请填写物流公司");
        return
      }
    }

    this.setState({
      batchDeliverModal:{
        visible: true,
        confirmLoading: false
      }
    });

    let ids = this.state.selectedRows.map(item => item.sid).join(',')
    let params = {
      remark: batchDeliverForm.remark,
      expressType: batchDeliverForm.expressType,
    };

    if(batchDeliverForm.expressType === '物流') {
      params = Object.assign(
        {},
        params,
        {
          expressId: batchDeliverForm.expressId,
        }
      )
      if(batchDeliverForm.company === '其他物流') {
        params = Object.assign(
          {},
          params,
          {
            company: batchDeliverForm.otherCompany
          }
        )
      } else {
        params = Object.assign(
          {},
          params,
          {
            company: batchDeliverForm.company
          }
        )
      }
    }
    const expressList = [params];
    // console.log(ids,params ,'批量发货params ');
    api.batchDelivery({ sids: ids, expressList }).then((res) => {
      this.setState({
        batchDeliverModal:{
          visible: false,
          confirmLoading: false
        }
      });
      if (res.code === 0) {
        message.success('批量发货成功')
        
        this.setState({
          batchDeliverForm:{
            expressType: '物流',
            company: undefined,
            otherCompany: '',
            expressId: '',
            remark: '',
          }
        },
        () => this.onSearch())
      }
      else {
        message.error(res.msg)
        this.setState({
          batchDeliverModal:{
            visible: true,
            confirmLoading: false
          }
        });
      }
    });

  }

  onCancelBatchDeliver = () => {
    const batchDeliverModal = Object.assign({}, this.state.batchDeliverModal, { visible: false })
    this.setState({ batchDeliverModal });
    this.setState({
      batchDeliverForm:{
        expressType: '物流',
        company: undefined,
        otherCompany: '',
        expressId: '',
        remark: '',
      }
    })
  }

  onChangeBatchDeliverForm = (value, name) => {
    const batchDeliverForm = Object.assign({}, this.state.batchDeliverForm, { [name]: value })
    this.setState({ batchDeliverForm },() => console.log(this.state.batchDeliverForm,'batchDeliverForm'))
  }

  /**
   * @function 单个发货modal
   * @param text {Object} 当前行的数据，用以显示在发货modal
   */
  showModalDeliver = (text) => {
    /* 处理两种订单来源的不同属性的数据格式 */
    let property;
    
    if (text.type === 'HUI_SHOP') {
      if (text.property !== '[]') {
        let propertys = JSON.parse(text.property);
        property = propertys.map((pro, index) => {
          return <p key={index}>{pro.propertyName}：{pro.propertyValue}</p>;
        })
      } else {
        property = '';
      }
      const deliverFormTemp = Object.assign({},
        this.state.deliverForm,
        {
          brand: text.brand,
          name: text.name,
          property: property,
          num: text.num,
          id: text.id,
          sid: text.sid
        })
      this.setState({ deliverForm: deliverFormTemp });

      const deliverModal = Object.assign({}, this.state.deliverModal, { visible: true });
      this.setState({ deliverModal });
    } else {
      /* IT_PURCHASE 订单中有多个物流信息的情况 */
      /* 获取多个物流的信息 */
      const params = { "sid": text.sid };
      api.queryOrderExpressList(params).then((res) => {
        /* 确保接口返回数据中有收货人 */
        if (res.code === 0 && res.msg && res.msg.length) {
          const firstNum = res.msg[0].num;
          this.setState({ orderExpressList: res.msg })

          const deliverFormTemp = Object.assign({},
            this.state.deliverForm,
            {
              brand: text.brand,
              name: text.name,
              property: property,
              num: firstNum,
              id: text.id,
              sid: text.sid,
            })
          this.setState({ deliverForm: deliverFormTemp })
          
          const deliverModal = Object.assign({}, this.state.deliverModal, { visible: true })
          this.setState({ deliverModal });
        } else {
          this.setState({ orderExpressList: [] })
          message.error('未能获取该订单收货人信息');
        }
      });
      property = text.property;


    }


  }

  /**
   * @function 单个发货表单提交
   */
  onOkDeliver = () => {
    const deliverForm = this.state.deliverForm;
    const orderExpressList = this.state.orderExpressList;
    if(deliverForm.expressType === '物流') {
      if(!(deliverForm.company && deliverForm.expressId)){
        message.error("必填项不得为空");
        return
      }
      if(deliverForm.company === '其他物流' && !deliverForm.otherCompany) {
        message.error("请填写物流公司");
        return
      }
    }

    this.setState({
      deliverModal:{
        visible: true,
        confirmLoading: false
      }
    });
    let id = deliverForm.sid;
    let IT_PURCHASE_ID;
    if(orderExpressList && orderExpressList.length > 0){
      IT_PURCHASE_ID = orderExpressList[deliverForm.IT_PURCHASE_index].id;
    }
    let params = {
      remark: deliverForm.remark,
      num: deliverForm.num,
      id: IT_PURCHASE_ID
    };
    if(deliverForm.expressType === '物流') {
      params = Object.assign(
        {},
        params,
        {
          expressType: deliverForm.expressType,
          expressId: deliverForm.expressId,
        }
      )


      if(deliverForm.company === '其他物流') {
        params = Object.assign(
          {},
          params,
          {
            company: deliverForm.otherCompany
          }
        )
      } else {
        params = Object.assign(
          {},
          params,
          {
            company: deliverForm.company
          }
        )
      }
    } else {
      params = Object.assign(
        {},
        params,
        { expressType: deliverForm.expressType }
      )
    }

    const expressList = [params];

    api.deliveryOrder({ sid: id, expressList }).then((res) => {
      if (res.code === 0) {
        this.setState({
          deliverModal:{
            visible: false,
            confirmLoading: false
          }
        });
        message.success('发货成功')

        const deliverFormTemp = Object.assign({},
          this.state.deliverForm,
          {
            expressType: '物流',
            company: undefined,
            otherCompany: '',
            expressId: '',
            remark: '', 
            IT_PURCHASE_ID: undefined,
            IT_PURCHASE_index: 0
          })
        this.setState(
          {  
            deliverForm: deliverFormTemp,
            orderExpressList: []
          },
          () => this.onSearch()
        );
      }
      else {
        message.error(res.msg)
        this.setState({
          deliverModal:{
            visible: true,
            confirmLoading: false
          }
        });
      }
    });

  }

  onCancelDeliver = () => {
    const deliverModal = Object.assign({}, this.state.deliverModal, { visible: false })
    this.setState({ deliverModal });
    const deliverFormTemp = Object.assign({},
      this.state.deliverForm,
      {
        expressType: '物流',
        company: undefined,
        otherCompany: '',
        expressId: '',
        remark: '', 
        IT_PURCHASE_ID: undefined,
        IT_PURCHASE_index: 0
      })
    this.setState({  
      deliverForm: deliverFormTemp,
      orderExpressList: []
    });
  }

  onChangeDeliverForm = (value, name) => {
    const deliverForm = Object.assign({}, this.state.deliverForm, { [name]: value })
    if(name === "IT_PURCHASE_index") {
      this.state.orderExpressList.map((item, index) => {
        if(index === value) {
          this.setState({
            deliverForm: {
              ...deliverForm,
              IT_PURCHASE_index: index,
              num: item.num
            }
          },
          // () => console.log(this.state.deliverForm,item)
          )
        }
      })
    } else {
      this.setState({ deliverForm },() => console.log(this.state.deliverForm,'deliverForm'))
    }
  }
  

  render() {
    const stateMap = {
      WAIT_DELIVER: '待发货',
      PART_DELIVERED: '部分发货',
      DELIVERED: '已发货',
      PART_RECEIVED: '部分签收',
      RECEIVED: '已签收',
      CANCELED: '已取消',
      ASS: '售后'
    };

    const columns =
      [{
        title: '订单ID',
        dataIndex: 'sid',
        width: 130,
        render: (text, record) => {
          return <Link to={`/orderdetail/${record.id}/${record.sid}/detail`} key={text} style={{ wordWrap: "break-word", wordBreak: "break-all" }}>{text}</Link>
        }
      }, {
        title: '订单来源',
        dataIndex: 'type',
        width: 90,
        render: (text) => {
          let type;
          if (text === "HUI_SHOP") {
            type = "内购";
          } else if (text === "IT_PURCHASE") {
            type = "集团采购";
          } else if (text === "QUANYI_MALL") {
            type = "白金卡商城";
          } else {
            type = "";
          }
          return <span>{type}</span>
        }
      }, {
        title: '订单状态',
        dataIndex: 'state',
        width: 100,
        render: (text, record) => {
          let bg;
          stateList.map(ele => {
            if (ele.value === text) {
              bg = ele.color;
            }
          })
          return <span>
            <span className="status-point" style={{ background: bg }}></span>
            {stateMap[record.state]}
          </span>
        }
      }, {
        title: 'SKU图',
        dataIndex: 'imgSkuList',
        align: 'center',
        width: 130,
        render: (text, record) => {
          if (record.imgSkuList !== '[]' && record.imgSkuList) {
            let imgSkuList = JSON.parse(record.imgSkuList);
            return <img src={imgSkuList[0]} className="s-size" alt="SKU图" />
          } else {
            return '';
          }
        }
      }, {
        title: '品牌-名称',
        width: 150,
        render: (text, record, index) => {
          return <div className="text-overflow">
            <Popover
              content={
                <div style={{ width: 200 }}>
                  <div style={{ wordWrap: 'break-word', lineHeight: '26px' }}>{`${record.brand}-${record.name}`}</div>
                </div>
              }
              trigger="hover"
            >
              <span>{`${record.brand}-${record.name}`}</span>
            </Popover>
          </div>
        }
      }, {
        title: '属性',
        dataIndex: 'property',
        width: 150,
        render: (text, record, index) => {
          if (record.type === 'HUI_SHOP') {
            if (record.property !== '[]') {
              let propertys = JSON.parse(record.property);
              return (
                <Popover
                  content={
                    <div>
                      {propertys.map((pro, index) => {
                        return <p key={index} style={{ margin: 0 }}>{pro.propertyName}：{pro.propertyValue}</p>;
                      })}
                    </div>
                  }
                  trigger="hover"
                >
                  <div>
                    {propertys.slice(0, 2).map((pro, index) => {
                      return (<p 
                        key={index}
                        className="text-overflow"
                        style={{ margin: 0, whiteSpace: 'nowrap', display: 'block', width: 118 }}
                      >
                        {pro.propertyName}：{pro.propertyValue}
                      </p>);
                    })}
                  </div>
                </Popover>
              )
            } else {
              return '';
            }
          } else {
            return (
              <Popover
                content={
                  <div style={{ width: 200 }}>
                    <div style={{ wordWrap: 'break-word', lineHeight: '26px' }}>{text}</div>
                  </div>
                }
                trigger="hover"
              >
                <div className="text-overflow">
                  <span>{text}</span>
                </div>
              </Popover>
            );
          }
        }
      }, {
        title: '商家商品编码',
        dataIndex: 'supplierCode',
        width: 120,
        render: (text, record) => {
          return <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>{text}</div>
        }
      }, {
        title: '数量',
        dataIndex: 'num',
        width: 60
      }, {
        title: '收货人',
        dataIndex: 'consignee',
        width: 100
      }, {
        title: '收货电话',
        dataIndex: 'phone',
        width: 120
      }, {
        title: '收货地址',
        dataIndex: 'address',
        width: 180,
        render: (text, record, index) => {
          return <div className="text-overflow">
            <Popover
              content={
                <div style={{ width: 200 }}>
                  <div style={{ wordWrap: 'break-word', lineHeight: '26px' }}>{text}</div>
                </div>
              }
              trigger="hover"
            >
              <span>{text}</span>
            </Popover>
          </div>
        }
      }, {
        title: '未税单价',
        dataIndex: 'unTaxPrice',
        width: 100,
      }, {
        title: '含税单价',
        dataIndex: 'price',
        width: 100,
      }, {
        title: '采购总价',
        dataIndex: 'totalPrice',
        width: 130,
      }, {
        title: '下单备注',
        dataIndex: 'orderRemark',
        width: 130,
        render: (text, record) => {
          return text ?
            <div className="text-overflow">
              <Popover
                content={
                  <div style={{ width: 200 }}>
                    <div style={{ wordWrap: 'break-word', lineHeight: '26px' }}>{text}</div>
                    <div>
                      <CopyTextToClipboard text={`${text}`}>
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
                trigger="hover"
              >
                <span>{text}</span>
              </Popover>
            </div>
            : null
        }
      }, {
        title: '发货方式',
        dataIndex: 'expressType',
        width: 130,
      }, {
        title: '下单时间',
        dataIndex: 'orderTime',
        width: 130,
      }, {
        title: '发货时间',
        dataIndex: 'deliverTime',
        width: 130,
      },
      {
        title: '到货周期',
        dataIndex: 'arrivalCycle',
        width: 130,
      }, {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record) => (

          <div>
            {
              record.state === 'WAIT_DELIVER' || record.state === 'PART_DELIVERED'
                ?
                < a className="u-operation" onClick={() => this.showModalDeliver(text)}>发货</a>
                : ''
            }
          </div>
        )

      }];

    let menu = (
      <Menu>
        <Menu.Item>
          <div onClick={this.onBatchExport}>
            批量导出
          </div>
        </Menu.Item>
        <Menu.Item>
          <div onClick={this.showModalBatchDeliver}>
            批量发货
          </div>
        </Menu.Item>
        <Menu.Item>
          <div onClick={this.onBatchDelivery}>
            表格批量发货
          </div>
        </Menu.Item>
      </Menu>
    );

    const companyMap = ['顺丰','申通','中通','圆通','韵达','京东','汇通','EMS','天天','邮政包裹/平邮','其他物流'];
    
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const { searchParams, page, data, stateList, orderType, stateDataList,
      batchDeliverModal, batchDeliverForm, deliverModal, deliverForm,
      selectedRowKeys, selectedRows, orderExpressList } = this.state;

    return (
      <Content size="full">
        <div className="g-order">
          <div className="m-search-state">
            <Tabs activeKey={searchParams.state} onChange={(value) => { this.onSearchStateChange(value, 'state') }}>
              {
                stateList.map(item =>
                  <TabPane
                    tab={
                      <span>
                        <span className="status-point" style={{ background: item.color }}></span>
                        {
                          `${item.name}
                           ${!_.isEmpty(stateDataList) && stateDataList[item.value] ? stateDataList[item.value].count === undefined ? '' : stateDataList[item.value].count : ''}
                          `
                        }
                      </span>
                    }
                    key={item.value}
                  >
                  </TabPane>)
              }
            </Tabs>
          </div>
          <div className="m-search">
            <div className="search-item">
              <label>订单ID</label>
              <Input
                className="u-search-item"
                value={searchParams.sid}
                onChange={(e) => { this.onSearchParamsChange(e.target.value, 'sid') }}
                placeholder="请输入"
              />
            </div>

            <div className="search-item">
              <label>订单来源ID</label>
              <Input
                className="u-search-item"
                value={searchParams.oid}
                onChange={(e) => { this.onSearchParamsChange(e.target.value, 'oid') }}
                placeholder="请输入"
              />
            </div>

            <div className="search-item">
              <label>订单来源</label>
              <Select
                className="u-search-item"
                value={searchParams.type}
                onChange={(value) => { this.onSearchParamsChange(value, 'type') }}
                allowClear
                placeholder="请选择"
              >
                {
                  orderType.map(item =>
                    <Option
                      value={item.value}
                      key={item.value}
                    >
                      {item.label}
                    </Option>)
                }
              </Select>
            </div>

            <div className="search-item">
              <label>收件人</label>
              <Input
                className="u-search-item"
                value={searchParams.consignee}
                onChange={(e) => { this.onSearchParamsChange(e.target.value, 'consignee') }}
                placeholder="请输入"
              />
            </div>

            <div className="search-item">
              <label>商品信息</label>
              <Input
                className="u-search-item"
                value={searchParams.goodsInfo}
                onChange={(e) => { this.onSearchParamsChange(e.target.value, 'goodsInfo') }}
                placeholder="请输入"
              />
            </div>

            <div className="search-item">
              <label>下单时间</label>
              <RangePicker
                value={this.state.searchParams.date}
                allowClear
                className="u-search-item"
                onChange={(date, dateString) => { this.onSearchDateChange(date, dateString) }}
              />
            </div>

            <div className="search-item">
              <Button type="primary" onClick={this.onSearch} className="u-search" >搜索</Button>
              <Button onClick={this.onReset} className="u-reset">重置</Button>
            </div>
          </div>

          <div className="m-page-content">
            <div className="m-btn">
              <Dropdown
                overlay={menu}
                placement="bottomCenter"
                trigger={['click']}
              >
                <Button
                  className="u-reset"
                  type="primary"
                  ghost
                >
                  批量操作<DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={data}
              scroll={{ x: 2440, y: 500 }}
              rowSelection={{
                type: 'checkbox',
                onChange: this.onSelectChange,
                selectedRowKeys
              }}
              locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
              pagination={{
                showSizeChanger: true,
                onShowSizeChange: this.pageSizeChange,
                total: page.total,
                current: page.current,
                onChange: this.onPageChange,
                showTotal: (total, range) => `共有${total}条`,
                pageSize: page.pageSize
              }}
              className="m-table"
            />

          </div>


          <div className="m-modal">
            <Modal
              title="批量发货"
              visible={batchDeliverModal.visible}
              confirmLoading={batchDeliverModal.confirmLoading}
              onOk={this.onOkBatchDeliver}
              onCancel={this.onCancelBatchDeliver}
              width={560}
              wrapClassName="m-deliver-modal"
            >
              <Form {...formItemLayout} className="m-deliver-form">
                <FormItem label={<span><span className="s-red">*</span>发货方式</span>}>
                  <Select
                    value={batchDeliverForm.expressType}
                    defaultValue="物流"
                    onChange={(value) => this.onChangeBatchDeliverForm(value, 'expressType')}
                    placeholder="请选择"
                  >
                    <Option value="物流">物流</Option>
                    <Option value="非物流">非物流</Option>
                  </Select>
                </FormItem>
                {
                  batchDeliverForm.expressType === '物流'
                  &&
                  <div>
                    <FormItem label={<span><span className="s-red">*</span>物流公司</span>}>
                      <Select
                        value={batchDeliverForm.company}
                        onChange={(value) => this.onChangeBatchDeliverForm(value, 'company')}
                        placeholder="请输入"
                      >
                        {
                          companyMap.map((ele, index) => (
                            <Option value={ele} key={index}>{ele}</Option>
                          ))
                        }
                      </Select>
                      {
                        batchDeliverForm.company === '其他物流'
                        &&
                        <FormItem>
                          <Input
                            value={batchDeliverForm.otherCompany}
                            placeholder="请输入物流公司"
                            onChange={(event) => this.onChangeBatchDeliverForm(event.target.value, 'otherCompany')}
                          />
                        </FormItem>
                      }
                    </FormItem>
                    <FormItem label={<span><span className="s-red">*</span>物流单号</span>}>
                      <Input
                        value={batchDeliverForm.expressId}
                        placeholder="请输入"
                        onChange={(event) => this.onChangeBatchDeliverForm(event.target.value, 'expressId')}
                      />
                    </FormItem>
                  </div>
                }
                <FormItem label="发货备注：">
                  <TextArea
                    value={batchDeliverForm.remark}
                    placeholder="请输入"
                    onChange={(event) => this.onChangeBatchDeliverForm(event.target.value, 'remark')}
                  />
                </FormItem>
              </Form>
            </Modal>

            <Modal
              title="发货"
              visible={deliverModal.visible}
              onOk={this.onOkDeliver}
              onCancel={this.onCancelDeliver}
              width={455}
              wrapClassName="m-deliver-modal"
            >
              <Form {...formItemLayout} className="m-deliver-form">
                <FormItem label={<span className="u-label">商品品牌</span>} className="m-readonly-form">
                  <div className="u-readonly-value">{deliverForm.brand}</div>
                </FormItem>
                <FormItem label={<span className="u-label">商品名称</span>} className="m-readonly-form">
                  <div className="u-readonly-value">{deliverForm.name}</div>
                </FormItem>
                <FormItem label={<span className="u-label">属性</span>} className="m-readonly-form">
                  <div className="u-readonly-value">{deliverForm.property}</div>
                </FormItem>
                <FormItem label={<span>数量</span>}>
                  <InputNumber
                    value={deliverForm.num}
                    placeholder="请输入"
                    onChange={value => this.onChangeDeliverForm(value, 'num')}
                    min={1}
                    max={100000}
                  />
                </FormItem>
                {
                  orderExpressList && orderExpressList.length
                    ?
                    <FormItem label={<span><span className="s-red">*</span>收货人</span>}>
                      <Select
                        className="u-search-item"
                        value={deliverForm.IT_PURCHASE_index}
                        onChange={(value) => this.onChangeDeliverForm(value, 'IT_PURCHASE_index')}
                        placeholder="请选择"
                      >
                        {
                          orderExpressList.map((item, index) =>
                            <Option
                              value={index}
                              key={index}
                            >
                              {item.consignee}
                            </Option>)
                        }
                      </Select>
                    </FormItem>
                    :
                    null
                }

                {
                  orderExpressList && orderExpressList.length
                    ?
                    <FormItem label={<span className="u-label">收货地址</span>} className="m-readonly-form">
                      <div className="u-readonly-value">
                        { 
                          deliverForm.IT_PURCHASE_index || deliverForm.IT_PURCHASE_index === 0
                            ?
                            orderExpressList[deliverForm.IT_PURCHASE_index].address
                            :
                            null
                        }
                      </div>
                    </FormItem>
                    :
                    null
                }

                <FormItem label={<span><span className="s-red">*</span>发货方式</span>}>
                  <Select
                    value={deliverForm.expressType}
                    defaultValue="物流"
                    onChange={(value) => this.onChangeDeliverForm(value, 'expressType')}
                    placeholder="请选择"
                  >
                    <Option value="物流">物流</Option>
                    <Option value="非物流">非物流</Option>
                  </Select>
                </FormItem>
                {
                  deliverForm.expressType === '物流'
                  &&
                  <div>
                    <FormItem label={<span><span className="s-red">*</span>物流公司</span>}>
                      <Select
                        value={deliverForm.company}
                        onChange={(value) => this.onChangeDeliverForm(value, 'company')}
                        placeholder="请输入"
                      >
                        {
                          companyMap.map((ele, index) => (
                            <Option value={ele} key={index}>{ele}</Option>
                          ))
                        }
                      </Select>
                      {
                        deliverForm.company === '其他物流'
                        &&
                        <FormItem>
                          <Input
                            value={deliverForm.otherCompany}
                            placeholder="请输入物流公司"
                            onChange={(event) => this.onChangeDeliverForm(event.target.value, 'otherCompany')}
                          />
                        </FormItem>
                      }
                    </FormItem>
                    <FormItem label={<span><span className="s-red">*</span>物流单号</span>}>
                      <Input
                        value={deliverForm.expressId}
                        placeholder="请输入"
                        onChange={(event) => this.onChangeDeliverForm(event.target.value, 'expressId')}
                      />
                    </FormItem>
                  </div>
                }
                <FormItem label="发货备注：">
                  <TextArea
                    value={deliverForm.remark}
                    placeholder="请输入"
                    onChange={(event) => this.onChangeDeliverForm(event.target.value, 'remark')}
                  />
                </FormItem>
              </Form>
            </Modal>

            
          </div>
        </div>
      </Content>
    );
  }
}

export default function OrderPage(props) { return <Order {...props} />; }