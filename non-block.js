function bitOpe(a, b) {
    return (a | b) + (a & b)
}

console.time('期望触发耗时50ms,实际耗时')
setTimeout(() => {
    console.timeEnd('期望触发耗时50ms,实际耗时')
}, 50)

let i = 100000000
let reps = 0
// while (i-- > 0) {
//     bitOpe(1678, 15846)
// }
processData(i)

function processData(index) {
    let end = Math.max(index - 1000000, 0)
    while (i > end) {
        reps += bitOpe(1678, 15846)
        i--
    }
    if (end > 0) {
        setImmediate(processData.bind(null, end))
    } else {
        console.log(`reps:${reps}`)
    }
}