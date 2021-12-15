const routes = [{ path: '/aaa', viewHtml: `<h3>aaa组件</h3>` }, { path: '/bbb', viewHtml: `<h3>bbb组件</h3>` }];

class VueRouter {
  //1. 监听url变化： onhashchange || onpopstate

  //2. 触发监听事件

  //3. 改变VueRouter中的current变量

  //4. 获取新组件:  location.hash || location.pathname

  //5. render新组件: router-view
  Vue.component('router')
}