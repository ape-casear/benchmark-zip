const { unzip } = require('./unzipF')
const path = require('path')
const fs = require('fs')

// const ab = new SharedArrayBuffer()

const buffer = fs.readFileSync(path.join(__dirname, '../smallZip.zip'))
module.exports = async function main(c) {
    let count = c || 4
    let key = `js_woker解压${count}份`
    console.time(key)
    await Promise.all(new Array(count).fill(1).map(() => {
        return unzip({ resourceItem: buffer, destDir: path.join(__dirname, '../tmp') })
    }))
    console.timeEnd(key)
}