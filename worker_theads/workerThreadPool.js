/**
 * copy from http://nodejs.cn/api/worker_threads.html
 */

const { EventEmitter } = require('events')
const path = require('path')
const { Worker } = require('worker_threads')
const kTaskInfo = Symbol('kTaskInfo')
const fs = require('fs')
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent')

class WorkerPool extends EventEmitter {
    constructor(numThreads, workerJsPath) {
        super()
        this.numThreads = numThreads
        this.workers = []
        this.freeWorkers = []
        this.tasks = []

        this.workerJsPath = workerJsPath

        for (let i = 0; i < numThreads; i++)
            this.addNewWorker()

        // Any time the kWorkerFreedEvent is emitted, dispatch
        // the next task pending in the queue, if any.
        this.on(kWorkerFreedEvent, () => {
            if (this.tasks.length > 0) {
                const { task, callback } = this.tasks.shift()
                this.runTask(task, callback)
            }
        })
    }

    async getWorkerContents() {
        // console.log('verbose Worker path:' + path.resolve(__dirname, this.workerJsPath))
        if (!this.workerContents) {
            const workerPath = path.resolve(__dirname, this.workerJsPath)
            this.workerContents = await fs.promises.readFile(workerPath, { encoding: 'utf8' })
        }
        return this.workerContents
    }

    async addNewWorker() {
        // const workerContents = await this.getWorkerContents()
        const worker = new Worker(path.resolve(__dirname, this.workerJsPath))
        // const worker = new Worker(workerContents, { eval: true })
        const errorHandlerFatal = (err) => {
            console.log('verbose Worker errorHandlerFatal:' + err.message + '\n' + err.stack)
            if (worker[kTaskInfo])
                // worker[kTaskInfo].done(err, null)
                worker[kTaskInfo](err, null)
            else
                this.emit('error', err)
            this.workers.splice(this.workers.indexOf(worker), 1)
            this.addNewWorker()
        }
        const errorHandler = (err) => {
            worker[kTaskInfo] ? worker[kTaskInfo](err, null) : this.emit('error', err)
        }
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            // console.log('verbose message from workerthread')
            if (result.key === 'done') {
                // worker[kTaskInfo].done(null, result.data)
                // worker[kTaskInfo] = null
                worker[kTaskInfo](null, result.data)
                worker[kTaskInfo] = null
                this.freeWorkers.push(worker)
                this.emit(kWorkerFreedEvent)
            } else if (result.key === 'error') {
                errorHandler(result.data)
            } else if (result.key) {
                this.emit(result.key, result.data)
            }
        })

        worker.on('error', errorHandlerFatal)
        worker.on('exit', (code) => {
            console.log('verbose Worker exit:' + code)
        })
        this.workers.push(worker)
        this.freeWorkers.push(worker)
        this.emit(kWorkerFreedEvent)
    }

    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this.tasks.push({ task, callback })
            return
        }

        const worker = this.freeWorkers.pop()
        // worker[kTaskInfo] = new WorkerPoolTaskInfo(callback)
        worker[kTaskInfo] = callback
        worker.postMessage(task)
    }

    close() {
        for (const worker of this.workers) worker.terminate()
    }
}

module.exports = WorkerPool