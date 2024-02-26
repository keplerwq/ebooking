import React, { Component } from "react";
import "./index.scss";
import { LeftOutlined } from '@ant-design/icons';
export default class Header extends Component {
  static defaultProps = {
    name: "",
    showBack: false,
    isTitle: false,
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const {showBack,handleClick,isTitle,name,children} = this.props;
    return (
      <div className="page-header">
        {showBack && (
          <LeftOutlined onClick={handleClick || this.goBack} />
        )}
        <span className={isTitle ? "title" : ""}>
          {name}
        </span>
        {children}
      </div>
    );
  }
}
