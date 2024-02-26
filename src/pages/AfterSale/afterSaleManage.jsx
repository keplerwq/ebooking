/**
 * @file  售后管理
 * @author yangfan03@corp.netease.com
 * 
 */

import React, { Component } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Radio } from 'antd';
import { ModalEx, message, ControlledForm } from 'src/components';
import api from 'src/api';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { StateIcon } from 'src/containers';
import { descriptor } from 'src/libs';


const FormItem = ControlledForm.Item;
const RadioGroup = Radio.Group;

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 18 },
  },
};

const showDic = {
  WAIT_APPROVE: ["approve"],
  WAIT_CANCEL: ["address", "express"],
  WAIT_RECEIVE: ["address", "express"],
  FINISH_ASS: [],
  REFUSE_ASS: ["refuseReason"],
};

class AfterSaleManage extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = props;

    this.state = {
      formValidate: false,
      loading: false,
      data,
      detail: {
        property: [],
      },
      addData: {
        send: true,
        pass: true,
        sid: data.sid
      },
      auth: [],
      stateList: [] //状态信息
    }
  }


  componentDidMount() {
    const { sid } = this.state.data;
    let { addData } = this.state;
    api.getAfterSaleDetail({ sid }).then((res) => {
      if (res.code === 0) {
        let detail = { ...res.msg, ...res.msg.list }
        let auth = res.msg.auth || [];
        detail.property = detail.property === "[]" ? [] : JSON.parse(detail.property);
        addData = { address: detail.address, consignee: detail.consignee, phone: detail.phone, ...addData }
        this.setState({
          detail: detail || {},
          auth: auth,
          addData
        });
      } else {
        this.message.error(res.msg)
      }

    });

    api.getAfterSaleStates({ sid }).then((res) => {
      const { list = [] } = res.msg;
      if (res.code === 0) {
        this.setState({
          stateList: list || []
        });
      }
      else {
        this.message.error(res.msg)
      }
    });
  }


  onClose = () => {
    this.props.modal.close();
  }


  onSubmit = (values) => {
    const { callback, data } = this.props;
    this.setState({ loading: true });
    const { auth } = this.state;
    if (auth.indexOf('confirm') > -1) {
      let params = {
        ...values,
      };
      api.approveAfterSale(params).then(res => {
        this.setState({ loading: false });
        if (res.code === 0) {
          callback && callback();
          this.onClose();
          message.success('操作成功!');
        } else {
          message.error(res.msg);
        }
      }).catch(() => {
        this.setState({ loading: false });
      })
    } else if (auth.indexOf('receive') > -1) {
      api.confirmReceiptAfterSale({ sid: data.sid }).then(res => {
        this.setState({ loading: false });
        if (res.code === 0) {
          callback && callback();
          this.onClose();
          message.success('操作成功!');
        } else {
          message.error(res.msg);
        }
      }).catch(() => {
        this.setState({ loading: false });
      })
    }

  }

  onFormChange = (values, key, v) => {
    this.setState({ addData: values });
  }

  isShow = (infoType) => {
    const { state } = this.state.detail;
    return state &&
      showDic[state].indexOf(infoType) == -1 ? false : true;
  }

  render() {
    const { addData, loading, detail, auth, stateList } = this.state;
    const operationDic = {
      confirm: '确认',
      receive: '确认收货'
    };

    const nameMap = {
      submit: "提交申请",
      approve: "审核",
      message: "填写退货信息",
      received: "确认收货",
      check: "对账确认",
      finish: "售后完成",
      reject: "驳回",
      cancel: "取消售后"
    };
    const statusMap = {
      pass: {
        icon: "check",
        type: "ghost-blue",
        lineColor: "blue",
        textColor: "gray"
      },
      arrived: {
        icon: "",
        type: "ghost-blue",
        lineColor: "gray",
        textColor: "blue"
      },
      unarrived: {
        icon: "",
        type: "ghost-gray",
        lineColor: "gray",
        textColor: "gray"
      },
      refuse: {
        icon: "close",
        type: "ghost-red",
        lineColor: "gray",
        textColor: "gray"
      },
      skip: {
        icon: "minus",
        type: "ghost-gray",
        lineColor: "blue",
        textColor: "gray"
      }
    };
    let showStateList = stateList.map((elem, index) => {
      let status = {
        step:
          elem.status === "arrived" || elem.status === "unarrived"
            ? index + 1
            : "",
        text: nameMap[elem.name],
        type: statusMap[elem.status].type,
        icon: statusMap[elem.status].icon,
        lineColor: statusMap[elem.status].lineColor,
        textColor: statusMap[elem.status].textColor,
        showLine: index == stateList.length - 1 ? false : true
      };
      return status;
    });

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          ref={(f) => { this.form = f }}
          onSubmit={this.onSubmit}
          itemProps={formItemLayout}
          value={addData}
          onChange={this.onFormChange}
          className="m-aftersale-manage"
        >
          {
            this.isShow('refuseReason') ?
              <section>
                <div className="m-refuse">
                  驳回理由：{detail.refusereason}
                </div>
              </section> : ''}

          <section className="m-section-status">
            <div className="m-status">
              {
                showStateList.map((status, index) => {
                  return <StateIcon status={status} key={index}></StateIcon>
                })
              }
            </div>
          </section>

          <section>
            <div>
              <div className="u-title">订单信息</div>
              <FormItem
                label={'订单号'}
                dataIndex="sid"
                className="u-label-show"
                decorator={
                  <span>{detail.sid}</span>
                }
              />
              <FormItem
                label={'商品名称'}
                dataIndex="name"
                className="u-label-show"
                decorator={
                  <span>{detail.name}</span>
                }
              />
              <FormItem
                label={'商品属性'}
                dataIndex="property"
                className="u-label-show"
                decorator={
                  detail.property.length > 0 ?
                    <div>{detail.property.map((elem, index) => {
                      return `${elem.propertyName}：${elem.propertyValue}`
                    }).join('；')}
                    </div> : ''
                }
              />
            </div>
          </section>

          <section>
            <div>
              <div className="u-title">退货信息</div>
              <FormItem
                label={'退货原因'}
                dataIndex="reason"
                className="u-label-show"
                decorator={
                  <span>{detail.reason}</span>
                }
              />
              <FormItem
                label={'退货说明'}
                dataIndex="explained"
                className="u-label-show"
                decorator={
                  <span>{detail.explained}</span>
                }
              />
            </div>
          </section>

          {
            this.isShow('address') || detail.expressis ?
              <section>
                <div>
                  <div className="u-title">退货地址</div>
                  <FormItem
                    label={'退货地址'}
                    dataIndex="address"
                    className="u-label-show"
                    decorator={
                      <span>{detail.address}</span>
                    }
                  />
                  <FormItem
                    label={'收件人'}
                    dataIndex="consignee"
                    className="u-label-show"
                    decorator={
                      <span>{detail.consignee}</span>
                    }
                  />
                  <FormItem
                    label={'联系电话'}
                    dataIndex="phone"
                    className="u-label-show"
                    decorator={
                      <span>{detail.phone}</span>
                    }
                  />
                </div>
              </section> : ''}

          {
            this.isShow('express') || detail.expressis ? <section>
              <div>
                <div className="u-title">退货物流</div>
                <FormItem
                  label={'物流公司'}
                  dataIndex="company"
                  className="u-label-show"
                  decorator={
                    <span>{detail.company}</span>
                  }
                />
                <FormItem
                  label={'物流单号'}
                  dataIndex="expressid"
                  className="u-label-show"
                  decorator={
                    <span>{detail.expressid}</span>
                  }
                />
              </div>
            </section> : ''}
          {
            auth.indexOf('receive') > -1 ?
              <div className="m-attention">
                <ExclamationCircleOutlined className="u-attention-icon" />
                <span>请注意查收，签收后7天内未确认收货，系统默认为已收货</span>
              </div> : ''}

          {
            this.isShow('approve') ? <section>
              <div>
                <div className="u-title">售后审核</div>
                <FormItem
                  label={'审核结果'}
                  dataIndex="pass"
                  className="u-label-show"
                  decorator={
                    <RadioGroup>
                      <Radio value={true}>通过</Radio>
                      <Radio value={false}>不通过</Radio>
                    </RadioGroup>
                  }
                />
                {addData.pass ?
                  <FormItem
                    label={'是否寄回商品'}
                    dataIndex="send"
                    className="u-label-show"
                    decorator={
                      <RadioGroup>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                      </RadioGroup>
                    }
                  />
                  : ''}
                {addData.send && addData.pass ?
                  <div>
                    <FormItem
                      label={'收货地址'}
                      dataIndex="address"
                      required
                      decorator={
                        <Input maxLength={50} />
                      }
                    />
                    <FormItem
                      label={'收货人'}
                      dataIndex="consignee"
                      required
                      decorator={
                        <Input maxLength={20} />
                      }
                    />
                    <FormItem
                      label={'收货电话'}
                      dataIndex="phone"
                      required
                      rules={[{ required: true, message: '请输入收货电话' }, descriptor.telOrPhone]}
                      decorator={
                        <Input />
                      }
                    />
                  </div> : ''}

                {!addData.pass ? <FormItem
                  label={'审核说明'}
                  dataIndex="refusereason"
                  required
                  rules={[
                    { max: 50, message: '最多输入50个字' },
                  ]}
                  decorator={
                    <TextArea placeholder="请输入" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={50} />
                  }
                /> : ''}
              </div>
            </section> : ''}
          {
            auth.length > 0 ? <div className="ant-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
              <Button onClick={this.onClose}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>{operationDic[detail.auth[0]]}</Button>
            </div> : ''
          }

        </ControlledForm>
      </ConfigProvider>
    );
  }
}


export default function afterSaleManage(data = {}, callback) {
  const title = `售后管理`;
  ModalEx.confirm({
    title,
    content: <AfterSaleManage data={data} callback={callback} />,
    width: 560,
    footer: null,
  });
}