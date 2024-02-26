/*
<MultiLineVerification 
  verifyResult={this.state.result} 
  onVerify={this.onVerify.bind(this)}
  placeholder={['http://example.com/test', 'http://example.com/test.png']} 
/>
*/
import React, { Component } from 'react';
import { Tag, Tooltip } from 'antd';
import _ from 'lodash';
import './MultiLineVerification.scss';

function htmlEncode(str) {
  // console.log(str);
  let value = /<!--StartFragment-->(\S*)<!--EndFragment-->/.exec(str);
  if (value) {
    value = value[1];
  } else {
    value = str;
  }
  // value.replace(/<br\/>/g, "\n");
  value = value.replace(/<br>/g, '\n');
  // console.log(value);
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(value));
  // let html = div.innerHTML.replace(/\n/g, "<br/>");
  // console.log(div.innerHTML)
  return div.innerHTML;
}

// function htmlEncode(str) {
//   var s = "";
//   if (str.length === 0) return "";
//   s = str.replace(/&/g, "&gt;");
//   s = s.replace(/</g, "&lt;");
//   s = s.replace(/>/g, "&gt;");
//   // s = s.replace(/ /g, "&nbsp;");
//   // s = s.replace(/\'/g, "&#39;");
//   // s = s.replace(/\"/g, "&quot;");
//   // s = s.replace(/\n/g, "<br/>");
//   return s;
// }


class MultiLineVerification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      rows: [''],
      verifyResult: [], // object[] [{text: text,success: true,error: '',tips: ''}]
      html: '',
    };
  }

  static defaultProps = {
    className: '',
    placeholder: '', // 字符串或者数组
    render: (result, index) => {}, // 检验结果render函数
    verifyResult: [], // 校验结果
    onVerify: () => {}, // 校验函数 参数: items每行数据数组
    debounceSec: 500, // 校验间隔时间
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      verifyResult: nextProps.verifyResult
    });
  }

  onVerify = _.debounce(function(list) {
    this.props.onVerify(list);
    // console.log(list);
  }, this.props.debounceSec);

  onChange = (e) => {

    let list = e.target.innerText.split(/\n/);
    console.log(list);
    if (list.length > 1 && list[list.length - 1] === '') {
      list.pop();
    }
    this.setState({
      value: e.target.innerText,
      rows: list,
    });
    this.onVerify(list);
  }

  insert = (str) => {
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let textNode = range.startContainer;
    let rangeStartOffset = range.startOffset;
    let edit = this.edit;
    let list = str.split(/\n/).reverse();

    if (selection.anchorNode.nodeName === '#text') {
      let text = document.createTextNode(list[0]);
      edit.appendChild(text);
      list.splice(0, 1);
    }
    console.log(list);
    let nodes = list.map(x => document.createTextNode(x));
    if (edit.childNodes.length > 0) {
      // 如果文本框的子元素大于0，则表示有其他元素，则按照位置插入表情节点
      // edit.insertBefore(text, edit.childNodes[i]);
      nodes.forEach(node => {
        edit.insertBefore(node, edit.childNodes[selection.anchorOffset]);
        edit.insertBefore(document.createElement("br"), edit.childNodes[selection.anchorOffset]);
      });
    } else {
      // 否则直接插入一个表情元素
      // edit.appendChild(text);
      nodes.forEach(node => {
        edit.appendChild(node);
        edit.appendChild(document.createElement("br"));
      });
    }

    // if (selection.anchorNode.nodeName !== '#text') {

    //   let nodes = list.map(x => document.createTextNode(x));
    //   if (edit.childNodes.length > 0) {
    //     // 如果文本框的子元素大于0，则表示有其他元素，则按照位置插入表情节点
    //     // edit.insertBefore(text, edit.childNodes[i]);
    //     nodes.forEach(node => {
    //       edit.insertBefore(node, edit.childNodes[selection.anchorOffset]);
    //       edit.insertBefore(document.createElement("br"), edit.childNodes[selection.anchorOffset]);
    //     });
    //   } else {
    //     // 否则直接插入一个表情元素
    //     // edit.appendChild(text);
    //     nodes.forEach(node => {
    //       edit.appendChild(node);
    //       if (nodes.length > 1)
    //         edit.appendChild(document.createElement("br"));
    //     });
    //   }
    //   // 创建新的光标对象
    //   let range = document.createRange();
    //   // 光标对象的范围界定为新建的表情节点
    //   range.selectNodeContents(text);
    //   // 光标位置定位在表情节点的最大长度
    //   range.setStart(text, text.length);
    // } else {
    //   textNode.insertData(rangeStartOffset, str);
    //   range.setStart(textNode, rangeStartOffset + str.length);
    // }
    // 使光标开始和光标结束重叠
    range.collapse(true);
    // 清除选定对象的所有光标对象
    selection.removeAllRanges();
    // 插入新的光标对象
    selection.addRange(range);
  }

  onPaste(e, value) {
    e.preventDefault();
    e.persist();
    console.log(e.clipboardData.items[0]);
    e.clipboardData.items[0].getAsString((str) => {
      this.insert(htmlEncode(str));
      // this.insert(str);
      this.onChange(e);
    });
    // let existingText = e.target.innerText;
    // setTimeout(() => {
    //   let list = e.target.innerText.split(/\n/);
    //   let encodeList = [];
    //   for (let x of list) {
    //     encodeList.push(htmlEncode(x));
    //   }
    //   e.target.innerHTML = encodeList.join('<br/>');
    // });
  }

  render() {
    let self = this;

    function Placeholder() {
      let placeholderList = self.props.placeholder
      if (self.state.rows.join() !== '') {
        return null;
      }
      if (_.isString(placeholderList)) {
        placeholderList = [placeholderList];
      }
      if (_.isArray(placeholderList)) {
        return (
          <div className="multi-line-placeholder-box">
            {self.props.placeholder.map((x, i) => 
              <div className="multi-line-placeholder" key={`mult-line-placeholder-${i}`}>{x}</div>
            )}
          </div>
        );
      }
      return null;
    }

    return (
      <div className="nasa-multi-line2">
        <div className="multi-line-result">
          {this.state.rows.map((x, i) => {
            let tips = null;
            if(this.state.verifyResult[i]){
              tips = this.props.render(this.state.verifyResult[i], i);
            }
            // if(res && res.success === false){
            //   tips = <Tooltip placement="right" title={res.tips}><Tag color="red">{res.error}</Tag></Tooltip>
            //   className += ` red`;
            // }
            return (
              <div className="multi-line-result-row" key={i+'res'}>
                <span className="text">{x}</span>
                <div className="multi-line-tooltip">
                  {tips}
                </div>
              </div>
            )
          })}
        </div>
        <div className={`multi-line-edit ${this.props.className}`}
          dangerouslySetInnerHTML={{__html: this.state.html}}
          contentEditable="true"
          onInput={this.onChange}
          onPaste={this.onPaste.bind(this)}
          ref={(edit)=> this.edit = edit}
        >
        </div>{
          <Placeholder />
        }
      </div>
    )
  }
}

export default MultiLineVerification;
