const STATE_RESOLVE = 'resolved';
const STATE_PENDING = 'pending';
const STATE_REJECT = 'reject';

class MyPromise {
  constructor(executor) { //executor为传给Promise的一个函数参数,它自己又接收两个参数
    this.state = STATE_PENDING;
    this.resolveValue = undefined;
    this.rejectReason = undefined;
    //发布订阅模式实现Promise内异步操作: then时如果state还是pendding,则注册回调函数
    this.onResolvedCallback = [];
    this.onRejectedCallback = [];

    let resolve = (value) => {
      this.state = STATE_RESOLVE;
      this.value = value;
      //发布
      this.onResolvedCallback.forEach(fn => fn());
    }

    let reject = (value) => {
      this.state = STATE_REJECT;
      this.reason = value;
      //发布
      this.onRejectedCallback.forEach(fn => fn());
    }
    executor(resolve, reject); //传进的executor参数同步执行
  };
  then(onFullFilled, onRejected) {
    if (this.state === STATE_RESOLVE) {
      onFullFilled(this.value);
    }
    if (this.state === STATE_REJECT) {
      onRejected(this.reason);
    }
    //如果执行then时还未resolve,则先缓存方法,监听resolve,resolve执行时顺便把缓存的函数拿出来执行
    if (this.state === STATE_PENDING) {
      this.onResolvedCallback.push(() => {
        onFullFilled(this.value);
      });
      this.onRejectedCallback.push(() => {
        onRejected(this.reason);
      })
    }
  }
}

new MyPromise((resolve, reject) => {
  // resolve(10);
  setTimeout(() => {
    reject(2000);
  }, 10)
  console.log(1);
}).then(
  function(value) {
    console.log('value', value);
  },
  function(reason) {
    console.log('reason', reason);
  }
)