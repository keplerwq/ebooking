import React from 'react';
import { Route, Switch, Redirect } from 'react-router';
import loadable from '@loadable/component'


const App = loadable(() => import(/* webpackChunkName: 'App' */ 'src/pages/App/App'));

export default function router () {
  return (
    <Switch>
      <Route exact path="/" render={() => <Redirect to='/login' />} />
      <Route exact path="/login" component={
        loadable(() => import(/* webpackChunkName: 'router-Login' */ 'src/pages/Login'))
      } />
      <Route exact path="/register/:type?" component={
        loadable(() => import(/* webpackChunkName: 'router-Register' */ 'src/pages/Register'))
      } />
      <Route exact path="/forget" component={
        loadable(() => import(/* webpackChunkName: 'router-Forget' */ 'src/pages/Forget'))
      } />
      <App>
        <Switch>
          {/* default 可以帮助加载 App 组件及其逻辑而不触发具体的页面执行 */}
          <Route exact path="/default" component={null} />
          <Route exact path="/backlog" component={
            loadable(() => import(/* webpackChunkName: 'router-Backlog' */ 'src/pages/Backlog'))
          } />
          <Route exact path="/info" component={
            loadable(() => import(/* webpackChunkName: 'router-Info' */ 'src/pages/Info'))
          } />
          <Route exact path="/order/:state?" component={
            loadable(() => import(/* webpackChunkName: 'router-Order' */ 'src/pages/Order'))
          } />
          <Route exact path="/orderdetail/:id/:sid/:type" component={
            loadable(() => import(/* webpackChunkName: 'router-OrderDetail' */ 'src/pages/Order/Detail'))
          } />
          <Route exact path="/quote/:state?" component={
            loadable(() => import(/* webpackChunkName: 'router-Quote' */ 'src/pages/Quote'))
          } />
          <Route exact path="/quoteCommon/:state?" component={
            loadable(() => import(/* webpackChunkName: 'router-QuoteCommon' */ 'src/pages/QuoteCommon'))
          } />
          <Route exact path="/quoteCommonQuotation/:enquiryTaskCode/:enquiryCode" component={
            loadable(() => import(/* webpackChunkName: 'router-QuoteCommon' */ 'src/pages/QuoteCommon/Quotation'))
          } />
          <Route exact path="/quoteCommonDetail/:enquiryTaskCode/:enquiryCode" component={
            loadable(() => import(/* webpackChunkName: 'router-QuoteCommon' */ 'src/pages/QuoteCommon/Detail'))
          } />
          <Route exact path="/aftersale/:state?" component={
            loadable(() => import(/* webpackChunkName: 'router-AfterSale' */ 'src/pages/AfterSale'))
          } />
          <Route exact path="/account/:state?/:accountTime?" component={
            loadable(() => import(/* webpackChunkName: 'router-Account' */ 'src/pages/Account'))
          } />
          <Route exact path="/accountdetail/:accounttime" component={
            loadable(() => import(/* webpackChunkName: 'router-AccountDetail' */ 'src/pages/Account/Detail'))
          } />
          <Route exact path="/baseInfo" component={
            loadable(() => import(/* webpackChunkName: 'router-BaseInfo' */ 'src/pages/InfoBase'))
          } />
          <Route exact path="/baseHome" component={
            loadable(() => import(/* webpackChunkName: 'router-BaseHome' */ 'src/pages/HomeBase'))
          } />
          <Route exact path="/baseBidding" component={
            loadable(() => import(/* webpackChunkName: 'router-BaseBidding' */ 'src/pages/BiddingBase'))
          } />
          <Route exact path="/baseBiddingDetail/:id?" component={
            loadable(() => import(/* webpackChunkName: 'router-BaseBiddingDetail' */ 'src/pages/BiddingBase/detail'))
          } />
          <Route exact path="/baseNotice/:id/:type" component={
            loadable(() => import(/* webpackChunkName: 'router-BaseNotice' */ 'src/pages/HomeBase/notice'))
          } />
          <Route exact path="/resourcesInfo" component={
            loadable(() => import(/* webpackChunkName: 'router-InfoResources' */ 'src/pages/InfoResources'))
          } />
          <Route exact path="/publicInfo" component={
            loadable(() => import(/* webpackChunkName: 'router-InfoPublic' */ 'src/pages/InfoPublic'))
          }/>
          <Route exact path="/resourcesAccount/:state?/:accountTime?" component={
            loadable(() => import(/* webpackChunkName: 'router-AccountResources' */ 'src/pages/AccountResources'))
          } />
          <Route exact path="/resourcesAccountDetail/:id/:type" component={
            loadable(() => import(/* webpackChunkName: 'router-AccountResourcesDetail' */ 'src/pages/AccountResources/Detail'))
          } />
          <Route exact path="/resourcesAccountAdd" component={
            loadable(() => import(/* webpackChunkName: 'router-AccountResourcesAdd' */ 'src/pages/AccountResources/Detail/addAccount'))
          } />
          <Route exact path="/resourcesQuote" component={
            loadable(() => import(/* webpackChunkName: 'router-QuoteResources' */ 'src/pages/QuoteResources'))
          } />
          <Route exact path="/resourcesQuoteDetail/:applicationId/:email/:supplierId/:id/:type" component={
            loadable(() => import(/* webpackChunkName: 'router-QuoteResourcesDetail' */ 'src/pages/QuoteResources/Detail'))
          } />
          <Route exact path="/supplierInquiry" component={
            loadable(() => import(/* webpackChunkName: 'router-SupplierInquiry' */ 'src/pages/Supplier/Inquiry'))
          } />
          <Route exact path="/supplierQuoted" component={
            loadable(() => import(/* webpackChunkName: 'router-SupplierQuoted' */ 'src/pages/Supplier/Quoted'))
          } />
          <Route exact path="/supplierContract" component={
            loadable(() => import(/* webpackChunkName: 'router-SupplierContract' */ 'src/pages/Supplier/Contract'))
          } />
          <Route exact path="/supplierBackOrders" component={
            loadable(async () => (await import(/* webpackChunkName: 'router-SupplierBackOrders' */ 'src/pages/Supplier/BackOrders')).default.BackOrders)
          } />
          <Route exact path="/supplierBackOrders/backordersdetail" component={
            loadable(async () => (await import(/* webpackChunkName: 'router-SupplierBackOrdersDetail' */ 'src/pages/Supplier/BackOrders')).default.BackOrdersDetail)
          } />
          <Route exact path="/supplierDelivered" component={
            loadable(async () => (await import(/* webpackChunkName: 'router-SupplierDelivered' */ 'src/pages/Supplier/Delivered')).default.Delivered)
          } />
          <Route exact path="/supplierDelivered/delivereddetail" component={
            loadable(async () => (await import(/* webpackChunkName: 'router-SupplierDeliveredDetail' */ 'src/pages/Supplier/Delivered')).default.DeliveredDetail)
          } />
          <Route exact path="/supplierChangePassword" component={
            loadable(() => import(/* webpackChunkName: 'router-SupplierPasswordChange' */ 'src/pages/Supplier/PasswordChange'))
          } />
          <Route exact path="/contactsManage" component={
            loadable(() => import(/* webpackChunkName: 'router-ContactsManage' */ 'src/pages/ContactsManage'))
          } />
          <Route exact path="/roleManage" component={
            loadable(() => import(/* webpackChunkName: 'router-RoleManage' */ 'src/pages/RoleManage'))
          } />
          <Route exact path="/roleManage/roleRightsManage" component={
            loadable(() => import(/* webpackChunkName: 'router-RoleRightsManage' */ 'src/pages/RoleManage/RoleRightsManage'))
          } />
          {/* 404 页面，这个页面请保持最后, 因为未配置 path 的 Route 可以与url中任何 path 匹配成功，并不再进行下面的匹配 */}
          <Route component={
            loadable(() => import(/* webpackChunkName: 'router-NotFound' */ 'src/pages/NotFound/NotFound'))  
          } />
        </Switch>
      </App>
    </Switch>
  );
}