

import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { message } from 'src/components';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Row, Col, InputNumber, Modal, Select, Table } from 'antd';
import api from 'src/api';
import './Detail.scss';
const FormItem = Form.Item;
const Option = Select.Option;

class OrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderInfo: {},
      goodsArray: [],
      expressList: [],
      remarkList: [],
      type: 'detail',
      id: 0,
      sid: 0,
      expressInfo: {},
      updateHuiExpressIdModal: {
        visible: false,
        confirmLoading: false,
      },
      huiExpressIdForm: {
        id: '',
        expressId: '',
      },
    };
  }


  componentDidMount() {
    let query = this.props.match.params;
    let { id, sid, type } = query;
    // let id = '176';
    // let type = 'delivery';
    id = parseInt(id);
    this.setState({ type, id, sid });
    this.getDetail(sid);
    this.getRemarkList(sid, 'ORDER');
  }

  componentWillReceiveProps(props) {
  }

  getDetail = (id) => {
    api.queryOrderDetail({ sid: id }).then((res) => {
      if (res.code === 0) {
        let goodsArray = [];
        let { orderInfo, goodsInfo, expressList } = res.msg;
        goodsArray.push(goodsInfo);
        if (expressList.length > 0) {
          this.setState({ expressInfo: Object.assign({}, expressList[0]) });
        }
        this.setState({ goodsArray, orderInfo, expressList });
      }
    });
  }

  getStateList = () => {
    api.queryOrderStateList().then((res) => {
      if (res.code === 0) {
        let list = Object.keys(res.msg).map(elem => {
          return {
            value: elem,
            label: res.msg[elem]
          }
        });
        this.setState({ stateList: list, })
      }
    });
  }


  getRemarkList = (sid, type) => {
    api.queryOrderRemarkList({ sid, type }).then((res) => {
      if (res.code === 0) {
        let list = res.msg.list || [];
        this.setState({ remarkList: list })
      }
    });
  }

  goBack = () => {
    this.props.history.push({
      pathname: '/order',
    })
  }

  onRowChange = (value, dataIndex, index) => {
    const expressList = this.state.expressList;
    const target = expressList[index];
    if (target) {
      target[dataIndex] = value;
      this.setState({ expressList });
    }
  }

  onDelivery = () => {
    let { expressList, sid } = this.state;
    if (expressList.length === 0) {
      message.error('请添加物流信息!', 3);
      return;
    }

    for (let i in expressList) {
      if (expressList[i].expressType !== '物流' && expressList[i].expressType !== '非物流') {
        message.error('请选择发货方式!', 3);
        return;
      }
      if (expressList[i].expressType === '物流' && (!expressList[i].expressId || !expressList[i].company || !expressList[i].num)) {
        message.error('发货方式为物流时,物流单号,物流公司,发货数量必填!', 3);
        return;
      } else if (expressList[i].expressType === '非物流' && !expressList[i].num) {
        message.error('发货方式为非物流时,发货数量必填!', 3);
        return;
      }
    }

    api.deliveryOrder({ sid: sid, expressList }).then((res) => {
      if (res.code === 0) {
        message.success('发货成功', 3)
        this.goBack();
      }
    });
  }

  addExpress = () => {
    let { expressList, expressInfo } = this.state;

    let newExpress = Object.keys(expressInfo).length && expressInfo.id === '' > 0 ? Object.assign({}, expressInfo) : {
      consignee: expressInfo.consignee,
      phone: expressInfo.phone,
      address: expressInfo.address,
      company: '',
      expressId: '',
      expressState: '待发货',
      expressType: '物流',
      num: 1,
      remark: '',
      id: ''
    }
    expressList.push(newExpress);
    this.setState({ expressList });
  }

  deleteExpress = (index) => {
    let { expressList } = this.state;
    expressList.splice(index, 1);
    this.setState({ expressList });
  }

  onChangeHuiExpressIdForm = (value) => {
    const huiExpressIdForm = Object.assign({}, this.state.huiExpressIdForm, { 'expressId': value });
    this.setState({ huiExpressIdForm });
  };

  // 修改内购物流单号
  onChangeHuiExpressId = (record) => {
    this.setState({
      updateHuiExpressIdModal: {
        visible: true,
        confirmLoading: false,
      }
    });
    this.setState({
      huiExpressIdForm: {
        id: record.id,
        expressId: record.expressId,
      }
    })
  };

  onUpdateHuiExpressId = () => {
    const { huiExpressIdForm } = this.state;
    const params = {
      id: huiExpressIdForm.id,
      newExpressId: huiExpressIdForm.expressId,
    };
    api.updateHuiExpressId(params).then((res) => {
      if (res.code === 0) {
        let query = this.props.match.params;
        let { sid } = query;
        this.getDetail(sid);
        this.setState({
          updateHuiExpressIdModal: {
            visible: false,
            confirmLoading: false
          }
        });
        message.success('物流单号修改成功');
      };
    });
  };

  onCancelUpdateHuiExpressId = () => {
    this.setState({
      updateHuiExpressIdModal: {
        visible: false,
        confirmLoading: false,
      }
    })
  };

  render() {

    const span1 = 8;
    const span2 = 8;
    const span3 = 8;
    const leftSpan1 = 6;
    const rightSpan1 = 17;
    const leftSpan2 = 6;
    const rightSpan2 = 17;
    const leftSpan3 = 6;
    const rightSpan3 = 17;
    const gutter = 16;
    const stateMap = {
      WAIT_DELIVER: '待发货',
      PART_DELIVERED: '部分发货',
      DELIVERED: '已发货',
      PART_RECEIVED: '部分签收',
      RECEIVED: '已签收',
      CANCELED: '已取消',
      ASS: "售后"
    };

    const deliveryTypeList = ['物流', '非物流'];

    const goodsColumns = [{
      title: '商品类目',
      dataIndex: 'cat',
      width: 180,
    }, {
      title: '商品品牌',
      dataIndex: 'brand',
      width: 130,
    }, {
      title: '商品名称',
      dataIndex: 'name',
      width: 130,
    }, {
      title: '商品属性',
      dataIndex: 'property',
      width: 180,
      render: (text, record, index) => {
        if (orderInfo.orderType === 'HUI_SHOP') {
          if (record.property !== '[]') {
            let propertys = JSON.parse(record.property);
            return <div>{propertys.map((pro, index) => {
              return <p key={index}>{pro.propertyName}：{pro.propertyValue}</p>;
            })}
            </div>
          } else {
            return '';
          }
        } else {
          return text;
        }
      }
    }, {
      title: 'SKU主图',
      dataIndex: 'imgSkuList',
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
      title: '商家商品编码',
      dataIndex: 'supplierCode',
      width: 180,
    }, {
      title: '数量',
      dataIndex: 'num',
      width: 130,
    }, {
      title: '未税单价',
      dataIndex: 'unTaxPrice',
      width: 130,
    }, {
      title: '含税单价',
      dataIndex: 'price',
      width: 130,
    }, {
      title: '未税总价',
      dataIndex: 'unTaxTotalPrice',
      width: 130,
    }, {
      title: '含税总价',
      dataIndex: 'totalPrice',
      width: 130,
    }, {
      title: '保修信息',
      dataIndex: 'guarantee',
      width: 130,
    },];

    const expressColumns =
      [{

        title: '收货人',
        dataIndex: 'consignee',
        width: 130,
      }, {
        title: '联系电话',
        dataIndex: 'phone',
        width: 130,
      }, {
        title: '收货地址',
        dataIndex: 'address',
        width: 130,
      }, {
        title: '发货方式',
        dataIndex: 'expressType',
        width: 180,
        render: (text, record, index) => {
          if (type === 'delivery' && orderInfo.orderType === 'HUI_SHOP') {
            return <Select value={text} style={{ width: '130px' }} onChange={(value) => this.onRowChange(value, 'expressType', index)} allowClear>
              {deliveryTypeList.map(item => <Option value={item} key={item}>{item}</Option>)}
            </Select>
          } else {
            return text;
          }
        }
      }, {
        title: '物流公司',
        dataIndex: 'company',
        width: 130,
        render: (text, record, index) => {
          if (type === 'delivery') {
            return <Input value={text} onChange={e => this.onRowChange(e.target.value, 'company', index)} />
          } else {
            return <span>{text}</span>;
          }
        }
      }, {
        title: '物流单号',
        dataIndex: 'expressId',
        width: 180,
        render: (text, record, index) => {
          if (type === 'delivery') {
            return <Input value={text} onChange={e => this.onRowChange(e.target.value, 'expressId', index)} />
          } else {
            return <span>{text}</span>;
          }
        }
      }, {
        title: '发货数量',
        dataIndex: 'num',
        width: 130,
        render: (text, record, index) => {
          if (type === 'delivery') {
            // let num = text ? text : this.state.orderInfo.num;
            return <InputNumber value={text} onChange={value => this.onRowChange(value, 'num', index)} min={1} max={100000} defaultValue={this.state.orderInfo.num} />
          } else {
            return <span>{text}</span>;
          }
        }
      }, {
        title: '发货状态',
        dataIndex: 'expressState',
        width: 130,
        render: (text, record) => {
          return <span>{text}</span>;
        }
      }, {
        title: '发货备注',
        dataIndex: 'remark',
        width: 130,
        render: (text, record, index) => {
          if (type === 'delivery') {
            return <Input value={text} onChange={e => this.onRowChange(e.target.value, 'remark', index)} />
          } else {
            return <span>{text}</span>;
          }
        }
      }, {
        title: '发货时间',
        dataIndex: 'expressTime',
        width: 130
      },
      {
        title: '操作',
        width: 130,
        render: (text, record) => {
          return renderOperation(record);
        }
      }
      ];


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

    const { orderInfo, expressList, goodsArray, remarkList, type, updateHuiExpressIdModal, huiExpressIdForm } = this.state;
    const stateShow = stateMap[orderInfo.state];
    const searchParams = this.props.location.query;
    const page = this.props.location.page
    /* searchParams，page为进入订单详情页时的搜索参数与分页器页数 */
    // const date = {
    //   "pathname" : "/order",
    //   "query": searchParams,
    //   "page": page
    // }

    const renderOperation = (record) => {
      if (orderInfo.state === 'DELIVERED' && orderInfo.orderType === 'HUI_SHOP'
        && record.expressType === '物流') {
        return (
          < a className="u-operation" onClick={() => this.onChangeHuiExpressId(record)}>修改物流单号</a>
        )
      }
    };

    const orderTypeMap = {
      'HUI_SHOP': '内购',
      'IT_PURCHASE': '集团采购',
      'QUANYI_MALL': '白金卡商城',
    }

    const remarkRow =
         remarkList.length > 0 ? remarkList.map((elem, index) => {
           return <div className="m-remark" key={index}>
             <span className="u-title">{elem.state}</span>
             <span className="u-time">{elem.createTime}</span>
             <span className="u-remark">{elem.remark}</span>
           </div>
         }) : <p>暂无</p>

    function renderRow(label, value, leftSpan=leftSpan1, rightSpan=rightSpan1) {
      return (
        <Row>
          <Col className="m-order-label" span={leftSpan}>{label}</Col>
          <Col span={rightSpan} offset={1}>{value}</Col>
        </Row>
      )
    }
    return (
      <div className="g-order-detail">
        {/* <div className="m-header">
          <Button size="small" icon="left" className="u-btn" onClick={this.goBack}></Button><span className="u-header">订单管理详情</span>
        </div> */}
        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">订单信息</span>
          </div>
          <div className="m-order-info">

            <Row className="m-order-row" gutter={gutter}>
              <Col span={span1}>
                <Row>
                  <Col className="m-order-label" span={leftSpan1}>订单ID：</Col>
                  <Col span={rightSpan1} offset={1}>
                    {orderInfo.sid}
                  </Col>
                </Row>
              </Col>
              <Col span={span2}>
                <Row>
                  <Col className="m-order-label" span={leftSpan2}>{(orderInfo.orderType === "HUI_SHOP") ? "订单状态：" : "订单来源ID："}</Col>
                  <Col span={rightSpan2} offset={1}>
                    {(orderInfo.orderType === "HUI_SHOP") ? stateShow : orderInfo.oid}
                  </Col>
                </Row>
              </Col>
              <Col span={span3}>
                <Row>
                  <Col className="m-order-label" span={leftSpan3}>订单总金额(含税)：</Col>
                  <Col span={rightSpan3} offset={1}>
                    {`${goodsArray[0] && goodsArray[0].totalPrice}${goodsArray[0] && goodsArray[0].unit}`}
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="m-order-row" gutter={gutter}>
              <Col span={span1}>
                <Row>
                  <Col className="m-order-label" span={leftSpan1}>发票类型：</Col>
                  <Col span={rightSpan1} offset={1}>
                    {orderInfo.invoiceType}
                  </Col>
                </Row>
              </Col>
              <Col span={span2}>
                <Row>
                  <Col className="m-order-label" span={leftSpan2}>订单来源：</Col>
                  <Col span={rightSpan2} offset="1"> 
                    {orderTypeMap[orderInfo.orderType] || ''}
                  </Col>
                </Row>
              </Col>
              <Col span={span3}>
                <Row>
                  <Col className="m-order-label" span={leftSpan3}>订单总金额(未税)：</Col>
                  <Col span={rightSpan3} offset={1}>
                    {`${goodsArray[0] && goodsArray[0].unTaxTotalPrice}${goodsArray[0] && goodsArray[0].unit}`}
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="m-order-row" gutter={gutter}>
              <Col span={span1}>
                <Row>
                  <Col className="m-order-label" span={leftSpan1}>发票抬头：</Col>

                  <Col span={rightSpan1} offset={1}> {orderInfo.header}
                  </Col>
                </Row>
              </Col>
              <Col span={span2}>
                <Row>
                  <Col className="m-order-label" span={leftSpan2}>下单时间：</Col>
                  <Col span={rightSpan2} offset={1}> {orderInfo && orderInfo.orderTime}
                  </Col>
                </Row>
              </Col>
              <Col span={span3}>
                {
                  (orderInfo.orderType === "HUI_SHOP") ? renderRow('备注：', remarkRow, leftSpan3, rightSpan3) : 
                    renderRow('订单状态：', stateShow, leftSpan3, rightSpan3)
                }
              </Col>
            </Row>

            {
              (orderInfo.orderType === "HUI_SHOP") ? null : (
                <Row className="m-order-row" gutter={gutter}>
                  <Col span={span1}>{ renderRow('备注：', remarkRow) }</Col>
                </Row>)
            }

          </div >
        </section >

        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">商品信息</span>
          </div>

          <Table
            rowKey="brand"
            columns={goodsColumns}
            dataSource={goodsArray}
            scroll={{ x: 1950, y: 500 }}
            locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
            pagination={false}
          />
        </section>

        {/* <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">备注</span>
          </div>
          {
            remarkList.length > 0 ? remarkList.map((elem, index) => {
              return <div className="m-remark" key={index}>
                <span className="u-title">{elem.state}</span>
                <span className="u-time">{elem.createTime}</span>
                <span className="u-remark">{elem.remark}</span>
              </div>
            }) : <p className="m-remark">暂无</p>
          }

        </section> */}

        <section className="m-section">
          <div className="m-title">
            <div className="m-title-icon"></div>
            <span className="u-title">物流信息</span>
            {orderInfo.orderType === 'IT_PURCHASE' && type === 'delivery' ? <a className="u-add" onClick={this.addExpress}><PlusOutlined />新增物流信息</a> : ''}
          </div>
          <Table
            rowKey="index"
            columns={expressColumns}
            dataSource={expressList}
            scroll={{ x: 1950, y: 500 }}
            locale={{ emptyText: '当前条件无结果，请检查筛选项' }}
            pagination={false}
          />

        </section>
        <div className="m-operation" >
          <Button onClick={() => { this.props.history.goBack(); }}>返回</Button>
          {type === 'delivery' ? <Button type="primary" onClick={this.onDelivery}>发货</Button> : ''}

        </div>

        <Modal
          title="修改物流单号"
          visible={updateHuiExpressIdModal.visible}
          onOk={this.onUpdateHuiExpressId}
          onCancel={this.onCancelUpdateHuiExpressId}
          width={455}
          wrapClassName="m-update-hui-express-id-modal"
        >
          <Form {...formItemLayout} className="m-deliver-form">
            <FormItem label={<span><span className="s-red">*</span>物流单号</span>}>
              <Input
                value={huiExpressIdForm.expressId}
                placeholder="请输入"
                onChange={(event) => this.onChangeHuiExpressIdForm(event.target.value)}
              />
            </FormItem>
          </Form>
        </Modal>
      </div >
    );
  }
}

const mapStateToProps = () => ({})

const OrderDetailWithConnect = connect(mapStateToProps, dispatchs('app'))(OrderDetail)

export default function OrderDetailWithConnectPage(props) { return <OrderDetailWithConnect {...props} />; }