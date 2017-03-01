'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let sendgrid = null

let sendData = (data, callback) => {
  if (isEmpty(data.to)) {
    data.to = _plugin.config.to.split(',')
  } else {
    data.to = data.to.split(',')
  }

  if (isEmpty(data.cc)) {
    if (!isEmpty(_plugin.config.cc)) {
      data.cc = _plugin.config.cc.split(',')
    }
  } else {
    data.cc = data.cc.split(',')
  }

  if (isEmpty(data.bcc)) {
    if (!isEmpty(_plugin.config.bcc)) {
      data.bcc = _plugin.config.bcc.split(',')
    }
  } else {
    data.bcc = data.bcc.split(',')
  }

  if (isEmpty(data.replyTo)) {
    data.replyTo = _plugin.config.replyTo
  }

  if (isEmpty(data.subject)) { data.subject = _plugin.config.subject }

  if (isEmpty(data.body)) {
    data.body = _plugin.config.body
  }

  if (isEmpty(data.to)) {
    return _plugin.logException(new Error('Kindly specify email recipients.'))
  }

  if (isEmpty(data.subject)) {
    return _plugin.logException(new Error('Kindly specify email subject.'))
  }

  let params = {
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
    from: data.from || _plugin.config.from,
    subject: data.subject
  }

  if (!isEmpty(data.replyTo)) {
    params.replyto = data.replyTo
  }

  if (isEmpty(data.body)) {
    params.text = JSON.stringify(data, null, 4)
  } else { params.text = data.body + '\n\n' + JSON.stringify(data, null, 4) }

  sendgrid.send(params, (error) => {
    if (!error) {
      _plugin.log(JSON.stringify({
        title: 'Sengrid Email Sent',
        data: params
      }))
    }

    callback(error)
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) _plugin.logException(error)
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) _plugin.logException(error)
    })
  } else { _plugin.logException(new Error('Invalid data received. ' + data)) }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  sendgrid = require('sendgrid')(_plugin.config.apiKey)

  _plugin.log('Sendgrid Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
