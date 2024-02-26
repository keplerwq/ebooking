import React, { Component } from 'react';
import { connect, } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';
import dispatchs from 'src/redux/dispatchs';
import api from 'src/api';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { ConsoleSqlOutlined, LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Layout, Menu, Popover, Button, Badge, Dropdown } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { AuthTreeContext } from 'src/libs/context';
import createAuthTree from 'src/libs/authTree';
import supplyInfoIcon from 'src/resource/img/menu/supplyInfo.png';
import supplyInfoSelIcon from 'src/resource/img/menu/supplyInfoSel.png';
import homeIcon from 'src/resource/img/menu/home.png';
import homeSelIcon from 'src/resource/img/menu/homeSel.png';
// import supplyIcon from 'src/resource/img/menu/supply.png';
import orderIcon from 'src/resource/img/menu/order.png';
import orderSelIcon from 'src/resource/img/menu/orderSel.png';
import quoteIcon from 'src/resource/img/menu/quote.png';
import quoteSelIcon from 'src/resource/img/menu/quoteSel.png';
import aftersaleIcon from 'src/resource/img/menu/aftersale.png';
import aftersaleSelIcon from 'src/resource/img/menu/aftersaleSel.png';
import accountIcon from 'src/resource/img/menu/account.png';
import accountSelIcon from 'src/resource/img/menu/accountSel.png';
import title from 'src/resource/img/menu/title.png';
import titleSmall from 'src/resource/img/menu/titlesmall.png';
import inquiry from 'src/resource/img/supplier/menu/unsel/inquiry.png';
import inquirySel from 'src/resource/img/supplier/menu/sel/inquiry.png';
import quoted from 'src/resource/img/supplier/menu/unsel/quoted.png';
import quotedSel from 'src/resource/img/supplier/menu/sel/quoted.png';
import contract from 'src/resource/img/supplier/menu/unsel/contract.png';
import contractSel from 'src/resource/img/supplier/menu/sel/contract.png';
import backOrders from 'src/resource/img/supplier/menu/unsel/backOrders.png';
import backOrdersSel from 'src/resource/img/supplier/menu/sel/backOrders.png';
import sn from 'src/resource/img/supplier/menu/unsel/sn.png';
// import snSel from 'src/resource/img/supplier/menu/sel/sn.png';

import './App.scss';

const UNIVERSAL = '通用类';

const RESOURCES = '资源类';

const SERVERANDNETWORK = '服务器及网络设备相关';

const ADMINISTRATION = '行政类';

const INFRASTRUCTURE = '基建类';

const supplierTypeEnum = {
  '0': UNIVERSAL,
  '1': RESOURCES,
  '2': SERVERANDNETWORK,
  '10': ADMINISTRATION,
  '20': INFRASTRUCTURE
}

const { Header,/* Footer, */Sider, Content } = Layout;
const { SubMenu } = Menu;

const isNewEdition = () => !!localStorage.getItem('NEW_EDITION');

const SupplierGuide = function () {

  const type = sessionStorage.getItem('isAccountType');

  const getPdfUrl = (type) => {
    let name = '';
    switch (type) {
      case '0':  name = 'it'; break;
      case '1':  name = 'resource'; break;
      case '2':  name = 'hardware'; break;
      case '10':  name = 'administrative'; break;
      default: console.error('没有匹配！');
    }

    return name ? `/resource/supplier-guide/${name}.pdf` : false;
  }

  const url = getPdfUrl(type);

  return (
    <span
      onClick={() => window.open(url)}
      style={{
        cursor: 'pointer',
        display: url ? void 0 : 'none'
      }}>
      <QuestionCircleOutlined />
      {' 帮助'}
    </span>
  )
}

class App extends Component {
  constructor(props) {
    super(props);
    const supplierTypeDefault = sessionStorage.getItem('isAccountType')
    let accountTypes = sessionStorage.getItem('accountTypes');
    let supplierTypeOpts = []
    if (accountTypes) {
      accountTypes = accountTypes.split(',')
      supplierTypeOpts = accountTypes.map((key) => ({
        accountType: key,
        label: supplierTypeEnum[key]
      }))
    }
    const oneType = sessionStorage.getItem('oneType');
    this.state = {
      supplierTypeDefault,
      supplierType: supplierTypeEnum[oneType || supplierTypeDefault],
      supplierTypeOpts,
      menuList: [],
      sysList: [],
      collapsed: false,
      selectedKeys: [],
      supplierList: [],
      // 这个方法是在新鉴权体系中替代旧的 isLogin 方法的
      isAuthorized: false,
      username: '',
      componyName: '',
      authTree: null,
    };
  }
  static defaultProps = {}

