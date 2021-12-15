function runByOrder(funcsArr) {
  let promisesArr = [];
  funcsArr.forEach(fn => {
    let p = new Promise(resolve => {

    })
  });
  promisesArr.reduce((previous, current) => {
    return previous.then(() => current)
  })
}

/* https://www.zhihu.com/question/50953387?sort=created */