[TOC]



# 问题1: v-for loop arr.shift() 时 进入死循环

问题描述:

```javascript
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>


  <div id='app'>
    <ul>
      <li v-for="(item, index) in data_nodes.shift()">{{ item }}</li>
      <li v-for="(item, index) in computed_nodes.shift()">{{ item }}</li>
    </ul>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
</head>

<body>
  <!--  -->
  <script>
    const app = new Vue({
      el: '#app',
      data: {
        data_nodes: [{}],
      },
      computed: {
        computed_nodes() {
          return [{
            content: '空置节点',
          }]
        }
      }
    });
  </script>
  
</body>
<html>
```

![image-20210628110431134](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628110431134.png)

原因: 

> vue底层重写了shift/unshift/pop/push/splice/sort/reverse方法, 实现了深层双向绑定; 因此用这些方法时, 会触发setter;
>
> data_nodes作为data选项, 当data_nodes的setter触发时, 通知watcher, 从而使他关联的组件重新渲染;

![image-20210628094838691](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628094838691.png)

![image-20210628094937128](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628094937128.png)

```js
  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];
```

![image-20210628104053056](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628104053056.png)

![image-20210628104115588](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628104115588.png)

> [\_\_ ob\_\_ : Observer]这些数据是vue这个框架对数据设置的监控器，一般都是不可枚举的。
>
> ```js
>  // 检查被监听的值是否已经被监听过了，就是通过是否有__ob__属性并且__ob__属性是否是Observe的实例对象来判断的
> ```

![image-20210628104446290](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628104446290.png)



> 总结: 
>
> data, props里的数据, setter触发时会通知watcher, 关联组件重新渲染;
>
> v-for loop的变量不要触发setter
>
> 支持响应式更新的：push，pop, shift, unshift, splice，sort, reverse 不支持响应式更新的：filter, concat, slice

> 参考:
>
> [Vue父子组件生命周期执行顺序](https://www.cnblogs.com/caoshouling/p/13403019.html)
>
> []()

# 问题2:[Qianxin Design](http://design.qianxin-inc.cn/#/) \<q-steps>组件, index乱序

问题描述:

```html
      <q-steps :space="200" :active="activeNodeIndex">
        <q-step v-for="(item) in scheduleNodes" :key="item.id" :title="item.name">
          <div slot="description">
            <p>1号点{{item}}</p>
            <p>2号点{{item}}</p>
          </div>
        </q-step>
        <q-step>3号点</q-step>  
      </q-steps>
```

预期效果:

![image-20210628110210964](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628110210964.png)

实际效果:

![image-20210628110254324](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628110254324.png)

原因:父子组件的create都在父子组件的mounted之前, 子组件渲染时, 最后的节点最先渲染,被push进steps[], v-for的节点后续获取,

> https://codepen.io/weimengxi/pen/xxdwyZL

父組件:  steps.vue:

```js
 data() {
    return {
      steps: [], // step 组件创立之前将组件实例增加到父组件的 steps 数组中
      stepOffset: 0
    };
  },
      
 watch: {
    active(newVal, oldVal) {
      this.$emit('change', newVal, oldVal);
    },
    steps(steps) {
      steps.forEach((child, index) => {
        child.index = index; // 设置子组件的 index 属性，将会用于子组件的展现逻辑
      });
    }
  }
```



子組件: step.vue

```js
// step 组件创立之前将组件实例增加到父组件的 steps 数组中
beforeCreate() {
  this.$parent.steps.push(this);
},
  
data() {
  return {
    index: -1,
  };
},
  
methods: {
  getCurrentStatus() {
    // 拜访父组件的逻辑更新属性
    const { current, type, steps, timeForward } = this.$parent;
    // 逻辑解决
  }
},
mounted() {
  // 监听 index 的变动从新计算相干逻辑
  const unwatch = this.$watch('index', val => {
    this.$watch('$parent.current', this.getCurrentStatus, { immediate: true });
    unwatch();
  });
}
```





最终实现方式:

![image-20210628112639115](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210628112639115.png)

> 总结: 同级并发的时候, 不要一起用v-for和普通的组件, 可能会乱序
>
> 源码改进方式: [参考 provide+inject+created](https://lequ7.com/guan-yu-qian-duan-steps-zu-jian-de-she-ji-yu-shi-xian.html)



父子组件通信时的生命周期测试:



