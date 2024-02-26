// 账户信息
import React, { Component } from 'react';
import dispatchs from 'src/redux/dispatchs';
import { connect } from 'react-redux';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, Radio, Cascader, Row, Col, Upload } from 'antd';
import { FormEx2, message, Address } from 'src/components';
import api from 'src/api';
import _ from 'lodash';
import './company.scss';
import uploadIcon from 'src/resource/img/upload-icon.png';


const { Item } = FormEx2;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

const maxLength = 50;
const textareaSize = {
  minRows: 2,
  maxRows: 4
};

class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formValidate: false,
      categoryList: []
    }
  }

  componentDidMount() {
    this.getCategoryList();
  }

  getCategoryList = () => {
    api.queryCategoryList().then((res) => {
      if (res.code === 0) {
        let list = res.msg;
        this.setState({ categoryList: list })
      }
    });
  }

  addItem = () => {
    let { keys, uuid } = this.props;
    const { saveKeys } = this.props.actions;
    const nextKeys = keys.concat(uuid);
    uuid++;
    saveKeys(nextKeys, uuid);
  }

  removeItem = (k) => {

    const { keys, uuid } = this.props;
    const { saveKeys } = this.props.actions;
    if (keys.length === 1) {
      return;
    }
    saveKeys(keys.filter(key => key !== k), uuid);
  }

  addCategory = () => {
    let { categoryKeys, categoryUuid } = this.props;
    const { saveCategoryKeys } = this.props.actions;
    const nextKeys = categoryKeys.concat(categoryUuid);
    categoryUuid++;
    saveCategoryKeys(nextKeys, categoryUuid);
  }

  removeCategory = (k, index) => {
    const { categoryKeys, categoryUuid } = this.props;
    const { saveCategoryKeys } = this.props.actions;
    if (categoryKeys.length === 1) {
      return;
    }
    saveCategoryKeys(categoryKeys.filter(key => key !== k), categoryUuid);
    if (this.form && this.form.getValue('company.category')) {
      let category = _.cloneDeep(this.form.getValue('company.category'));

      category.splice(index, 1)//.filter(cat => { return cat && cat });
      console.log('cat', category);
      this.form.setValue('company.category', category);
    }
    // let category = _.cloneDeep(this.form.getValue('company.category'));
    // console.log('cat', this.form.getValue('company.category'));


    // formCat.splice(index, 1);

    // category.splice(index, 1);
    // this.form.setValue('company.category', category);
    // freshForm(Object.assign(...registerForm, { 'company.category': category }));

  }

  handleSubmit = (values) => {
    const { changeStep } = this.props.actions;
    changeStep(4);
  }

  onFormChange = (values) => {
    values.company.category = values.company.category && values.company.category//.filter(cat => { return cat && cat })
    const { freshForm } = this.props.actions;
    freshForm(values);
  }

  onUploadChange = (name, info) => {
    const { saveFile } = this.props.actions;

    let fileList = info.fileList;
    fileList = fileList.slice(-1);

    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.errorCode === 0;
      }
      return true;
    });

    saveFile(name, fileList);

    if (info.file.status === 'done') {
      // const url = fileList[0].response.data;
      const url = fileList[0] && fileList[0].response && fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, '');
    }
  }

  validFunction = (rule, value, callback) => {
    // const { registerForm } = this.props;
    // console.log('222', this.form.getValue('company.category'))
    // const catForm = _.get(registerForm, 'company.category');
    // if (catForm && value) {
    //   let category = Array.from(new Set(_.cloneDeep(catForm.map(cat => { return cat.join('/') }))));
    //   if (category.indexOf(value.join('/')) != -1) {
    //     callback('不能选择重复的主营品类');
    //   }
    // }
    // callback();

    if (this.form && value) {
      const catForm = this.form.getValue('company.category').filter(cat => { return cat && cat });
      console.log('catForm', catForm)
      let category = Array.from(new Set(_.cloneDeep(catForm.map(cat => { return cat.join('/') }))));
      console.log('category', category)
      if (category.length !== catForm.length) {
        callback('不能选择重复的主营品类');
      }
    }
    callback();
  }

  render() {

    const { registerForm, file, keys,  uploadProps, categoryKeys } = this.props;
    const { categoryList } = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18, offset: 1 },
    };
    const formItemLayoutWrapper = {
      wrapperCol: { span: 18, offset: 6 }
    };

    return (
      <div className="m-company">

        <header>
          <h1 className="u-tt">公司信息</h1>
          <div className="u-subtt">填写公司信息，方便我们及时给您反馈</div>
        </header>

        <div className="u-form">
          <FormEx2
            defaultValues={registerForm}
            onValidate={(status) => {
              this.setState({ formValidate: status });
            }}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={this.onFormChange}
            ref={(f) => { this.form = f }}
          >


            <Item
              {...formItemLayout}
              label="企业名称"
              required
              colon={false}
              dataIndex="company.companyName"
              rules={[{ required: true, message: '请输入必须与营业执照名称相符的企业名称' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="企业名称必须与营业执照名称相符" />
              }
            />

            <Item
              {...formItemLayoutWrapper}
              className="u-radio-gp"
              dataIndex="company.area.country"
              rules={[{ required: true, message: '请选择国家' },]}
              decorator={
                <RadioGroup >
                  <RadioButton value="china">中国</RadioButton>
                  <RadioButton value="foreign">国外</RadioButton>
                </RadioGroup>
              }
            />

            {
              _.get(registerForm, 'company.area.country', '') !== 'foreign' &&
              <Item
                {...formItemLayout}
                label="联系地址"
                required
                colon={false}
                dataIndex="company.areaArray"
                rules={[{ required: true, message: '请选择省市区' },]}
                decorator={
                  <Cascader options={Address} placeholder="省/市/区" />
                }
              />

            }

            <Item
              {...formItemLayout}
              label="详细地址"
              required
              colon={false}
              dataIndex="company.companyAddress"
              rules={[{ required: true, message: '请填写详细地址' },]}
              decorator={
                <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="详细地址：如道路、门牌号、楼梯号、单元室等" />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              className="u-radio-gp"
              dataIndex="company.companyType"
              label="供应级别"
              required
              rules={[{ required: true, message: '请选择供应级别' }]}
              decorator={
                <RadioGroup >
                  <RadioButton value={1}>原厂商</RadioButton>
                  <RadioButton value={2}>代理商</RadioButton>
                  <RadioButton value={0}>其他</RadioButton>
                </RadioGroup>
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="法定代表人"
              required
              rules={[{ required: true, message: '请输入企业法定代表人姓名' },]}
              dataIndex="company.legalRepresentative"
              decorator={
                <Input maxLength={maxLength} placeholder="请输入企业法定代表人姓名" />
              }
            />
            <Item
              {...formItemLayout}
              label="发货地址"
              required
              colon={false}
              dataIndex="company.originPlace"
              rules={[{ required: true, message: '请填写主营商品发货地' },]}
              decorator={
                <Input maxLength={maxLength} placeholder="主营商品发货地" />
              }
            />

            {
              categoryKeys && categoryKeys.map((k, index) => {
                return (
                  <div key={index}>
                    <Item
                      {...formItemLayout}
                      label="主营类目"
                      required
                      colon={false}
                    >
                      <Row >
                        <Col span={19}>
                          <Item
                            dataIndex={`company.category[${index}]`}
                            rules={[{ required: true, message: '请选择主营类目' }, { validator: this.validFunction }]}
                            decorator={
                              <Cascader options={categoryList} placeholder="主营类目" changeOnSelect />
                            }
                          />
                        </Col>
                        <Col span={4} offset={1}>
                          <div className="u-operate-icon">
                            {
                              index === 0 ? <PlusCircleOutlined onClick={this.addCategory} style={{ color: '#4680fe' }} /> : <MinusCircleOutlined onClick={() => this.removeCategory(k, index)} />
                            }
                          </div>
                        </Col>
                      </Row>
                    </Item>
                  </div>
                );
              })
            }

            {
              keys && keys.map((k, index) => {
                return (
                  <div key={k}>
                    <Item
                      {...formItemLayout}
                      label="主营品牌"
                      required
                      colon={false}
                    >
                      <Row >
                        <Col span={8}>
                          <Item
                            dataIndex={`company.mainBrand[${k}][brand]`}
                            rules={[{ required: true, message: '请输入品牌名称' },]}
                            decorator={
                              <Input maxLength={maxLength} placeholder="主营品牌" />
                            }
                          />
                        </Col>
                        <Col span={10} offset={1}>
                          <Item
                            dataIndex={`company.mainBrand[${k}][level]`}
                            rules={[{ required: true, message: '请输入代理等级' },]}
                            decorator={
                              <Input maxLength={maxLength} placeholder="品牌代理等级" />
                            }
                          />
                        </Col>
                        <Col span={4} offset={1}>
                          <div className="u-operate-icon">
                            {
                              index === 0 ? <PlusCircleOutlined onClick={this.addItem} style={{ color: '#4680fe' }} /> : <MinusCircleOutlined onClick={() => this.removeItem(k)} />
                            }
                          </div>
                        </Col>
                      </Row>
                    </Item>
                  </div>
                );
              })
            }

            <Item
              {...formItemLayout}
              colon={false}
              label="户名"
              required
              rules={[{ required: true, message: '请填写公司户名' },]}
              dataIndex="qualification.accountName"
              decorator={
                <Input maxLength={maxLength} placeholder="请填写公司户名" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label="开户行"
              required
              rules={[{ required: true, message: '请填写公司开户行' },]}
              dataIndex="company.bank"
              decorator={
                <Input maxLength={500} placeholder="请填写公司开户行" />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="开户行地址"
              required
              rules={[{ required: true, message: '请填写公司开户行地址' },]}
              dataIndex="qualification.bankAddress"
              decorator={
                <Input maxLength={maxLength} placeholder="请填写公司开户行地址" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label="账号"
              required
              rules={[{ required: true, message: '请填写公司账号' },]}
              dataIndex="company.bankAccountId"
              decorator={
                <Input maxLength={maxLength} placeholder="请填写公司账号" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label="公司网址"
              dataIndex="company.net"
              decorator={
                <Input maxLength={maxLength} placeholder="请填写公司官网地址或电商旗舰店地址" />
              }
            />

            <Item
              {...formItemLayout}
              colon={false}
              label={<span>合作意向</span>}
              dataIndex="company.cooperationIntention"
              decorator={
                <TextArea maxLength={maxLength} autoSize={textareaSize} placeholder="贵公司的合作意向：如经营的品牌，品类合作目的等" />
              }
            />


            <Item
              {...formItemLayout}
              colon={false}
              label={<span>主营类目文件</span>}
              dataIndex="file"
            >
              <div className="m-upload-wrapper">
                <Upload {...uploadProps} fileList={file}
                  onChange={(...args) => { this.onUploadChange('file', ...args) }}>
                  <Button className="u-uploader">
                    {/* <Icon type="cloud-upload" style={{ fontSize: '32px' }} /> */}
                    <img src={uploadIcon} alt=""/>
                  </Button>
                </Upload>

                <div className="u-upload-desc">
                  <p>上传主营商品类目文件</p>
                  <p>Excel/PDF/Word均可(选填)</p>
                </div>
              </div>

            </Item>





            <div className="u-next">
              <Button type="primary" htmlType="submit" >下一步</Button>
              {/* <Button  type="primary" htmlType="submit" >保存</Button>  */}
            </div>
          </FormEx2>

        </div>

        <div className="m-intro">

          <p>注：填写过程中在点击提交资料审核前请勿关闭或刷新页面，否则已填写信息将会丢失。</p>

        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
    file: state.register.file,
    keys: state.register.keys,
    uuid: state.register.uuid,
    defaultCategory: state.app.defaultCategory,
    uploadProps: state.app.uploadProps,
    categoryKeys: state.register.categoryKeys,
    categoryUuid: state.register.categoryUuid
  };
}


export default connect(mapStateToProps, dispatchs('app', 'register'))(Company)
