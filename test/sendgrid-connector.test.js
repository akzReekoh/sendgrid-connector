'use strict'

const amqp = require('amqplib')

const API_KEY = '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'
const TO = 'akzdinglasan@gmail.com'
const FROM = 'help@reekoh.com'
const REPLY_TO = 'hello@reekoh.com'
const SUBJECT = 'Sendgrid Connector Notification'
const BODY = 'Test Email Notification'
const CC = 'adinglasan@reekoh.com'
const BCC = 'adinglasan@reekoh.com'

let _channel = null
let _conn = null
let app = null

describe('Sendgrid Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      apiKey: API_KEY,
      to: TO,
      from: FROM,
      replyTo: REPLY_TO,
      cc: CC,
      bcc: BCC
    })
    process.env.INPUT_PIPE = 'ip.sendgrid'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        subject: SUBJECT,
        body: BODY,
        'co2_1hr': '11%',
        'co2_8hr': '8%',
        'n_1hr': '70%',
        'n_8hr': '72%',
        'o2_1hr': '19%',
        'o2_8hr': '20%'
      }

      _channel.sendToQueue('ip.sendgrid', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})

// 'use strict';
//
// const API_KEY  = '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',
// 	  TO       = 'akzdinglasan@gmail.com',
// 	  FROM     = 'help@reekoh.com',
// 	  REPLY_TO = 'hello@reekoh.com',
// 	  SUBJECT  = 'Sendgrid Connector Notification',
// 	  BODY     = 'Test Email Notification',
// 	  CC = 'adinglasan@reekoh.com',
// 	  BCC = 'adinglasan@reekoh.com';
//
// var cp     = require('child_process'),
// 	should = require('should'),
// 	connector;
//
// describe('Connector', function () {
// 	this.slow(8000);
//
// 	after('terminate child process', function (done) {
// 		this.timeout(7000);
//
// 		connector.send({
// 			type: 'close'
// 		});
//
// 		setTimeout(function () {
// 			connector.kill('SIGKILL');
// 			done();
// 		}, 5000);
// 	});
//
// 	describe('#spawn', function () {
// 		it('should spawn a child process', function () {
// 			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
// 		});
// 	});
//
// 	describe('#handShake', function () {
// 		it('should notify the parent process when ready within 8 seconds', function (done) {
// 			this.timeout(8000);
//
// 			connector.on('message', function (message) {
// 				if (message.type === 'ready')
// 					done();
// 			});
//
// 			connector.send({
// 				type: 'ready',
// 				data: {
// 					options: {
// 						apikey: API_KEY,
// 						to: TO,
// 						from: FROM,
// 						reply_to: REPLY_TO,
// 						cc: CC,
// 						bcc: BCC
// 					}
// 				}
// 			}, function (error) {
// 				should.ifError(error);
// 			});
// 		});
// 	});
//
// 	describe('#data', function (done) {
// 		it('should process the JSON data', function () {
// 			connector.send({
// 				type: 'data',
// 				data: {
// 					subject: SUBJECT,
// 					body: BODY,
// 					co2_1hr: '11%',
// 					co2_8hr: '8%',
// 					n_1hr: '70%',
// 					n_8hr: '72%',
// 					o2_1hr: '19%',
// 					o2_8hr: '20%'
// 				}
// 			}, done);
// 		});
// 	});
//
// 	describe('#data', function (done) {
// 		it('should process the Array data', function () {
// 			connector.send({
// 				type: 'data',
// 				data: [
// 					{
// 						subject: SUBJECT,
// 						body: BODY,
// 						co2_1hr: '11%',
// 						co2_8hr: '8%',
// 						n_1hr: '70%',
// 						n_8hr: '72%',
// 						o2_1hr: '19%',
// 						o2_8hr: '20%'
// 					},
// 					{
// 						subject: SUBJECT,
// 						body: BODY,
// 						co2_1hr: '11%',
// 						co2_8hr: '8%',
// 						n_1hr: '70%',
// 						n_8hr: '72%',
// 						o2_1hr: '19%',
// 						o2_8hr: '20%'
// 					}
// 				]
// 			}, done);
// 		});
// 	});
// });