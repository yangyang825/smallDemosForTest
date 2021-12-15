//被观察者
class Subject {
  constructor() {
    this.name = '观察目标'
    this.state = 'happy';
    this.observers = [];
  }

  //观察者放进观察目标里缓存
  attach(observer) {
    this.observers.push(observer);
  }

  setState(newState) {
    if (this.state === newState) return
    this.state = newState;
    this.observers.forEach(obv => obv.update(newState));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  update(newState) {
    console.log(this.name, newState)
  }
}

let sub = new Subject('pet');
let obsever1 = new Observer('我');

//1.注册观察者
sub.attach(obsever1);
//2.状态改变
sub.setState('sad');