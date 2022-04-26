const WorkerPool = require('./workerThreadPool.js')
const os = require('os')
const pool = new WorkerPool(Math.max(1, os.cpus().length / 2), 'taskProcess.js')
/**
 * @returns
 */
module.exports.unzip = async function(downloadInfo) {
    const { resourceItem, destDir } = downloadInfo
    return new Promise((res, rej) => {

        pool.runTask({
            resourceItem,
            destDir,
        }, (err, result) => {
            if (err) {
                rej(err)
            } else {
                res(result)
            }
        })
    })
}