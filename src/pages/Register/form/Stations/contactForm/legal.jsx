// 联系信息
import React, { Component } from "react";
import dispatchs from "src/redux/dispatchs";
import { connect } from "react-redux";
import { Input, Select } from "antd";
import { FormEx2 } from "src/components";
import { descriptor } from "src/libs";

const { Item } = FormEx2;
const { Option } = Select;
const telLength = 11;

class Legal extends Component {
  componentWillReceiveProps(props) {
    const { registerForm } = props;
    if (registerForm) {
      this.form && this.form.setValues(registerForm);
    }
  }

  onFormChange = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  handleSubmit = (values) => {
    const { freshForm } = this.props.actions;
    freshForm(values);
  };

  render() {
    const { registerForm = {} } = this.props;

    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16, offset: 1 },
    };

    return (
      <div className="m-contact">
        <div className="u-sub-header">
          <span className="u-line"></span>
          <span className="u-sub-tt">法定代表人信息</span>
          <span className="u-line"></span>
        </div>

        <div className="u-form">
          <FormEx2
            defaultValues={registerForm}
            onSubmit={(values) => {
              this.handleSubmit(values);
            }}
            onChange={(values) => {
              this.onFormChange(values);
            }}
            ref={(f) => {
              this.form = f;
            }}
          >
            <Item
              {...formItemLayout}
              required
              className="u-form-group"
              label="法定代表人姓名"
              style={{ marginBottom: 0 }}
            >
              <Item
                colon={false}
                isTrim={true}
                dataIndex="contactInfo.legalContact.contactName"
                rules={[{ required: true, message: "请输入联系人姓名" }]}
                style={{
                  display: "inline-block",
                  width: "calc(100% - 96px)",
                  marginRight: "6px",
                }}
                decorator={<Input placeholder="请输入联系人姓名" />}
              />
              <Item
                colon={false}
                defaultValue="先生"
                dataIndex="contactInfo.legalContact.gender"
                style={{
                  display: "inline-block",
                  width: "90px",
                }}
                decorator={
                  <Select style={{ width: "90px" }}>
                    <Option value="先生">先生</Option>
                    <Option value="女士">女士</Option>
                  </Select>
                }
              />
            </Item>

            <Item
              {...formItemLayout}
              colon={false}
              label="手机号"
              required
              isTrim={true}
              dataIndex="contactInfo.legalContact.mobilePhone"
              rules={[
                { required: true, message: "请输入联系人手机号码" },
                descriptor.telephone,
              ]}
              decorator={
                <Input
                  maxLength={telLength}
                  placeholder="请输入联系人手机号码"
                />
              }
            />
            <Item
              {...formItemLayout}
              colon={false}
              label="邮箱"
              required
              isTrim={true}
              dataIndex="contactInfo.legalContact.contactEmail"
              rules={[
                { required: true, message: "请输入联系人邮箱地址" },
                descriptor.email,
              ]}
              decorator={<Input placeholder="请输入联系人邮箱地址" />}
            />
          </FormEx2>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    registerForm: state.register.registerForm,
  };
};

export default connect(
  mapStateToProps,
  dispatchs("app", "register"),
  null,
  { forwardRef: true }
)(Legal)