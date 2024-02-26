import React, { Component } from "react";
import "./index.scss";

export default class PdfPreview extends Component {
  static defaultProps = {
    previewing: false,
    url: "",
    mode: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      pdfDoc: null,
      pageNum: 1,
      pageCount: 0,
      pageRendering: false,
      pageNumPending: null,
    };
  }

  componentDidMount() {
    this.preview()
  }

  preview = async () => {}

  render() {
    return <div></div>;
  }
}
