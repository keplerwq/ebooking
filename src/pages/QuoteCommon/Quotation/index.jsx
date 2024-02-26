import React, {useState, useEffect, useMemo} from 'react';
import {useParams} from "react-router-dom";
import {Table, Form, Select,Divider, Input, DatePicker, Button, Affix, message, InputNumber} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import {
  supplyAmountUnitList,
  warrantyOptionList,
  periodUnitList,
} from './options';
import moment from 'moment';
import {TableComplexItem, Card} from '../';
import {asyncActions} from '../reduxJs';
import style from './style.module.scss';

const {Option} = Select;

const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    span: 16, offset: 6
  },
};

function selectorEnhancer(props) {

  const {value, defaultValue, options = [], width = '100%', noWrap = false, name, disabled, showSearch = false} = props;

  const Dom = (
    <Select
      showSearch={showSearch}
      disabled={disabled}
      placeholder='请选择'
      value={value}
      defaultValue={defaultValue}
      style={{ width }}>
      {
        options.map(item => (<Option value={item.value} key={item.value}>{item.label}</Option>))
      }
    </Select>
  )

  if (noWrap) return Dom
  
  return (
    <Form.Item name={name} noStyle>
      {Dom}
    </Form.Item>
  );
}

let updateSumHandlerTimeout = 0;

