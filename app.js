'use strict';

var isEmpty       = require('lodash.isempty'),
	isPlainObject = require('lodash.isplainobject'),
	isArray = require('lodash.isarray'),
	async = require('async'),
	platform      = require('./platform'),
	sendgrid, config;

let sendData = (data) => {
	if (isEmpty(data.to))
		data.to = config.to.split(',');
	else
		data.to = data.to.split(',');

	if (isEmpty(data.cc))
		data.cc = config.cc.split(',');
	else
		data.cc = data.cc.split(',');

	if (isEmpty(data.bcc))
		data.bcc = config.bcc.split(',');
	else
		data.bcc = data.bcc.split(',');

	if (isEmpty(data.reply_to))
		data.reply_to = config.reply_to;

	if (isEmpty(data.subject))
		data.subject = config.subject;

	if (isEmpty(data.body))
		data.body = config.body;

	if (isEmpty(data.to))
		return platform.handleException(new Error('Kindly specify email recipients.'));

	if (isEmpty(data.subject))
		return platform.handleException(new Error('Kindly specify email subject.'));

	var params = {
		to: data.to,
		cc: data.cc,
		bcc: data.bcc,
		from: data.from || config.from,
		subject: data.subject
	};

	if (!isEmpty(data.reply_to))
		params.replyto = data.reply_to;

	if (isEmpty(data.body))
		params.text = JSON.stringify(data, null, 4);
	else
		params.text = data.body + '\n\n' + JSON.stringify(data, null, 4);

	sendgrid.send(params, function (error) {
		if (error) {
			console.error(error);
			platform.handleException(error);
		}
		else {
			platform.log(JSON.stringify({
				title: 'Sengrid Email Sent',
				data: params
			}));
		}
	});
};

platform.on('data', function (data) {
	if (isPlainObject(data)) {
		sendData(data);
	}
	else if(isArray(data)){
		async.each(data, (datum) => {
			sendData(datum);
		});
	}
	else
		platform.handleException(new Error('Invalid data received. ' + data));
});

platform.on('close', function () {
	platform.notifyClose();
});

platform.once('ready', function (options) {
	sendgrid = require('sendgrid')(options.apikey);
	config = options;

	platform.log('Sendgrid Connector Initialized.');
	platform.notifyReady();
});
