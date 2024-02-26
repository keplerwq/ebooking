
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Content } from 'src/components';
import api from 'src/api';
import dispatchs from 'src/redux/dispatchs';
import './Backlog.scss';

const titleMap = {
  order: { title: '订单管理', key: 0 },
  inquiry: { title: '报价管理', key: 1 },
  orderAss: { title: '售后管理', key: 2 },
  account: { title: '账务管理', key: 3 },
};

const itemMap = {
  waitOrderNum: {
    name: '待发货订单数',
    path: '/order',
    params: 'WAIT_DELIVER',
    showNum: true
  },
  canceOrderNum: {
    name: '近7天内新增取消订单数',
    path: '/order',
    params: 'CANCELED',
    showNum: true
  },
  priceNum: {
    name: '待报价订单数',
    path: '/quote',
    params: 'INQUIRY',
    showNum: true
  },
  confirmPriceNum: {
    name: '近7天报价已确认订单数',
    path: '/quote',
    params: 'CONFIRMED',
    showNum: true
  },
  waitASSNum: {
    name: '待处理售后订单数',
    path: '/aftersale',
    params: 'WAIT_APPROVE',
    showNum: true
  },
  waitCheckNum: {
    name: '待确认账单数',
    path: '/account',
    params: 'WAIT_CONFIRM',
    showNum: true
  },
  alreadyCheck: {
    name: '账单已打款',
    path: '/account',
    params: 'FILING',
    showNum: false
  }
}

class Backlog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backlogs: []
    };
  }

  componentDidMount() {
    api.queryBacklogList().then((res) => {
      if (res.code === 0) {

        let list = Object.keys(res.msg).map(elem => {
          let backlog = {
            title: titleMap[elem].title,
            key: titleMap[elem].key,
            value: []
          };
          let keys = Object.keys(res.msg[elem]);
          for (let i in keys) {
            let info = {
              num: res.msg[elem][keys[i]],
              ...itemMap[keys[i]]
            };
            if (keys[i] === 'alreadyCheck') {//没有账单则不显示,且不显示分隔线
              if (!res.msg[elem][keys[i]]) {
                continue;
              }
              info.params = `${info.params}/${info.num}`
            }
            backlog.value.push(info);
          }

          return backlog;
        });
        list.sort((a, b) => { return a.key - b.key });
        console.log(list)
        this.setState({ backlogs: list })
      }
    });
  }

  goPage = (path, params) => {
    this.props.history.push({
      pathname: `${path}/${params}`,
    })
  }

  render() {
    const { backlogs } = this.state;

    return (
      <Content size="full">
        <div className="m-backlog">
          {backlogs.map(page => {
            return (
              <div className="u-panel" key={page.title}>
                <div className="m-title u-span">
                  {page.title}
                </div>
                <div className="m-items">
                  {page.value.map((item, index) => {
                    return (
                      item && <div className="m-item" key={index}>
                        {item.showNum ? <div className="u-num">
                          {item.num}
                        </div> : ''}
                        <div className="u-name">
                          {item.name === '账单已打款' ? item.num : ''}{item.name}
                        </div>
                        <div className="u-link">
                          <a onClick={() => this.goPage(item.path, item.params)}>{'前往查看 >'}</a>
                        </div>
                        {index != (page.value.length - 1) ? <div className="u-line"></div> : ''}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Content>

    );
  }
}


const mapStateToProps = () => ({})

const BacklogWithConnect = connect(mapStateToProps, dispatchs('app'))(Backlog)

export default function BacklogWithConnectPage(props) { return <BacklogWithConnect {...props} />; }