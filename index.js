'use strict'

const _ = require('lodash')
const rp = require('request-promise')
const Url = require('url')
const AWS = require('aws-sdk')
const Aws4 = require('aws4')

module.exports = function (options) {

    return function (req, cb) {

        const awsCredentials = {
            'accessKeyId': options.key || AWS.config.credentials.accessKeyId,
            'secretAccessKey': options.secret || AWS.config.credentials.secretAccessKey
        }
        if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey) throw 'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY should either be passed by options or as process.env variables'
        const region = options.region || 'us-east-1'
        const host = 'awis.api.alexa.com'
        const service = 'awis'
        req.output = 'json'

        const path = `/api?Action=${req.Action}&Output=json&ResponseGroup=${req.ResponseGroup}&Url=${req.Url}`
        const uri = Url.format({ protocol: 'https:', host, path })

        const signOpts = {
            uri,
            host,
            service,
            path,
            json: true,
            region
        }

        const signRes = Aws4.sign(signOpts, awsCredentials)

        rp(signRes).then(response => {
            console.log(response.toJSON())
            return cb(response.toJSON())
        })
        .catch(function (err) {
            console.log('error!', err)
            return cb(err)
        })
  
    }
}
