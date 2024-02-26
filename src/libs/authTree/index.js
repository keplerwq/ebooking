import Sys from './core/sys';
import empty from './core/empty';
import enhanced from './core/enhanced';
import standard from './plugins/standard';
import routerDispatcher from './plugins/routerDispatcher';
import addUsefulPaths from './plugins/addUsefulPaths';
import matcher from './plugins/matcher';
import fallback from './plugins/fallback';
import extractive from './plugins/extractive';
import parse404 from './plugins/parse404';
import pageOperation from './plugins/pageOperation';
// 路由配置
import administrative from './administrative';
import backend from './backend';
import hardware from './hardware';
import resource from './resource';


// 与采购端差异：
// 1、standard 转化需要配置供应商端根节点 code 进行匹配
// 2、matcher 需要配置为 hash 类型
function createAuthTree(data) {
  return new Sys(data)
    .use(empty)
    .use(standard, {
      businessCode: 'supplier_side',
      backendCode: 'supplier_backend',
    })
    .use(enhanced)
    .use(routerDispatcher, [administrative, backend, hardware, resource])
    .use(addUsefulPaths)
    .use(matcher, { type: 'hash' })
    .use(fallback)
    .use(extractive)
    .use(parse404)
    .use(pageOperation)
    .done();
}
export default createAuthTree;
