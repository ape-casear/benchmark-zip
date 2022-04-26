const https = require('https')
const http = require('http')
const getResourceOpt = { rejectUnauthorized: false, agent: false, requestCert: false }

function requestZip(url) {
    return new Promise((res, rej) => {
        const client = url.startsWith('https') ? https : http
        try {
            client.get(url, getResourceOpt, resp => {
                const contentLength = Number(resp.headers['content-length'])
                if (resp.statusCode !== 200) {
                    resp.resume()
                    rej(resp.statusCode)
                    return
                }
                let rawData = Buffer.allocUnsafe(contentLength)
                let pointer = 0
                resp.on('data', (chunk) => {
                    chunk.copy(rawData, pointer, 0, chunk.length)
                    pointer += chunk.length
                })
                resp.on('end', () => {
                    res(rawData)
                })
                resp.on('error', (e) => {
                    rej({ message: 'download error:' + e.message })
                })
            })
        } catch (e) {
            rej(e)
        }
    })
}
exports.get = requestZip