let arr = new Array(2).fill('0');

let b = arr.map(() => {
  return new Array(3).fill('1')
})

let c = b.map((item) => {
  if (item instanceof Array) {
    let temp = item.map(() => {
      return new Array(4).fill('2')
    })
    return temp
  }
})

console.log(c[0][2][1])