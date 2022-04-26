const JSZip = require('jszip')
const zipAddon = require('zip-node-addon')
// const { get } = require('./get')
const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const workerF = require('./worker_theads/main')

async function run() {
    console.time('load data')
    const fileBufs = fs.readFileSync('./smallZip.zip')
    console.timeEnd('load data')
    let count = 8
    // const fileBufs = await get('')

    console.time(`C++插件解压${count}次\t`)
    await Promise.all(new Array(count).fill(1).map((_, i) => {
        return zipAddonFun(fileBufs, i)
    }))
    console.timeEnd(`C++插件解压${count}次\t`)
    console.log()
    console.time(`JS解压${count}次\t`)
    await Promise.all(new Array(count).fill(1).map(() => {
        return jsZipFun(fileBufs)
    }))
    console.timeEnd(`JS解压${count}次\t`)
    console.log()
    await workerF(count)
    console.log()

    const fileBufs2 = getAllFileBuf()
    console.time(`C++插件压缩${count}次\t`)
    await Promise.all(new Array(count).fill(1).map(() => {
        return zipAddonFun2(fileBufs2)
    }))
    console.timeEnd(`C++插件压缩${count}次\t`)
    console.log()
    console.time(`JS压缩${count}次\t`)
    await Promise.all(new Array(count).fill(1).map(() => {
        return jsZipFun2(fileBufs2)
    }))
    console.timeEnd(`JS压缩${count}次\t`)
}
// 解压
async function jsZipFun(fileBufs) {
    // console.time('cost')
    const zip = new JSZip()
    const zipObj = await zip.loadAsync(fileBufs)
    // console.timeEnd('cost')

    // console.log(Object.keys(zipObj.files))
    const destDir = './tmp'
    const task = []
    for (const filename of Object.keys(zipObj.files)) {
        const dest = path.join(destDir, filename)
        if (zipObj.files[filename].dir) {
            try {
                await fsPromises.mkdir(dest)
            } catch (e) {}
        } else {
            await zip.file(filename).async('nodebuffer').then(async (content) => {
                task.push(fsPromises.writeFile(dest, content))
            })
        }
    }
    await Promise.all(task)
}
// 压缩
async function jsZipFun2(fileBufs) {
    const zip = new JSZip()

    fileBufs.forEach(f => {
        zip.file(f.fileName, f.buf)
    })
    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
        .then(function(content) {
            return content
        });

    // fs.writeFileSync(path.join(__dirname, './test-from-js.zip'), buf)
}
// 压缩
async function zipAddonFun2(fileBufs) {
    const obj = fileBufs.reduce((sum, a) => {
        sum[a.fileName] = a.buf
        return sum
    }, {})
    // console.log(obj)
    const buf = await zipAddon.zipBuffer(obj)
    // fs.writeFileSync(path.join(__dirname, './test-from-addon.zip'), buf)
}
// 解压
async function zipAddonFun(fileBufs, index) {
    await zipAddon.unzipStream(fileBufs, "./tmp").then(jsonStr => {
        // let jsObj = JSON.parse(jsonStr)
        // console.log(jsObj)
    }).catch(err => console.error(err))
}

function getAllFileBuf() {
    const dir = 'few-files'
    // const dir = 'many-files'
    const files = fs.readdirSync(path.join(__dirname, dir))
    let bufs = []

    for (const file of files) {
        bufs.push({
            fileName: file,
            buf: fs.readFileSync(path.join(__dirname, dir, file))
        })
    }

    return bufs
}

run()