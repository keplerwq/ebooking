import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, InputNumber, Row, Col, DatePicker, Popover } from 'antd';
import { FormEx2, message, } from 'src/components';
import { Card } from 'src/containers';
import moment from 'moment';
import api from 'src/api';

const { Option } = Select;
const { Item } = FormEx2;

const maxLength = 50;
const modelContent = <div>
  <div>价格计费模式</div>
  <div>1、固定单价：数量*单价得出总价</div>
  <div>2、固定单价（按年）：单价请输入月单价。 当输入计费天数=当月总天数，计算公式为：数量*单价（元/月）；当输入计费天数≠当月总天数，计算公式为：数量*单价（元/月）*12/365*计费天数</div>
  <div>3、阶级单价：每个数量阶梯对应一个单价，实际使用数量*该阶梯单价，得出总价</div>
  <div>4、阶梯累计单价：每个数量阶梯对应一个单价，每个阶梯内的使用数量*该阶梯单价，累加后得出总价</div>
  <div>5、固定+阶梯单价：不同固定数量对应不同固定总价格，超出最大固定数量部分对应一个单价，固定总价格+超出数量*单价，得出总价</div>
</div>

class CloudServices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      checkEdit:false,
      formItem: {},
      priceForm: {
        priceForm0:{
          min: 0,
          maze1: '<',
          maze2: '<',
          max: "∞",
          cost: 0
        }
      },
      formKey: 0,
      priceFormList: [0],
    }
  }

  componentDidMount() {
    const { updateForm = {}, isEditing = false, formListKey } = this.props;

    if(isEditing) {
      if(updateForm[formListKey].model == '阶梯单价' ||
        updateForm[formListKey].model == '阶梯累计单价'){
        let list = updateForm[formListKey].price.split(',');
        let xform = {};
        Array.isArray(list) && list.map((item,index) => {
          let arr = item?.split(':');
          let all = arr[0]?.split('x');
          let all0 = all[0]?.split('');
          let all1 = all[1]?.split('');
          let front = '';
          let maze1 = '';
          let maze2 = '';
          let end = '';
          Array.isArray(all0) && all0.map((i,index0)=> {
            if(i !== '<' && i !== '='){
              front+= i;
            }else{
              maze1 += i
            }
          })
          Array.isArray(all1) && all1.map((x,index2) => {
            if(x != '<' && x!='='){
              end+=x;
            }else{
              maze2 += x
            }
          })

          let arr1 = arr[1];
          xform[`priceForm${index}`] = {
            min: front,
            maze1: maze1,
            maze2: maze2,
            max: end,
            cost: arr1
          }
        })
        this.setState({
          priceForm: {...xform}
        },()=>{
          console.log(this.state.priceForm);
        })
        // this.form1.setValues(xform)
      }
    }
  }

  componentWillReceiveProps(props) {
    const { updateForm ,isEditing = false,formListKey} = props;
    // const statusName = updateForm[formListKey].statusName;
    const statusName = updateForm[formListKey] && updateForm[formListKey].statusName;

    if(statusName !== '再次报价'){
      this.setState({
        checkEdit:false
      })
    }else if(statusName === '草稿') {
      this.setState({
        checkEdit:true
      })
    }else{
      this.setState({
        checkEdit:isEditing
      })
    }

    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }

  onFormChange = (values) => {
    /* 赋值至redux */
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  areaFilter = (obj) => {
    if (obj && obj !== 'null') return obj;
    return '';
  }
  onPriceFormChange = (values) => {      //重要!!!!!
    this.form1.setValues(values);
    this.setState({
      priceForm: values
    })
  }

  addPriceForm = () => {
    const { priceFormList,priceForm ,formKey} = this.state;
    let key = formKey + 1;
    priceForm[`priceForm${key}`] = {
      min: 0,
      maze1: '<',
      maze2: '<',
      max: "∞",
      cost: 0
    }
    this.setState({
      priceFormList: [...priceFormList, key],
      priceForm,
      formKey: key
    })
    this.form1.setValues(priceForm);
  }
  delPriceForm = (val) => {
    const { priceFormList,priceForm } = this.state;
    let index = priceFormList.indexOf(val);
    priceFormList.splice(index,1)
    priceForm[`priceForm${val}`] = null
    this.setState({
      priceFormList,
      priceForm
    })
  }
  checkMax = () => {
    var re = /^[0-9]+.?[0-9]*/;
    const { priceForm,formKey } = this.state;
    let min = priceForm[`priceForm${formKey}`].min;
    let max = priceForm[`priceForm${formKey}`].max;
    if(max !== '∞' && !re.test(max)) {
      message.error('区间只能输入数字');
      priceForm[`priceForm${formKey}`].max = '';
      this.form1.setValues(priceForm,true);
    }else if(max < min){
      message.error('该数字必须大于最小值');
      priceForm[`priceForm${formKey}`].max = '';
      this.form1.setValues(priceForm,true);
    }else{}
  }
  validFunction = (value, callback) => {
    if (!value || (value !== "∞" && isNaN(value))) {
      callback(new Error(" "));
    } else {
      callback();
    }
  }
  // 获得焦点时回调
  getPriceUnit = (index) => {
    const { updateForm,autoComplete,formListKey } = this.props;

    if(updateForm[index].currency) {
      let params = {
        currency: updateForm[index].currency,
        unit: '空'
      };
      api.getFindPriceUnit(params).then((res) => {
        if(res.code == 0){
          autoComplete['自定义'].priceUnits = res.msg;
          this.setState({autoComplete})
          console.log(autoComplete);
        }
      })
    }else{
      message.warn('请先选择币种！');
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xl: { span: 10 },
        xxl: { span: 8 },
      },
      wrapperCol: {
        xl: { span: 14 },
        xxl: { span: 16 },
      },
    };
    const formItemLayout4 = {
      labelCol: { span: 4},
      wrapperCol: { span: 20 },
    };
    const formItemLayout3 = {
      labelCol: { span: 8},
      wrapperCol: { span: 16 },
    };
    const col6 = {
      span: 6
    }
  
    const col24 = {
      span: 24
    }

    const {
      updateForm = {},
      formListKey,
      formListIndex,
      auth,
      autoComplete
    } = this.props;

    const { priceFormList, priceForm, checkEdit } = this.state;
    /* 获取当前表单select的option */
    const otherObj = autoComplete['自定义'];
    let autoList = Object.keys(autoComplete);
    autoList.splice(autoList.indexOf('自定义'),1);
    return (
      <div className="g-quote-from-res">
        <Card
          formListIndex={formListIndex}
          supplierType={updateForm[formListKey].supplierType}
          secondType={updateForm[formListKey].secondType}
          statusName={updateForm[formListKey].statusName}
          del={() => { this.props.delForm(formListKey) }}
          copy={() => { this.props.copyForm(formListKey) }}
          isEditing={checkEdit}
        />
        <FormEx2
          defaultValues={updateForm}
          onChange={(values, key, value) => { this.onFormChange(values, key, value) }}
          ref={(f) => { this.form = f }}
          layout="inline"
        >
          <Row>
            <Col {...col6}>
              <Item {...formItemLayout} label="供应商简称"
                dataIndex={`[${formListKey}].secondName`}
                decorator={
                  <span>{_.get(updateForm, `[${formListKey}].secondName`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label={"二级计费项"} required
                dataIndex={`[${formListKey}].item2`}
                rules={[{ required: true, message: ' ' }]}
                decorator={ checkEdit ? <Input maxLength={maxLength} placeholder="请输入" />
                  :
                  <span>{_.get(updateForm, `[${formListKey}].item2`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label={"三级计费项"} required
                dataIndex={`[${formListKey}].item3`}
                rules={[{ required: true, message: ' ' }]}
                decorator={
                  checkEdit ? <Input maxLength={maxLength} placeholder="请输入" />
                    :
                    <span>{_.get(updateForm, `[${formListKey}].item3`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label="四级计费项" required
                dataIndex={`[${formListKey}].item4`}
                rules={[{ required: true, message: ' ' }]}
                decorator={
                  checkEdit ? <Input maxLength={maxLength} placeholder="请输入" />
                    :
                    <span>{_.get(updateForm, `[${formListKey}].item4`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label="币种" required
                dataIndex={`[${formListKey}].currency`}
                rules={[{ required: true, message: ' ' },]}
                decorator={ checkEdit ?
                  <Select allowClear placeholder="请选择单个" >
                    { otherObj && otherObj.currency &&
                      otherObj.currency.map(item => <Option value={item} key={item} > {item} </Option>)
                    }
                  </Select>
                  :
                  <span>{_.get(updateForm, `[${formListKey}].currency`, '')}</span>
                }
              />
            </Col>
          </Row>

          <Row>
            <Col {...col6}>
              <Item {...formItemLayout} required
                label={
                  <Popover content={modelContent} trigger="hover">
                    <span>价格计费模式 <QuestionCircleOutlined /></span>
                  </Popover>
                }
                dataIndex={`[${formListKey}].model`}
                rules={[{ required: true, message: ' ' },]}
                decorator={ checkEdit ?
                  <Select allowClear placeholder="请选择" >
                    {
                      otherObj&&otherObj.model&&otherObj.model.map(item => <Option value={item} key={item}>{item}</Option>)
                    }
                  </Select>
                  :
                  <span>{_.get(updateForm, `[${formListKey}].model`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label="价格单位" required
                dataIndex={`[${formListKey}].priceUnit`}
                rules={[{ required: true, message: ' ' },]}
                decorator={ checkEdit ?
                  <Select allowClear placeholder="请选择" mode='tags' optionFilterProp='children'
                    onFocus={() => this.getPriceUnit(formListKey)}>
                    {
                      otherObj&&otherObj.priceUnits&&otherObj.priceUnits.map(item => <Option value={item} key={item}>{item}</Option>)
                    }
                  </Select>
                  :
                  <span>{_.get(updateForm, `[${formListKey}].priceUnit`, '')}</span>
                }
              />
            </Col>
            <Col {...col6} >
              <Item {...formItemLayout} label="保底情况"
                dataIndex={`[${formListKey}].bottom`}
                decorator={ checkEdit ?
                  <Input maxLength={maxLength} placeholder="请输入" />
                  :
                  <span>{_.get(updateForm, `[${formListKey}].bottom`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              {
                _.get(updateForm, `[${formListKey}].model`, '') === '官网折扣'
                  ?
                  <Col {...col24} key={1}>
                    <Item
                      {...formItemLayout}
                      label="折扣率"
                      dataIndex={`[${formListKey}].discountRate`}
                      required
                      rules={[{ required: true, message: ' ' },]}
                      trigger='onBlur'
                      decorator={
                        checkEdit ?
                          <Input placeholder="请输入" />
                          :
                          <span>{_.get(updateForm, `[${formListKey}].discountRate`, '')}</span>
                      }
                    />
                  </Col>
                  :
                  <Col {...col24} key={2}>
                  </Col>
              }
            </Col>
          </Row>
          <Row style={{height: 'auto'}}>
            { (() => {
              switch (updateForm[formListKey].model){
                case '固定单价' :
                  return (
                    <Col {...col6} key={1}>
                      <Item {...formItemLayout} label="含税价格" required
                        dataIndex={`[${formListKey}].price`}
                        rules={[{ required: true, message: ' ' },]}
                        decorator={ checkEdit ?
                          <InputNumber min={0}  style={{width: '100%'}} placeholder="请输入" />
                          :
                          <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                        }
                      />
                    </Col>
                  )
                case '阶梯单价' :
                  return (
                    <Col  key={2} span={13}>
                      <Item label="价格区间" {...formItemLayout4}
                        // dataIndex={`[${formListKey}].price`}
                        // onChange={() => this.getPrice(`[${formListKey}].price`)}
                        // rules={[{ required: true, message: ' ' },]}
                        decorator={ checkEdit ?
                          (
                            <FormEx2 defaultValues={priceForm} layout="inline"
                              ref={(f) => { this.form1 = f }}
                              onChange={(values) => { this.onPriceFormChange(values,formListKey)}}>
                              {
                                Object.values(priceFormList).map((item,index) =>{
                                  return (
                                    <Col span={12} style={{height: '60px'}} key={index}>
                                      <Col span={5}>
                                        <Item {...formItemLayout3} label="数量" dataIndex={`[priceForm${item}].min`}
                                          rules={[{ required: true, message: ' ' },]} required
                                          decorator={
                                            <InputNumber  style={{width:'100%'}} />
                                          }
                                        />
                                      </Col>
                                      <Col span={3}>
                                        <Item  dataIndex={`[priceForm${item}].maze1`}
                                          rules={[{ required: true, message: ' ' },]}
                                          decorator={
                                            <Select >
                                              <Option value="<">{'<'} </Option>
                                              <Option value="<=">{'<='} </Option>
                                            </Select>
                                          }
                                        />
                                      </Col>
                                      <div style={{cssFloat:'left',display:'inline-block',width:'10px',marginTop: '10px'}}>X</div>
                                      <Col span={3}>
                                        <Item dataIndex={`[priceForm${item}].maze2`}
                                          rules={[{ required: true, message: ' ' },]}
                                          decorator={
                                            <Select>
                                              <Option value="<">{'<'} </Option>
                                              <Option value="<=">{'<='} </Option>
                                            </Select>
                                          }
                                        />
                                      </Col>
                                      <Col span={3}>
                                        <Item dataIndex={`[priceForm${item}].max`}
                                          rules={[{ required: true, message: ' ' },{validator: this.validFunction}]}
                                          // onChange={(values,key,value) => {this.checkMax(values,key,value)}}
                                          decorator={
                                            <Input onBlur={() => {this.checkMax()}}/>
                                          }
                                        />
                                      </Col>
                                      <Col span={5}>
                                        <Item label="价格" dataIndex={`[priceForm${item}].cost`} {...formItemLayout}
                                          rules={[{ required: true, message: ' ' },]} required
                                          decorator={
                                            <InputNumber  />
                                          }
                                        />
                                      </Col>
                                      {
                                        index < 1 ?
                                          (
                                            <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                              textAlign: 'center',border: '1px solid #ccc',display: 'inline-block',borderRadius: '50%'}}
                                            onClick={() => this.addPriceForm()}>
                                              <PlusOutlined />
                                            </div>
                                          ) : (
                                            <div style={{ width: '30px',height: '30px',marginTop: '4px',lineHeight: '28px',
                                              textAlign: 'center',fontSize: '28px',display: 'inline-block',color: '#ccc'}} onClick={() => {this.delPriceForm(item)}}>
                                              <MinusCircleOutlined className="dynamic-delete-button" />
                                            </div>
                                          )
                                      }
                                    </Col>
                                  );
                                })
                              }
                            </FormEx2>
                          )
                          :
                          <span>{_.get(updateForm, `[${formListKey}].price`, '')}</span>
                        }
                      />
                    </Col>
                  );
                default:
              }
            })()}
          </Row>
          <Row>
            <Col {...col6}>
              <Item {...formItemLayout} label="报价有效期限" required
                dataIndex={`[${formListKey}].validityPeriod`}
                rules={[{ required: true, message: ' ' },]}
                defaultValue={moment(new Date())}
                // trigger='onBlur'
                decorator={
                  checkEdit ?
                    <DatePicker placeholder="请选择日期" format={"YYYY-MM-DD"}/>
                    :
                    <span>{moment(_.get(updateForm, `[${formListKey}].validityPeriod`, '')).format("YYYY-MM-DD")}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout}  label="税率(%)" required
                dataIndex={`[${formListKey}].tax`}
                rules={[{ required: true, message: ' ' },]}
                // trigger='onBlur'
                decorator={ checkEdit ?
                  <InputNumber style={{width: '100%'}} placeholder="请输入" />
                  :
                  <span>{_.get(updateForm, `[${formListKey}].tax`, '')}%</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label="SLA"
                dataIndex={`[${formListKey}].sla`}
                decorator={ checkEdit ? <Input maxLength={maxLength} placeholder="请输入" />
                  :
                  <span>{_.get(updateForm, `[${formListKey}].sla`, '')}</span>
                }
              />
            </Col>
            <Col {...col6}>
              <Item {...formItemLayout} label="备注"
                dataIndex={`[${formListKey}].remark`}
                decorator={ checkEdit ? <Input maxLength={maxLength} placeholder="请输入" />
                  :
                  <span>{_.get(updateForm, `[${formListKey}].remark`, '')}</span>
                }
              />
            </Col>
          </Row>
        </FormEx2>
      </div >
    );
  }
}


const mapStateToProps = (state) => {
  return {
    updateForm: state.quoteResources.updateForm,
    auth: state.quoteResources.auth
  };
}

export default connect(mapStateToProps, dispatchs('app', 'quoteResources'), null, { forwardRef: true })(CloudServices)
