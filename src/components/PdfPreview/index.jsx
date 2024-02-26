import React, { Component } from "react";
import { Button } from "antd";
import { Document, Page, pdfjs} from "react-pdf";
import "./index.scss";

pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.js/2.5.207/pdf.worker.js';
export default class PdfPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNum: 1,
      pageCount: 0,
      prevLoading: false,
      nextLoading: false,
    };
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({
      pageCount: numPages,
    });
    console.log("onDocumentLoadSuccess");
  };

  onPageRenderSuccess = () => {
    this.setState({
      prevLoading: false,
      nextLoading: false,
    });
    console.log("onPageRenderSuccess");
  };

  onPrevPage = () => {
    let pageNum = this.state.pageNum;
    if (pageNum <= 1) {
      return;
    }
    let prevLoading = true;
    pageNum--;

    this.setState({ prevLoading });

    setTimeout(() => {
      this.setState({ pageNum });
    }, 0);
    console.log("onPrevPage");
  };

  onNextPage = () => {
    let { pageCount } = this.state;
    let pageNum = this.state.pageNum;
    if (pageNum >= pageCount) {
      return;
    }
    let nextLoading = true;
    pageNum++;

    this.setState({ nextLoading });

    setTimeout(() => {
      this.setState({ pageNum });
    }, 0);
    console.log("onNextPage");
  };

  render() {
    let { pageNum, pageCount, prevLoading, nextLoading } = this.state;
    let { file } = this.props;
    let url = (file && file.fileUrl) || "";
    return (
      <div className="pdf-preview">
        <Document
          loading="加载中"
          noData="暂无文件"
          error="文件加载失败"
          file={url}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <Page
            onRenderSuccess={this.onPageRenderSuccess}
            pageNumber={pageNum}
          />
        </Document>
        {pageCount && (
          <div style={{ textAlign: "center" }} className="page-wrapper">
            <Button
              loading={prevLoading}
              type="primary"
              onClick={this.onPrevPage}
              disabled={pageNum == 1}
            >
              上一页
            </Button>
            <span className="page-count">
              <span>{pageNum}</span>/<span>{pageCount}</span>
            </span>
            <Button
              loading={nextLoading}
              type="primary"
              onClick={this.onNextPage}
              disabled={pageNum == pageCount}
            >
              下一页
            </Button>

            {this.props.children}
          </div>
        )}
      </div>
    );
  }
}