  // 鉴权路由，后台给予权限的才可以暴露给用户
  // 新增的页面需要在 src/libs/authTree 目录中进行配置，
  // administrative、backend、hardware、resource 分别对应：行政、后台、硬件、资源
  initAuthTree() {
    return api.authorization().then(({ code, data }) => {
      if (code !== '0') throw Error ('获取权限控制失败，请联系管理员');

      const updateAuthTreeConf = (tree) => {
        const {list, current} = tree?.extractive;
        this.setState({
          menuList: list?.menu,
          sysList: list?.sys,
          currentSys: current?.sys,
          openKeys: [current?.menu?.parent?.code],
        })
      }

      return createAuthTree(data).then(tree => {
        this.setState({ isAuthorized: Boolean(tree) });
        // 添加监听
        tree?.addMatchedWatcher?.((tree) => {
          console.log('[watch] 当路由发生改变时 >', tree);
          updateAuthTreeConf(tree);
        });

        // 如果当前 url 拥有访问权限则正常访问，
        // 否则重定向回 defaultPath
        if (tree?.matched) {
          updateAuthTreeConf(tree);
        } else {
          this.props.history.replace(tree?.defaultPath);
        }

        this.setState({authTree: tree});
        return tree;
      })
    });
  }
  
  // 获取采购商实体列表
  getMySupplierEntities() {
    api.getMySupplierEntities().then(({code, data}) => {
      if (code === '0' && data?.length) {
        this.setState({supplierList: [...data]});
      }
    });
  }

  getUserInfo() {
    return api.userInfo()
      .then(({data, code}) => {
        if (code === '0')
          // 这里使用 local 是因为暂时使用到的都不是渲染层面的。
          localStorage.setItem('USER_META_INFO', JSON.stringify(data));

        const username = data?.userBaseInfo?.userName;
        const companyName = data?.supplierInfoDO?.companyName;

        this.setState({username, companyName});
      });
  }

  async initApp() {
    await this.getUserInfo();
    this.getMySupplierEntities();
    this.initAuthTree();
  }

  componentWillUnmount() {
    // 卸载鉴权路由
    this.state.authTree?.unmounted?.();
    localStorage.removeItem('USER_META_INFO');
  }

