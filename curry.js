function add(...args) {
  console.log('args, ...args', args, ...args)


  let getSum = function(args) {
    let result = args.reduce((previous, current) => {
      return previous + current
    }, 0)
    return result;
  }
  let fn = function(...res) {
    return add(...args, ...res)
  };
  fn.sumof = function() {
    console.log(getSum(args));
  }
  return fn;
}

// add(1, 2).sumof()
add(1)(2).sumof()





function getSum(...args) {
  let result = args.reduce((p, c) => p + c, 0);
  // console.log('sumresult', result)
  let fn = function(...res) {
    return getSum(...args, ...res);
  }
  return fn;
}

function sum(...args) {
  let result = args.reduce((p, c) => p + c, 0);
  console.log(result)
}

getSum(1)(2)(4);



// sum(1)(2)(4);