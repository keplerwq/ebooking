

import React, { Component } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Table, Popconfirm, Radio, Checkbox, Popover } from 'antd';
import { ControlledForm } from 'src/components';
import 'antd/dist/antd.css';
import api from 'src/api';
import api_config from 'src/api/api-config'
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { ConfigProvider } from 'antd';
import './Detail.scss';
import moment from 'moment';
import editAccountDetail from './editAccountSetail';
import addItems from './addItems';
import UploadModal from "./uploadModal";


const formItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};
class AccountResourcesAdd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addDate: {
        billType: '',
        billTypeSubs: [],
        fileList: '',
      },
      id: '',
      list: [],
      addItems: {},
      flag: false,
      orderType: [],
      file: '',
      fileList: '',
      options: [],
      uploadSupplier: {
        visible: false,
        index: 0
      }
    };
  }
  componentDidMount() {
    this.getOrderType();
  }
  componentWillReceiveProps(props) {
  }

  getDetail = () => {//获取计费项
    const { addDate } = this.state;
    const params = {
      type: addDate.billType,
      typeSubs: addDate.billTypeSubs.join(',')
    }
    api.getIDCAccountAllItem(params).then((res) => {
      if (res.code === 0) {
        let list = res.msg.list;
        let options = res.msg.addItems;
        let deepList = JSON.parse(JSON.stringify(list))

        this.setTotal(list)

        // this.setState({ list: list, options: options, deepList: deepList })
        this.setState({ options, deepList })
      }
    });
  }
  getOrderType = () => { //获取账单类型
    api.getIDCAccountType().then((res) => {

      if (res.code === 0) {

        let list = res.msg.list.map(item => {
          return item
        })
        this.setState({ orderType: list },
          () => { console.log(list, this.state.orderType) })

      } else {
        this.setState({ orderType: [] })
      }
    });
  }
  handleTypeChange = (name, value) => {
    const { addDate } = this.state;
    if (name === 'checkbox') {
      this.setState({
        addDate: {
          ...addDate,
          billTypeSubs: value
        }
      }, () => this.getDetail());
    }
    if (name === 'radio') {
      this.setState({
        addDate: {
          ...addDate,
          billType: value,

        },
        flag: true
      }, () => this.getDetail());
    }
  }

  onDownloadAccount = () => {
    const { addDate } = this.state;
    window.open(`/supplier/Account/idc/getBillingTemplate.do?type=${addDate.billType}&typeSubs=${addDate.billTypeSubs.join(',')}`, '_blank');
  }
  //编辑
  onEditAccountDetail(record, index) {
    //新建账单的默认时间
    editAccountDetail(record, index, (values, index) => { this.handleEditAccountDetail(values, index) })
  }
  handleEditAccountDetail(values, index) {
    // const { list } = this.state;
    // values.billMonth = moment(values.billMonth).valueOf();
    // list[index] = values;
    // this.setState({
    //   list: [...list]
    // })

    // const { list } = this.state;
    const list = this.state.list.slice(0, this.state.list.length - 1)
    values.billMonth = moment(values.billMonth).valueOf();
    list[index] = values;
    // this.setState({
    //   list: [...list]
    // })
    this.setTotal(list)

  }
  //删除
  onArrayChildDel(index) {
    // const { list } = this.state;
    // const filter = list.filter((item, i) => index !== i)
    // this.setState({
    //   list: filter
    // }, () => {
    // })

    const list = this.state.list.slice(0, this.state.list.length - 1)
    const filter = list.filter((item, i) => index !== i)
    // this.setState({
    //   list: filter
    // })
    this.setTotal(filter)

  }
  onSubmit = () => {
    const { addDate } = this.state;

    const params = {
      billType: addDate.billType,
      billTypeSubs: addDate.billTypeSubs.join(','),
      filePath: (this.state.fileList && this.state.fileList.length) ? this.state.fileList[0].url : '',
      // list: this.state.list
      list: this.state.list.slice(0, this.state.list.length - 1)
    }

    api.getIDCAccountAddBill(params).then(res => {
      if (res.code == 0) {
        this.props.history.goBack();

      } else {
        return
      }

    })
  }
  onDraft = () => {
    const { addDate } = this.state;
    const params = {
      billType: addDate.billType,
      billTypeSubs: addDate.billTypeSubs.join(','),
      filePath: (this.state.fileList && this.state.fileList.length) ? this.state.fileList[0].url : '',
      // list: this.state.list
      list: this.state.list.slice(0, this.state.list.length - 1)
    }

    api.addBillingAsDraft(params).then(res => {
      if (res.code == 0) {
        this.props.history.goBack();
      }
    })
  }

  addShows = () => {
    const { addDate } = this.state;
    let type = addDate.billType;
    const { options } = this.state;
    let obj = {
      option: options,
      type: type
    }
    addItems(obj, (values, index) => { this.handleAddItems(values, index) })
  }
  handleAddItems = (values) => {
    const { deepList } = this.state;
    const list = this.state.list.slice(0, this.state.list.length - 1)
    let item2 = values.items[0] || '';
    let item3 = values.items[1] || '';
    let item4 = values.items[2] || '';
    let roomName = values.items[3]  || '';
    let temp = deepList.filter(item=>{
      return item.item2 === item2 && item.item3 === item3 && item.item4 === item4 && item.roomName === roomName
    })
    console.log(temp)
    if (temp.length) {
      list.push({...temp[0]})
      // this.setState({
      //   list: [...list]
      // })
      console.log(list)

      this.setTotal(list)

    }
  }
  handleOnChange = (info) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);

    fileList = fileList.map(file => {
      const { response = {} } = file
      const { msg = {} } = response
      if (msg && msg.url) {
        file.url = msg.url;
      }
      return file;
    });

    this.setState({
      fileList: fileList
    })
  }

  onuploadReviewFile = (res, index) => {
    const uploadSupplier = {
      visible: true,
      index,
      cloudSupplierFile: res.cloudSupplierFile,
      cloudSupplierFileName: res.cloudSupplierFileName
    }
    this.setState({
      uploadSupplier
    })
  }

  uploadOkClick = (res) => {
    if (res) {
      const { cloudSupplierFile, cloudSupplierFileName } = res
      const list = [...this.state.list];
      this.setState({
        list: list.map((item,index) => index === this.state.uploadSupplier.index ?
            {...item, cloudSupplierFile, cloudSupplierFileName} : item)
      });
    }
  }

  uploadCancel = () => {
    const uploadSupplier = {
      visible: false,
      index: 0,
      cloudSupplierFile: this.state.uploadSupplier.cloudSupplierFile,
      cloudSupplierFileName: this.state.uploadSupplier.cloudSupplierFileName
    }
    this.setState({
      uploadSupplier
    })
  }

  setTotal = (list) => {
    if (!list.length) {
      this.setState({
        list: []
      })
      return false
    }
    // 应收
    let applyAmount = 0
    // 实收
    let actualAmount = 0
    // 商务复核费用
    let reviewAmount = 0
    list.map(item => {
      applyAmount += item.applyAmount ? parseFloat(item.applyAmount) : 0
      actualAmount += item.actualAmount ? parseFloat(item.actualAmount) : 0
      reviewAmount += item.reviewAmount ? parseFloat(item.reviewAmount) : 0
    })
    list.push({
      itemId: '合计',
      applyAmount: this.setDigital(applyAmount).toFixed(2),
      actualAmount: this.setDigital(actualAmount).toFixed(2),
      reviewAmount: this.setDigital(reviewAmount).toFixed(2)
    })
    this.setState({list})
  }

  setDigital = (digital) => {
    if (isNaN(digital)) {
      return ''
    } else {
      return digital
    }
  }

  render() {
    const { orderType, list, addDate, flag, uploadSupplier } = this.state;
    const uploadProps = {
      action: api_config.getIDCAccountUpload.url,
      withCredentials: true,
      name: 'file',
      multiple: true,
      onChange: this.handleOnChange

    };
    //IDC类 海外资源
    const goodsColumns = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
      },
      {
        title: '供应商名称',
        dataIndex: 'supplierName',
        width: 180,
        align: 'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: '机房简称/专线名称',
        dataIndex: 'roomNameShort',
        width: 180,
        render: (text, record) => {
          if (record.privateLineName && record.roomNameShort) {
            return <div>{record.roomNameShort}/{record.privateLineName}</div>
          } else if (record.privateLineName) {
            return <div>{record.privateLineName}</div>
          } else if (record.roomNameShort) {
            return <div>{record.roomNameShort}</div>
          } else {
            return ''
          }
        }
      },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        width: 180,
      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        width: 130,
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        width: 130,
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }


      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return (
              <span>
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                      <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
          )
        }
      }
    ];
    //CDN
    const goodsColumns1 = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
      },
      {
        title: '供应商名称',
        dataIndex: 'supplierName',
        width: 180,
        align: 'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: addDate.billType === 'CDN' ? '服务内容' : '计费二级项目',
        dataIndex: 'item2',
        width: 180,
      },
      {
        title: addDate.billType === 'CDN' ? '服务内容细分' : '计费三级项目',
        dataIndex: 'item3',
        width: 130,
      },
      // {
      //   title: '计费四级项目',
      //   dataIndex: 'item4',
      //   width: 130,
      // },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return (
              <span>
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
          )
        }
      }
    ];
    //固网及文印、其他类
    const goodsColumns2 = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
      },
      {
        title: '供应商名称',
        dataIndex: 'supplierName',
        width: 180,
        align: 'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: '计费二级项目',
        dataIndex: 'item2',
        width: 130,
        align: 'center',
      },
      {
        title: '计费三级项目',
        dataIndex: 'item3',
        width: 130,
        align: 'center',
      },
      {
        title: '计费四级项目',
        dataIndex: 'item4',
        width: 130,
        align: 'center',
      },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return (
              <span>
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
          )
        }
      }
    ]

    //云服务
    const goodsColumns3 = [
      {
        title: '计费项ID',
        dataIndex: 'itemId',
        width: 130,
      },
      {
        title: '供应商名称',
        dataIndex: 'supplierName',
        width: 180,
        align: 'center',
        render:(text,record,index)=>{
          if (index === list.length - 1) {
            return ''
          }
          return <span>{record.supplierType}-{record.secondName}</span>
        }
      },
      {
        title: addDate.billType === 'CDN' ? '服务内容' : '计费二级项目',
        dataIndex: 'item2',
        width: 180,
      },
      {
        title: addDate.billType === 'CDN' ? '服务内容细分' : '计费三级项目',
        dataIndex: 'item3',
        width: 130,
      },
      // {
      //   title: '计费四级项目',
      //   dataIndex: 'item4',
      //   width: 130,
      // },
      {
        title: '含税单价',
        dataIndex: 'unitPrice',
        width: 130,
        onCell: () => {
          return {
            style: {
              maxWidth: 130,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        },
        render: (text, record) => {
          return <span><Popover content={record.unitPrice}>{record.unitPrice}</Popover></span>
        }

      },
      {
        title: '用量计费模式',
        dataIndex: 'model',
        width: 130,
      },
      {
        title: '价格单位',
        dataIndex: 'unit',
        width: 130,
      },
      {
        title: '币种',
        dataIndex: 'currency',
        width: 130,
      },
      {
        title: '使用月份',
        dataIndex: 'billMonth',
        width: 130,
        render: (text, record) => {
          if (!record.billMonth) return;
          const number = parseFloat(record.billMonth);
          return moment(number).format('YYYY-MM')
        }
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        width: 130,
      },
      {
        title: '计费天数',
        dataIndex: 'actualDay',
        width: 130,
      },
      {
        title: '当月总天数',
        dataIndex: 'totalDay',
        width: 130,
      },
      {
        title: '应收金额',
        dataIndex: 'applyAmount',
        width: 130,
      },
      {
        title: '实收金额',
        dataIndex: 'actualAmount',
        width: 130,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 130,
      },
      {
        title: '供应商附件',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return <span>
            <a onClick={() => {this.onuploadReviewFile(record, index)}}>{ text.cloudSupplierFile ? text.cloudSupplierFileName : '上传' }</a>
          </span>
        }
      },
      {
        title: '操作',
        fixed: 'right',
        width: 130,
        render: (text, record, index) => {
          if (index === list.length - 1) {
            return null
          }
          return (
              <span>
                <a onClick={() => { this.onEditAccountDetail(record, index) }}>编辑</a>&nbsp;
                <Popconfirm placement="top" title='确定删除该条目吗？' onConfirm={() => { this.onArrayChildDel(index) }} okText="确定" cancelText="取消">
                  <a>删除</a>
                </Popconfirm>
              </span>
          )
        }
      }
    ];

    /* 账单类型权限 */
    const IDC = orderType.find(item => item.name === 'IDC');
    const plainOptions = [];
    if (IDC) {
      IDC.child.forEach(item => {
        plainOptions.push(item.name)
      })
    }

    return (
      <ConfigProvider locale={zhCN}>
        <ControlledForm
          onValidate={(status) => {
            this.setState({ formValidate: status });
          }}
          ref={(f) => { this.form = f }}
          itemProps={formItemLayout}
          value={addDate}
          onChange={this.onFormChange}
          className="m-add-remark"
        >
          <div className="g-account-res-detail">
            <section className="m-section">
              <div className="m-title">
                <div className="m-title-icon"></div>
                <span className="u-title">账单类型</span>
              </div>
              <div style={{ margin: '10px' }}>
                <Radio.Group value={addDate.billType} onChange={(e) => this.handleTypeChange('radio', e.target.value)} >
                  {orderType.map((item, index) => (
                    <Radio value={item.name} key={index} >{item.name}</Radio>
                  ))}
                </Radio.Group>
              </div>
              {
                plainOptions.length > 0 && addDate.billType === 'IDC' ?
                  <div style={{ margin: '10px' }}>
                    <Checkbox.Group value={addDate.billTypeSubs} options={plainOptions} onChange={(value) => this.handleTypeChange('checkbox', value)} />
                  </div>
                  :
                  null
              }
            </section >
            {
              flag ?
                <div>
                  <section className="m-section">
                    <div className="m-title">
                      <div className="m-title-icon"></div>
                      <span className="u-title">账单详情</span>
                      <span style={{ cssFloat: 'right' }}><Button onClick={() => this.addShows()}>新增</Button></span>
                    </div>
                    <Table
                      rowKey="brand"
                      columns={addDate.billType === 'IDC' ||
                        addDate.billType === '海外资源' ? goodsColumns :
                        addDate.billType === 'CDN' ? goodsColumns1 :
                        addDate.billType === '云服务' ? goodsColumns3 : goodsColumns2}
                      dataSource={list}
                      locale={{ emptyText: '当前列表无数据' }}
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                    />
                  </section>
                  <section className="m-section">
                    <div className="m-title">
                      <div className="m-title-icon"></div>
                      <span className="u-title">账单资料</span>
                    </div>
                    <div>

                      <div style={{ margin: '15px 0' }}>
                        <div style={{ margin: '10px' }}>

                          <Upload
                            {...uploadProps}
                            fileList={this.state.fileList ? this.state.fileList : []}
                            style={{ textAlign: 'center' }}>
                            <div className="u-upload-block">
                              <Button ><UploadOutlined /> 上传文件</Button>
                              <span style={{ fontSize: '10px' }}></span>
                            </div>
                          </Upload>

                        </div>
                      </div>
                    </div>
                  </section>
                  <div className="m-operation" >
                    <Button onClick={() => { this.props.history.goBack(); }}>返回</Button>
                    <Button type="primary"
                      onClick={() => this.onSubmit()}
                    >提交</Button>
                    <Button type="primary"
                      onClick={() => this.onDraft()}
                    >存为草稿</Button>

                  </div>
                </div>
                : ''
            }

            <UploadModal
                uploadSupplier={uploadSupplier}
                uploadOkClick={this.uploadOkClick.bind(this)}
                uploadCancel={this.uploadCancel.bind(this)}
            />

          </div>
        </ControlledForm>

      </ConfigProvider>
    );
  }
}

export default function AccountResourcesAddPage(props) { return <AccountResourcesAdd {...props} />; }