  componentDidMount() {
    this.setMenu();
    
    // 以下方法是新的鉴权体系需要使用的
    if (isNewEdition()){
      this.initApp();
    } else {
    // 菜单初始化获取待报价条数
      this.fetchInfo();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // 每次页面变更会执行两次一下函数
    this.setMenu();
  }

  async fetchInfo (accounttype) {
    this.props.actions.setQuotedTotal();
    this.props.actions.setBillingTotal();
    await this.props.actions.authGetInfo(accounttype);

    import('../QuoteCommon/reduxJs/asyncActions')
      .then(({getQuoteList}) => {
        this.props.dispatch(getQuoteList())
      })
  }

  sysChange(sys) {
    this.setState({currentSys: sys});

    this.props.history.push(sys.defaultPath || sys.notfoundPath);
  };


  componentWillReceiveProps(nextProps) {
    const { userInfo } = nextProps;
    if (!_.isEqual(userInfo, this.props.userInfo)) {
      this.createMenuData(userInfo);
    }
  }

  createMenuData = (userInfo) => {
    const { menuItemObj } = this.props;

    let deniedItems = [];
    let admitItems = [];

    for (let key in menuItemObj) {
      if (userInfo[key]) {
        admitItems.push(menuItemObj[key]);
      } else {
        deniedItems.push(menuItemObj[key]);
      }
    }

    this.setState({ admitItems, deniedItems });
  }

  // 更新菜单
  setMenu = () => {
    let modulePath = this.props.location.pathname.match(/(\/[a-zA-Z0-9]*)/)[1] || 'backlog';
    if (this.state.selectedKeys[0] !== modulePath) {

      this.setState({
        selectedKeys: [modulePath],
      });
    }
  }


  handleSelectChange = ({ key, item }) => {
    const { accounttype } = item.props
    const { supplierType } = this.state
    if (key === supplierType) {
      return
    }
    this.setState({
      supplierType: key
    })
    this.fetchInfo(accounttype)
    const { location } = this.props.history
    switch (location.pathname) {
      case '/info':
        this.props.history.push({
          pathname: '/resourcesInfo'
        })
        break;
      case '/resourcesInfo':
        this.props.history.push({
          pathname: '/info'
        })
        break;
      default:
        break;
    }
    console.log(1231232,'213123')
  }

  onOpenChange = (openKeys) => {
    this.setState({
      openKeys
    })
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }

  onMenuSelect = ({ selectedKeys }) => {
    this.setState({
      selectedKeys: selectedKeys
    });
  }

  logout = () => {
    const request = isNewEdition() ? api.logoutService : api.logout;
    request().then(res => {
      sessionStorage.setItem('isLinkToLogin', '0');
      this.props.history.push('/login');
      /* 清除redux store */
      window.location.reload();
    });
  }

  goBack = (pathName) => {
    if (pathName === '/order' || pathName === '/resourcesAccount') {
      this.props.history.goBack();
    }
    else {
      this.props.history.push({
        pathname: pathName,
        search: this.props.history.location.search
      });
    }
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  renderTitle = () => {
    const { selectedKeys = [] } = this.state;

    if (selectedKeys && selectedKeys[0]) {
      switch (selectedKeys[0]) {
        // case '/info':
        //   return <div className="m-sub-header"><span>供应商状态:  {mapStatusToText(userInfo.status)}</span></div>;
        case '/order':
          return <div className="m-sub-header"><span>订单管理</span></div>
        case '/quote':
        case '/quoteCommon':
          return <div className="m-sub-header"><span>报价管理</span></div>
        case '/quoteCommonQuotation':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/order')}></Button>
              <span className="u-header">线上报价</span>
            </div>
          );
        case '/quoteCommonDetail':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/order')}></Button>
              <span className="u-header">询报价详情</span>
            </div>
          );
        case '/orderdetail':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/order')}></Button>
              <span className="u-header">订单管理详情</span>
            </div>
          );
        case '/account':
          return <div className="m-sub-header"><span>账务管理</span></div>
        case '/accountdetail':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/account')}></Button>
              <span className="u-header">账务明细详情</span>
            </div>
          );
        case '/aftersale':
          return <div className="m-sub-header"><span>售后管理</span></div>
        case '/backlog':
          return <div className="m-sub-header"><span>待办事项</span></div>

        case '/resourcesAccountDetail':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/resourcesAccount')}></Button>
              <span className="m-sub-header">账单</span></div>
          );
        case '/resourcesAccountAdd':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/resourcesAccount')}></Button>
              <span className="m-sub-header">新建账单</span></div>
          );
        case '/resourcesQuoteDetail':
          return (
            <div className="m-sub-header">
              <Button size="small" icon={<LeftOutlined />} className="u-btn" onClick={() => this.goBack('/resourcesQuote')}></Button>
              <span className="m-sub-header">报价</span></div>
          );
        default:
          return ''
      }
    }
  }

  render() {
    const {
      selectedKeys,
      collapsed,
      supplierList,
      openKeys,
      sysList,
      currentSys,
      isAuthorized,
      username,
      companyName,
      supplierType
    } = this.state;
    const { billingTotal, quotedTotal, quoteCommonCount } = this.props;

    const menu = (
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={this.onMenuSelect}
      >
        <Menu.Item key="/backlog">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/backlog' ? homeSelIcon : homeIcon} alt="" />
          {/* <img className="icon-sel" src={homeSelIcon} alt="" /> */}
          <span>首页</span>
          <Link to="/backlog"></Link>
        </Menu.Item>
        <Menu.Item key="/info">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/info' ? supplyInfoSelIcon : supplyInfoIcon} alt="" />
          {/* <img className="icon-sel" src={supplyInfoSelIcon} alt="" /> */}
          <span>供应商信息</span>
          <Link to="/info"></Link>
        </Menu.Item>
        <Menu.Item key="/order">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/order' ? orderSelIcon : orderIcon} alt="" />
          {/* <img className="icon-sel" src={orderSelIcon} alt="" /> */}
          <span>订单管理</span>
          <Link to="/order"></Link>
        </Menu.Item>
        <Menu.Item key="/quote">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/quote' ? quoteSelIcon : quoteIcon} alt="" />
          {/* <img className="icon-sel" src={quoteSelIcon} alt="" /> */}
          <span>报价管理(旧)</span>
          <Badge className="badge" count={quotedTotal} />
          <Link to="/quote"></Link>
        </Menu.Item>
        <Menu.Item key="/quoteCommon">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/quoteCommon' ? quoteSelIcon : quoteIcon} alt="" />
          <span>报价管理(新)</span>
          <Badge className="badge" count={quoteCommonCount > 99 ? '99+': quoteCommonCount} />
          <Link to="/quoteCommon"></Link>
        </Menu.Item>
        <Menu.Item key="/aftersale">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/aftersale' ? aftersaleSelIcon : aftersaleIcon} alt="" />
          <span>售后管理</span>
          <Link to="/aftersale"></Link>
        </Menu.Item>
        <Menu.Item key="/account">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/account' ? accountSelIcon : accountIcon} alt="" />
          <span>账务管理</span>
          <Badge className="badge" count={billingTotal} />
          <Link to="/account"></Link>
        </Menu.Item>
      </Menu>
    );
    const menuResources = (
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={this.onMenuSelect}
      >
        <Menu.Item key="/resourcesInfo">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesInfo' ? supplyInfoSelIcon : supplyInfoIcon} alt="" />
          <span>供应商信息</span>
          <Link to="/resourcesInfo"></Link>
        </Menu.Item>
        <Menu.Item key="/resourcesQuote">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesQuote' ? quoteSelIcon : quoteIcon} alt="" />
          <span>报价管理</span>
          <Badge className="badge" count={quotedTotal} />
          <Link to="/resourcesQuote"></Link>
        </Menu.Item>
        <Menu.Item key="/resourcesAccount">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesAccount' ? accountSelIcon : accountIcon} alt="" />
          <span>账务管理</span>
          <Badge className="badge" count={billingTotal} />
          <Link to="/resourcesAccount"></Link>
        </Menu.Item>
      </Menu>
    )
    const menuPublic = (
      // menuPublic 已经改为通过后台获取需要暴露的 menu
      // 其他模块后续会陆续接入
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onOpenChange={this.onOpenChange}
        openKeys={openKeys}
        onSelect={this.onMenuSelect}
      >
        {
          this.state.menuList?.map(menu => {
            return menu.path ?
              (
                <Menu.Item key={menu.path} icon={supplyInfoIcon}>
                  <span>{menu.name}</span>
                  <Link to={menu.path}></Link>
                </Menu.Item>
              ) :
              (
                <SubMenu key={menu.code} title={menu.name}>
                  {
                    menu?.children?.map(subMenu =>
                      <Menu.Item key={subMenu.path}>
                        <img src={selectedKeys[0] == '/resourcesAccount' ? supplyInfoSelIcon : supplyInfoIcon} alt="" />
                        <span>{subMenu.name}</span>
                        <Link to={subMenu.path}></Link>
                      </Menu.Item>
                    )
                  }
                </SubMenu>
              )
          })
        }
      </Menu>
    );
    
    const menuBase = (
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={this.onMenuSelect}
      >     
        <Menu.Item key="/baseHome">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/baseHome' ? homeSelIcon : homeIcon} alt="" />
          <span>首页</span>
          <Link to="/baseHome"></Link>
        </Menu.Item>
        <Menu.Item key="/baseInfo">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/baseInfo' ? supplyInfoSelIcon : supplyInfoIcon} alt="" />
          <span>供应商信息</span>
          <Link to="/baseInfo"></Link>
        </Menu.Item>
        <Menu.Item key="/baseBidding">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/baseBidding' ? accountSelIcon : accountIcon} alt="" />
          <span>投标管理</span>
          <Link to="/baseBidding"></Link>
        </Menu.Item>
      </Menu>
    );

    const hardwareMenuResources = (
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onSelect={this.onMenuSelect}
      >
        <Menu.Item key="/resourcesInfo">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesInfo' ? supplyInfoSelIcon : supplyInfoIcon} alt="" />
          <span>供应商信息</span>
          <Link to="/resourcesInfo"></Link>
        </Menu.Item>
        <Menu.Item key="/resourcesQuote">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesQuote' ? quoteSelIcon : quoteIcon} alt="" />
          <span>报价管理</span>
          <Badge className="badge" count={quotedTotal} />
          <Link to="/resourcesQuote"></Link>
        </Menu.Item>
        <Menu.Item key="/resourcesAccount">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/resourcesAccount' ? accountSelIcon : accountIcon} alt="" />
          <span>账务管理</span>
          <Badge className="badge" count={billingTotal} />
          <Link to="/resourcesAccount"></Link>
        </Menu.Item>
        <Menu.Item key="/supplierInquiry">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/supplier/inquiry' ? inquiry : inquirySel} alt="" />
          <span>询价</span>
          <Link to="/supplierInquiry"></Link>
        </Menu.Item>
        <Menu.Item key="/supplierQuoted">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/supplier/quoted' ? quoted : quotedSel} alt="" />
          <span>已报价</span>
          <Link to="/supplierQuoted"></Link>
        </Menu.Item>
        <Menu.Item key="/supplierContract">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/supplier/contract' ? contract : contractSel} alt="" />
          <span>合同</span>
          <Link to="/supplierContract"></Link>
        </Menu.Item>
        <Menu.Item key="/supplierBackOrders">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/supplier/backOrders' ? backOrders : backOrdersSel} alt="" />
          <span>待发货清单</span>
          <Link to="/supplierBackOrders"></Link>
        </Menu.Item>
        <Menu.Item key="/supplierDelivered">
          <img className={`icon-normal ${collapsed ? 'icon-collapsed' : ''}`} src={selectedKeys[0] == '/supplier/delivered' ? sn : sn} alt="" />
          <span>已发货清单</span>
          <Link to="/supplierDelivered"></Link>
        </Menu.Item>
      </Menu>
    )

    const { userInfo = {}, isLogin } = this.props;

    const Line = () => (
      <i
        style={{
          width: '100%',
          height: '1px',
          display: 'block',
          margin: '5px 0',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      />
    );

    const menuAtTop = (
      <Menu>
        {supplierList?.length > 1 && (
          <>
            <SubMenu
              expandIcon={
                <noscript>
                默认的ICON不符合需求，所以这里使用空标签进行置空
                </noscript>
              }
              title={
                <div className={''}>
                  <span style={{ paddingRight: 20 }}>
                    <label style={{ color: '#000' }}>切换供应商</label>
                    <br />
                    <label style={{ color: '#aaa' }}>
                      {companyName}
                    </label>
                  </span>
                  <RightOutlined style={{ color: '#aaa', fontSize: '12px' }} />
                </div>
              }
              style={{ padding: 0, margin: 0 }}
            >
              {supplierList.map((el) => (
                <Menu.Item
                  onClick={({ key }) => {
                    // 更换供应商实体
                    api.setSupplierEntity({ supplierId: key }).then(({ code }) => {
                      if (code === '0') {
                        window.location.reload();
                      }
                    });
                  }}
                  style={{ padding: 10 }}
                  key={el.id}
                >
                  {el.companyName}
                </Menu.Item>
              ))}
            </SubMenu>
            <Line />
          </>
        )}

        {// AuthTree sys list
          sysList?.map((el) =>
            el.code !== currentSys?.code ? (
              <Menu.Item
                onClick={() => this.sysChange(el)}
                style={{ padding: 10 }}
                key={el.code}
              >
                  进入{el?.name}
              </Menu.Item>
            ) : null,
          )
            .filter(Boolean)
        }
        {
          sysList?.length && <Line />
        }
        <Menu.Item onClick={this.logout} style={{ padding: 10, color: 'red' }}>
          退出
        </Menu.Item>
      </Menu>
    );

    const SwithSupplierType = () => {
      const { supplierType, supplierTypeOpts } = this.state
      const menu = (
        supplierTypeOpts.length ? <Menu onClick={this.handleSelectChange}>
          { supplierTypeOpts.map(({ accountType, label }) => 
            <Menu.Item accounttype={accountType} key={label}>{label}</Menu.Item>) }
        </Menu> : <></>
      );
      return <Dropdown placement="bottomCenter" className="drop-menu" overlay={menu}>
        <a>
          {supplierType}<DownOutlined />
        </a>
      </Dropdown>
    }
    const userInfoCard = (
      <div className="u-info">
        {
          isNewEdition() ?
            <>
              <SupplierGuide /> ｜
              {username} ｜
              <Dropdown overlay={menuAtTop} trigger={['hover']}>
                <span>
                  {currentSys?.code?.match(/backend/) ? currentSys?.name : companyName}
                  <DownOutlined style={{ paddingLeft: 6 }} />
                </span>
              </Dropdown> 
            </> :
            <>
              {/* 通用，资源，服务器及网络设备相关，提供切换选择 */}
              { [UNIVERSAL, RESOURCES, SERVERANDNETWORK].includes(supplierType) && <SwithSupplierType /> }
              <SupplierGuide />
              <div className="u-line"></div>
              <div className="u-name">
                <Popover content={_.get(userInfo, 'company.companyName', '--')} title={null} placement="bottom">
                  <span >{_.get(userInfo, 'company.companyName', '--')}</span>
                </Popover>
              </div>
              <div className="u-line"></div>
              <a className="u-logout" onClick={this.logout}>退出</a>
            </>
        }
      </div>
    )

    return (
      <AuthTreeContext.Provider value={this.state.authTree} >
        <Layout>
          <Sider
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
            }}
            className="g-sider"
            width="180"
            collapsedWidth="52"
            trigger={null}
            collapsible
            collapsed={collapsed}>
            {
              supplierType === RESOURCES ||
              supplierType === SERVERANDNETWORK ?
                <Link to="/resourcesInfo">
                  <div className="u-logo">
                    <img
                      src={collapsed ? titleSmall : title}
                      alt=''
                    />
                  </div>
                </Link>
                :
                <Link to="/backlog">
                  <div className="u-logo">
                    <img
                      src={collapsed ? titleSmall : title}
                      alt=''
                    />
                  </div>
                </Link>
            }
            <div className="m-collapsible" onClick={this.toggle}>
              <LegacyIcon
                className="trigger"
                type={collapsed ? 'menu-unfold' : 'menu-fold'}
              />
            </div>
            {
              /* 通用类，资源类，服务器类 新增 供应商类型选中，菜单可以通过切换类型来调整 */
              <>
                { supplierType === RESOURCES && menuResources }
                { supplierType === SERVERANDNETWORK && hardwareMenuResources }
                { supplierType === ADMINISTRATION && menuPublic }
                { supplierType === INFRASTRUCTURE && menuBase }
                { ![RESOURCES,
                  SERVERANDNETWORK, 
                  ADMINISTRATION, 
                  INFRASTRUCTURE].includes(supplierType) && menu }
              </>
            }
            
          </Sider>
          {isNewEdition() &&
            <Layout style={{marginLeft: collapsed ? 52 : 180, minHeight: '100vh'}}>
              <Header className="g-header">
                <div className="u-tt">
                  <div className="m-greeting">Hi, 欢迎您进入网易集团供应商管理系统!</div>
                </div>
                {userInfoCard}
              </Header>
              {
                <Content style={{overflowX: 'hidden' }}>
                  {isAuthorized ? this.props.children : '加载中...'}
                </Content>
              }
            </Layout>
          }

          {
            !isNewEdition() &&
              (
                isLogin ?
                  <Layout style={{marginLeft: collapsed ? 52 : 180, minHeight: '100vh'}}>
                    <Header className="g-header">
                      <div className="u-tt">
                        <div className="m-greeting">Hi, 欢迎您进入网易集团供应商管理系统!</div>
                      </div>
                      {userInfoCard}
                    </Header>

                    <Content style={{overflowX: 'hidden' }}>

                      {
                        this.renderTitle()
                      }

                      {this.props.children}
                    </Content>
                    {/* <Footer>Footer</Footer> */}
                  </Layout>
                  :
                  <div>加载中...</div>
              )
          }

        </Layout>
      </AuthTreeContext.Provider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLogin: state.app.isLogin,
    userInfo: state.app.userInfo,
    // loginOutUrl: api.loginOut.url,
    menuItemObj: state.app.menuItemObj,
    mapStatusToText: state.app.mapStatusToText,
    billingTotal: state.accountResources.billingTotal,
    quotedTotal: state.quoteResources.quotedTotal,
    quoteCommonCount:  state.quoteCommon.waitHandleTotal
  };
}

const AppWithRouter = withRouter(
  connect(
    mapStateToProps,
    dispatchs('app', 'quoteResources', 'accountResources')
  )(App)
)

export default function AppWithRouterPage(props) { return <AppWithRouter {...props} />; }