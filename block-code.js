function bitOpe(a, b) {
    return (a | b) + (a & b)
}

console.time('期望触发耗时50ms,实际耗时')
setTimeout(() => {
    console.timeEnd('期望触发耗时50ms,实际耗时')
}, 50)

let i = 100000000
let reps = 0
console.time('while cost')
while (i-- > 0) {
    reps += bitOpe(1678, 15846)
}
console.timeEnd('while cost')
console.log(`reps:${reps}`)