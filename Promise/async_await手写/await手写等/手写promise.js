/* 只能返回同步/异步任务的版本,如果需要给then传的回调里返回Promise也能成功,需要再改进 */
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
    // debugger
    //第一次.then,返回一个Promise; 只返回一个Promise，则该Promise始终为pending状态，必须在返回时，根据onFullFilled、onRejected回调的值
    return new MyPromise((resolve, reject) => {
      let x;
      if (this.state === STATE_RESOLVE) {
        try {
          x = onFullFilled(this.value);
          // debugger
          resolve(x);
        } catch (e) {
          reject(e);
        }
      }
      if (this.state === STATE_REJECT) {
        onRejected(this.reason);
      }
      //如果执行then时还未resolve,则先缓存方法,监听resolve,resolve执行时顺便把缓存的函数拿出来执行
      if (this.state === STATE_PENDING) {
        this.onResolvedCallback.push(() => {
          x = onFullFilled(this.value);
          resolve(x);
        });
        this.onRejectedCallback.push(() => {
          x = onRejected(this.reason);
          reject(x);
        })
      }
    })
  }
}

let p = new MyPromise((resolve, reject) => {
  // resolve(10);
  setTimeout(() => {
    resolve(2000);
  }, 10)
  console.log(1);
})
p.then(
  function(value) {
    console.log('first then: value', value);
    // debugger
    return 111;
  },
  function(reason) {
    console.log('first then: reason', reason);
  }
).then(
  function(value) {
    // debugger
    console.log('second then: value', value);
  },
  function(reason) {
    console.log('second then: reason', reason);
  }
)