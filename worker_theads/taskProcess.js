const { parentPort } = require('worker_threads')
const path = require('path')
const fs = require('fs')
const JSZip = require('jszip')
const fsPromises = fs.promises

async function doUnzipWork({ resourceItem, destDir }) {

    const zip = new JSZip()
    return await zip.loadAsync(resourceItem).then(async (_zip) => {
        let keys = Object.keys(_zip.files).sort((a, b) => {
            return a.length - b.length
        })
        const data = {}

        const dir = keys.find(item => /\/$/.test(item) && item.indexOf('/') === item.length - 1)
        if (dir) {
            const dest = path.join(destDir, dir)
            await fsPromises.mkdir(dest).catch(() => {})
        }
        for (const filename of keys) {
            const random = Math.floor(Math.random() * 100)
            const dest = path.join(destDir, filename + random)
            if (!_zip.files[filename] || _zip.files[filename].dir) {
                try {
                    await fsPromises.stat(dest)
                } catch (e) {
                    await fsPromises.mkdir(dest)
                }
            } else {
                await zip.file(filename).async('nodebuffer').then(async (content) => {
                    // fs.writeFileSync(dest, content)
                    await fsPromises.writeFile(dest, content)
                })
            }
        }
        parentPort.postMessage({ key: 'done', data: data })

        return data
    })
}


parentPort.on('message', (task) => {
    doUnzipWork(task)
    // parentPort.postMessage('done')
})