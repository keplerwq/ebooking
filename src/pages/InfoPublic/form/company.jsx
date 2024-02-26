//公司信息
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dispatchs from 'src/redux/dispatchs';
import _ from 'lodash';
import { Input, Row, Col, Cascader, Select } from 'antd';
import { FormEx2, Address, message, } from 'src/components';
import OpHeader from '../components/OpHeader';
import '../InfoPublic.scss';


const { Item } = FormEx2;
const maxLength = 50;
const { Option } = Select;


class Company extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    }
  }

  componentDidMount() {

  }
 
  componentWillReceiveProps(props) {
    const { updateForm } = props;
    if (updateForm) {
      this.form && this.form.setValues(updateForm);
    }
  }


  onFormChange = (values) => {

    const { freshForm } = this.props.actions;
    freshForm(values);
  }


  onEdit = () => {
    this.setState({
      isEditing: true
    });
    const { setEditStatus } = this.props.actions;
    setEditStatus('company', true);
  }


  onUploadChange = (name, info) => {
    console.log(info)
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
      const url = fileList[0].response.data;
      this.form.setValue(name, url);
      message.success(`${info.file.name} 上传成功`, 3);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`, 3);
    } else if (info.file.status === 'removed') {
      this.form.setValue(name, '');
    }
  }

  areaFilter = (obj) => {
    if (obj && obj !== 'null') return obj;
    return '';
  }



  render() {
    const colLeft = {
      span: 11,
    }
    const colRight = {
      span: 11,
      offset: 1,
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
        xl: { span: 8 },
        xxl: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 16 },
        xl: { span: 16 },
        xxl: { span: 19 },
      },
    };


    const { updateForm={}, isEditing=false } = this.props;
    const { status } = updateForm;
    const canEdit = status !== 0;
    const companyAddress = _.get(updateForm, "company.companyAddress", "");
    const areaAray = _.get(updateForm, "company.areaArray", []);
    const address = ((areaAray && areaAray.join("")) || "") + companyAddress;
    const accountAllType = "行政类";
    const companyTypeMap = [ '其他', '原厂商', '代理商'];
    const companyType = companyTypeMap[_.get(updateForm, 'company.companyType', 0)];
    const typeList = [
      '办公用品',
      '餐厅物资',
      '工程物品',
      '广告物料',
      '行政服务',
      '严选用品',
    ];


    return (
      <div id="sation-company">
        <FormEx2
          defaultValues={updateForm}
          onChange={(values) => { this.onFormChange(values) }}
          ref={(f) => { this.form = f }}
          layout="inline"
        >

          <OpHeader name="公司信息" isEditing={isEditing} onEdit={this.onEdit} canEdit={canEdit} />

          <section className={`g-wrapper ${!isEditing ? 's-edit' : ''}`}>
            <Row className="u-ct" >
              <Col {...colLeft} >
                <Item
                  {...formItemLayout}
                  label="公司名称"
                  dataIndex="company.companyName"
                  decorator={
                    isEditing?
                      <Input maxLength={maxLength} placeholder="请输入公司名称" />:
                      <span>{_.get(updateForm, 'company.companyName', '')}</span>
                  }
                />

              </Col>
              <Col {...colRight}>
                {/*<Item*/}
                {/*  {...formItemLayout}*/}
                {/*  label="业务范围"*/}
                {/*  dataIndex="company.bizScopes"*/}
                {/*  decorator={*/}

                {/*    <span>{*/}
                {/*      // accountAllType*/}
                {/*      _.get(updateForm, "company.bizScopes", []).join("，")*/}
                {/*      // _.get(updateForm, "company.bizScopes",[])*/}
                {/*    }</span>*/}
                {/*  }*/}
                {/*/>*/}


                {isEditing ? (
                  <Item
                    {...formItemLayout}
                    label="业务范围"
                    required
                    dataIndex="company.bizScopes"
                    rules={[{ required: true, message: "请选择公司经营业务范围" }]}
                    isTrim={true}
                    decorator={
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder="请选择业务类型"
                      >
                        {typeList.map((value) => (
                          <Option key={value} value={value}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    }
                  />
                ) : (
                  <Item
                    {...formItemLayout}
                    label="业务范围"
                    dataIndex="company.bizScopes"
                    decorator={

                      <span>{
                        // accountAllType
                        _.get(updateForm, "company.bizScopes", []).join("，")
                        // _.get(updateForm, "company.bizScopes",[])
                      }</span>
                    }
                  />
                )}

              </Col>
            </Row>
            <Row className="u-ct">
              <Col {...colLeft}>
                <Item
                  {...formItemLayout}
                  label="公司地址"
                >
                  <Item
                    // {...formItemLayout}
                    label=""
                    dataIndex="company.areaArray"
                    rules={[
                      { required: true, message: "请选择省市区" }
                    ]}
                    style={{
                      display:"inline-block",
                      width:"200px"
                    }}
                    decorator={
                      isEditing?
                        <Cascader  options={Address} placeholder="省/市/区" />:
                        <span>{address}</span>
                    }
                  />
                  <Item
                    //  {...formItemLayout}
                    label=""
                    dataIndex="company.companyAddress"
                    rules={[
                      { required: true, message: "请输入详细地址" }
                    ]}
                    style={{
                      display: "inline-block",
                      width: "250px",
                      height: "36px"
                    }}
                    decorator={
                      isEditing?
                        <Input maxLength={maxLength} placeholder="请输入详细地址" />:
                        <span></span>
                    }
                  />
                </Item>
              </Col>
              <Col {...colRight}>
                <Item
                  {...formItemLayout}
                  label="供应级别"
                  rules={[{ required: true, message: '请选择供应级别' }]}
                  dataIndex="company.companyType"
                  decorator={
                    isEditing ?
                      <Select placeholder="请选择供应级别" >
                        {companyTypeMap.map((value, index) => <Option key={index} value={index}>{value}</Option>)}
                      </Select>                  
                      : <span>{companyType}</span>
                  }
                />
              </Col>
            </Row>
          </section>
        </FormEx2>
      </div>
    );
  }
}


// 公司信息详情
const mapStateToProps = (state) => {
  return {
    updateForm: state.infoPublic.updateForm,
    status:state.infoPublic.status,
    uploadProps: state.app.uploadProps,
  };
}


export default connect(mapStateToProps, dispatchs('app', 'infoPublic'), null, { forwardRef: true })(Company)
