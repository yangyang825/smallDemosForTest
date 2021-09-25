const STATE_RESOLVE = 'resolved';
const STATE_PENDING = 'pending';
const STATE_REJECT = 'reject';

class MyPromise {
  constructor(executor) { //executor为传给Promise的一个函数参数,它自己又接收两个参数
    this.state = STATE_PENDING;
    this.resolveValue = undefined;
    this.rejectReason = undefined;

    let resolve = (value) => {
      this.state = STATE_RESOLVE;
      this.value = value;
    }

    let reject = (value) => {
      this.state = STATE_REJECT;
      this.reason = value;
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
  }
}

new MyPromise((resolve, reject) => {
  // resolve(10);
  reject(2000);
  console.log(1);
}).then(
  function(value) {
    console.log('value', value);
  },
  function(reason) {
    console.log('reason', reason);
  }
)