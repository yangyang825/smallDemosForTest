# smallDemosForTest

针对开发时碰到的一些小bug和小功能写的测试demo;  
用于直观看到代码的影响  

# VUE相关   
## 1. 测试生命周期   
>结论: 父beforeCreate -> 父created -> 父beforeMount -> 子beforeCreate -> 子created -> 子beforeMount -> 子mounted -> 父mounted    


## 2. 测试v-for遍历的变量   
>结论: >vue底层重写了shift/unshift/pop/push/splice/sort/reverse方法, 实现了深层双向绑定; 因此用这些方法时, 会触发setter;  
>  data_nodes作为data选项, 当data_nodes的setter触发时, 通知watcher, 从而使他关联的组件重新渲染;  

# js语法相关
## 1.

# 其他相关(CSS/HTML/少部分js)
## 1. 测试img验证url是否正确(base64)
结论: 通过new一个Image()对象,利用onload和onerror判断url是否正确; 注意new Image()的过程是异步,需要写成promise,否则判断会被跳过;

## 2. 测试scrollbar的样式修改
结论: scrollbar作为html标签自带的滚动条,本身是伪类,修改时直接改伪类样式即可; 注意滚动thumb设置宽度无效, 需要用background-clip属性配合border: transparent, 才能画出滚动槽的感觉;