export default function QuoteCommonDetail (props) {
  const { enquiryTaskCode, enquiryCode } = useParams();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const state = useSelector(state => state.quoteCommon);
  const { companyName } = useSelector(state => state.app?.userInfo?.company);
  const { email: companyEmail } = useSelector(state => state.app?.userInfo?.emailAccount);
  const {quoteDetails} = state;
  const [sum, setSum] = useState({
    taxIncludedPrice: '0.00',
    totalTaxIncludedPrice: '0.00',
    taxExcludedPrice: '0.00',
    totalTaxExcludedPrice: '0.00',
  });
  const [taxList, setTaxList] = useState([
    {
      "label": "1.16",
      "value": "1.16"
    },
    {
      "label": "1.15",
      "value": "1.15"
    },
    {
      "label": "1.13",
      "value": "1.13"
    },
    {
      "label": "1.10",
      "value": "1.10"
    },
    {
      "label": "1.09",
      "value": "1.09"
    },
    {
      "label": "1.08",
      "value": "1.08"
    },
    {
      "label": "1.06",
      "value": "1.06"
    },
    {
      "label": "1.03",
      "value": "1.03"
    },
    {
      "label": "1.01",
      "value": "1.01"
    },
    {
      "label": "1",
      "value": "1"
    }
  ])
  const [name, setName ] = useState('')
  const updateSumHandler = () => {

    clearTimeout(updateSumHandlerTimeout);

    updateSumHandlerTimeout = setTimeout(() => {
      const taxIncludedPrice = parseFloat(form.getFieldValue('taxIncludedPrice')) || 0;
      const tax = parseFloat(form.getFieldValue('tax'));
      const supplyAmount = parseFloat(form.getFieldValue('supplyAmount')) || 0;
      const currency = form.getFieldValue('currency')
      const totalTaxIncludedPrice = (((taxIncludedPrice * 100) * (supplyAmount * 100)) / 100 / 100);
      const taxExcludedPrice = taxIncludedPrice / tax;
      // const totalTaxExcludedPrice = (totalTaxIncludedPrice / tax);
      const taxExcludedPriceShow = (currency==='韩元' || currency === '日圆') ? taxExcludedPrice?.toFixed(0) :taxExcludedPrice?.toFixed(2)

      const newSum = {
        taxIncludedPrice: taxIncludedPrice?.toFixed?.(2),
        totalTaxIncludedPrice: totalTaxIncludedPrice?.toFixed?.(2),
        taxExcludedPrice: (currency==='韩元' || currency === '日圆') ? taxExcludedPrice?.toFixed(0) :taxExcludedPrice?.toFixed(2),
        // totalTaxExcludedPrice: (currency==='韩元' || currency === '日圆') ? totalTaxExcludedPrice?.toFixed(0) :totalTaxExcludedPrice?.toFixed(2),
        totalTaxExcludedPrice: (currency==='韩元' || currency === '日圆') ? (taxExcludedPriceShow * supplyAmount).toFixed(0) : (taxExcludedPriceShow * supplyAmount).toFixed(2)
      }
      setSum(newSum)
    }, 300);
  }

  // 取最新一次询价信息
  const {info = {}, restHistoryList = []} = useMemo(() => {
    const info = {}
    const restHistoryList = []
    quoteDetails?.historyList?.forEach(el => {
      if (el.enquiryCode === enquiryCode) {
        Object.assign(info, el)
      } else {
        restHistoryList.push(el)
      }
    })

    return {info, restHistoryList}
  }, [enquiryCode, quoteDetails?.historyList])

  useEffect(() => {
    dispatch(asyncActions.getHistoryQuote({enquiryTaskCode, enquiryCode}))
    dispatch(asyncActions.getCurrencyList())
    dispatch(asyncActions.getBrandList())
  }, [dispatch, enquiryTaskCode, enquiryCode])

  useEffect(() => {
    const standard = info?.attrs ?
      Object.entries(JSON.parse(info?.attrs)).map(([label, value]) => ({ value, label })) :
      [{ value: undefined, label: undefined }]

    form.setFieldsValue({
      tax: '1.13',
      currency: '人民币元',
      supplyAmount: info.enquiryAmount,
      supplyAmountUnit: info.enquiryAmountUnit,
      periodUnit:'天',
      supplierCode: companyEmail,
      productName: info?.productName,
      brand: info?.brand,
      standard: standard
    })
  }, [form, companyEmail, info])

  const onSubmit = () => {
    
    form.validateFields()
      .then((values) => {
        const attrs = {}
        values?.standard?.forEach(({label, value}) => {
          attrs[label] = value;
        });

        const params = {
          bizCode: 'IT',
          operateType: 'build_submit',
          enquiryType: info?.enquiryType,
          deliveryAddress: info?.deliveryAddress,
          quotationList: [{
            bizCode: "IT",
            supplierCode: companyEmail,
            supplierName: companyName,
            enquiryAmount: info.enquiryAmount,
            enquiryCode: info.enquiryCode,
            productType: info.productType,
            category: info.category,
            referenceWebSite: info.referenceWebSite,
            sku: info.sku,
            productName: values.productName,
            brand: values.brand,
            attrs: JSON.stringify(attrs),
            taxIncludedPrice: values.taxIncludedPrice,
            currency: values.currency,
            quoteExpireDate: `${moment(values.quoteExpireDate).format('YYYY-MM-DD')} 23:59:59`,
            warrantyInformation: values.warrantyInformation,
            supplyAmount: values.supplyAmount,
            supplyAmountUnit: values.supplyAmountUnit,
            arrivalPeriod: values.arrivalPeriod,
            periodUnit: values.periodUnit,
            remark: values.remark,
            tax: values.tax,
          }]
        }

        asyncActions.submitQuotation(params)
          .then(res => {
            if (res.code === '0') {
              props.history.goBack();
            }
          })
      })
  }

  const onCancel = () => {
    props.history.goBack();
  }

  const onNameChange = (val) => {
      setName(val)
  };

  const addItem = () => {
    const reg = /^\d+(\.\d{1,2})?$/
    if (name > 0) {
     if (reg.test(name)) {
        if (taxList.some((item) => (item === name))) {
          message.info({
            content: '请勿重复添加！',
            duration: 3
          })
        } else {
          setTaxList([...taxList, {value: name, label: name}])
          setName('')
        }
      } else {
        message.info({
          content: '添加税率最多为小数点后2位！',
          duration: 3
        })
      }
    } else {
       message.info({
        content: '税率必须大于0！',
        duration: 3
      })
      setName('')
   }
  };

  return (
    <>
      <div className={style.content}>
        <Card title='询价信息' >
          <div className={style.quoteInfo}>
            <span className={style.quoteInfoLabel}>询报价方式：</span>
            <span className={style.quoteInfoValue}>{info?.enquiryTypeName}</span>
            <span className={style.quoteInfoLabel}>询价时间：</span>
            <span className={style.quoteInfoValue}>{info?.createTime}</span>
            <span className={style.quoteInfoLabel}>报价截止时间：</span>
            <span className={style.quoteInfoValue}>{info?.expireDate}</span>
            <span className={style.quoteInfoLabel}>紧急程度：</span>
            <span className={style.quoteInfoValue}>{info?.urgeName}</span>
            <span className={style.quoteInfoLabel}>到货地址：</span>
            <span className={style.quoteInfoValue}>{info?.deliveryAddress}</span>
            <span className={style.quoteInfoLabel}>备注：</span>
            <span className={style.quoteInfoValue}>{info?.remark}</span>
          </div>
        </Card>
        <Card title='询价商品' >
          <Table
            rowKey={record => record.id}
            dataSource={info?.tableData}
            columns={[
              {
                title: '需求子单ID',
                dataIndex: 'requestDetailId',
                key: 'requestDetailId'
              },
              {
                title: '询价商品信息',
                dataIndex: 'inquiryProductInQuotation',
                key: 'inquiryProductInQuotation',
                render: TableComplexItem
              },
              {
                title: '询价数量',
                dataIndex: 'enquiryAmount',
                key: 'enquiryAmount',
              },
            ]}
            pagination={false}
          />
        </Card>
        <Card title={restHistoryList.length ? `报价-${info.inquiryNo}` : "线上报价"}>
          <div className={style.quoteFormTitle}>
            <h4>报价信息</h4>
            <span className={style.quoteFormTitleLabel}>含税单价：</span>
            <span className={style.quoteFormTitleValue}>
              {
                sum.taxIncludedPrice
              }
            </span>
            <span className={style.quoteFormTitleLabel}>含税总价：</span>
            <span className={style.quoteFormTitleValue}>
              {
                sum.totalTaxIncludedPrice
              }
            </span>
            <span className={style.quoteFormTitleLabel}>未税单价：</span>
            <span className={style.quoteFormTitleValue}>
              {
                sum.taxExcludedPrice
              }
            </span>
            <span className={style.quoteFormTitleLabel}>未税总价：</span>
            <span className={style.quoteFormTitleValue}>
              {
                sum.totalTaxExcludedPrice
              }
            </span>
          </div>
          <div className={style.quoteFormMain}>
            <Form
              {...formItemLayout}
              onFieldsChange={updateSumHandler}
              form={form}>
              <div className={style.formMainLeft}>
                <h4>报价</h4>
                <Form.Item
                  name="supplierCode"
                  label="供应商"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  {
                    selectorEnhancer({
                      noWrap: true,
                      options: [{ label: companyName, value: companyEmail }]
                    })
                  }
                </Form.Item>

                <Form.Item
                  name="taxIncludedPrice"
                  label="含税单价/币种"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input
                    placeholder='请输入'
                    addonAfter={
                      selectorEnhancer({
                        name: 'currency',
                        width: 98,
                        options: state.currencyList
                      })
                    }
                    style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="tax"
                  label="税率"
                  rules={[{ required: true, message: '请选择' }]}
                >
                <Select
                 style={{ width: '100%' }}
                 placeholder="请选择"
                 dropdownRender={menu => (
                  <div>
                    {menu}
                  <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
               <InputNumber min={0} max={100} step={0.01}  style={{ flex: 'auto' }} value={name} onChange={(e) => onNameChange(e)} />
                    <a
                      style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                      onClick={addItem}
                    >
                      <PlusOutlined />添加税率
                    </a>
               </div>
             </div>
              )}
            >
                  {
                  taxList.map(item => (<Option value={item.value} key={item.value}>{item.label}</Option>))
                }
              </Select>
                </Form.Item>
              
                <Form.Item
                  name="supplyAmount"
                  label="供应数量"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input
                    disabled
                    type='number'
                    placeholder='请输入'
                    addonAfter={
                      selectorEnhancer({
                        name: 'supplyAmountUnit',
                        width: 98,
                        options: supplyAmountUnitList,
                        disabled: true
                      })
                    }
                    style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="quoteExpireDate"
                  label="报价有效期"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <DatePicker />
                </Form.Item>
              
                <Form.Item
                  name="warrantyInformation"
                  label="保修信息"
                  rules={[{ required: true, message: '请选择' }]}
                >
                  {
                    selectorEnhancer({
                      noWrap: true,
                      options: warrantyOptionList
                    })
                  }
                </Form.Item>

                <Form.Item
                  name="arrivalPeriod"
                  label="到货周期"
                  rules={[
                    { required: true, message: '请输入' }
                  ]}
                >
                  <Input
                    type="number"
                    placeholder='请输入'
                    addonBefore={
                      <span>下单后</span>
                    }
                    addonAfter={
                      selectorEnhancer({
                        name: 'periodUnit',
                        width: 98,
                        options: periodUnitList
                      })
                    }
                    style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="remark"
                  label="报价备注"
                >
                  <TextArea placeholder='请输入'/>
                </Form.Item>
              </div>

              <div className={style.formMainRight}>
                <h4>报价商品信息</h4>
                <Form.Item
                  name="productName"
                  label="商品名称"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input
                    disabled
                    placeholder='请输入'
                    style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="brand"
                  label="品牌"
                >
                  {selectorEnhancer({noWrap: true, options: state.brandList, disabled: true, showSearch: true})}
                </Form.Item>
              
                <Form.List
                  name="standard"
                >
                  {(fields) => {
                    const node = (
                      <>
                        {fields.map(({ key, name, fieldKey, ...restField }, index) => {
                          return (
                            <Form.Item
                              {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                              label={index === 0 ? '规格型号' : ''}
                              key={key}
                            >
                              <div className={style.addInput} >
                                <div className={style.addInputLeft}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'label']}
                                    label='规格'
                                    fieldKey={[fieldKey, 'label']}
                                    noStyle
                                  >
                                    <Input placeholder="请输入规格" disabled />
                                  </Form.Item>
                                </div>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  label='型号'
                                  fieldKey={[fieldKey, 'value']}
                                  noStyle
                                >
                                  <Input placeholder="请输入型号" disabled />
                                </Form.Item>
                              </div>
                            </Form.Item>
                          )})}
                      </>
                    )

                    return node;
                  }}
                </Form.List>
              </div>  
            </Form>
          </div>
        </Card>
        <Card title='全部报价' >
          <Table
            rowKey={record => record.inquiryNo}
            dataSource={
              restHistoryList?.map(({tableData}) => tableData).flat()
            }
            columns={[
              {
                title: '序号',
                dataIndex: 'inquiryNo',
                key: 'inquiryNo',
                width: '6%'
              },
              {
                title: '询价商品/数量',
                dataIndex: 'inquiryProduct',
                key: 'inquiryProduct',
                render: TableComplexItem,
                width: '26%'
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render(status) {
                  return <span>• {status}</span>
                },
                width: '8%'
              },
              {
                title: '报价商品',
                dataIndex: 'quoteProduct',
                key: 'quoteProduct',
                render: TableComplexItem,
                width: '16%'
              },
              {
                title: '报价',
                dataIndex: 'quotedPrice',
                key: 'quotedPrice',
                render: TableComplexItem,
                width: '16%'
              },
              {
                title: '其他',
                dataIndex: 'otherInfo',
                key: 'otherInfo',
                render: TableComplexItem,
                width: '16%'
              },
              {
                title: '报价备注',
                dataIndex: 'quotationNotes',
                key: 'quotationNotes',
                width: '12%'
              },
            ]}
            pagination={false}
          />
        </Card>
      </div>

      <Affix offsetBottom={0}>
        <div className={style.submitBar}>
          <Button className={style.submitPrimary} type="primary" onClick={onSubmit}>
              提交报价
          </Button>
          <Button type="ghost" onClick={onCancel}>
              取消
          </Button>
        </div>
      </Affix>
    </>
  )
}