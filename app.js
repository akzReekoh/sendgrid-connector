'use strict';

var isEmpty       = require('lodash.isempty'),
	isPlainObject = require('lodash.isplainobject'),
	platform      = require('./platform'),
	sendgrid, config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (isPlainObject(data)) {
		var to, cc, bcc, replyTo, subject, body;

		if (!isEmpty(data.to))
			data.to = data.to.split(',');

		if (!isEmpty(data.cc))
			data.cc = data.cc.split(',');

		if (!isEmpty(data.bcc))
			data.bcc = data.bcc.split(',');

		if (!isEmpty(data.to))
			to = data.to;
		else
			to = config.to;

		if (!isEmpty(data.cc))
			cc = data.cc;
		else
			cc = config.cc;

		if (!isEmpty(data.bcc))
			bcc = data.bcc;
		else
			bcc = config.bcc;

		if (!isEmpty(data.reply_to))
			replyTo = data.reply_to;
		else
			replyTo = config.reply_to;

		if (!isEmpty(data.subject))
			subject = data.subject;
		else
			subject = config.subject;

		if (!isEmpty(data.body))
			body = data.body;
		else
			body = config.body;

		if (isEmpty(to))
			return platform.handleException(new Error('Kindly specify email recipients.'));

		if (isEmpty(subject))
			return platform.handleException(new Error('Kindly specify email subject.'));

		var params = {
			to: to,
			cc: cc,
			bcc: bcc,
			from: data.from || config.from,
			subject: subject
		};

		delete data.to;
		delete data.from;
		delete data.subject;
		delete data.body;

		if (!isEmpty(replyTo))
			params.replyto = replyTo;

		if (isEmpty(body))
			params.text = JSON.stringify(data, null, 4);
		else
			params.text = body + '\n\n' + JSON.stringify(data, null, 4);

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
	}
	else
		platform.handleException(new Error('Invalid data received. ' + data));
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	platform.notifyClose();
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	sendgrid = require('sendgrid')(options.apikey);
	config = options;

	if (!isEmpty(config.to))
		config.to = config.to.split(',');

	if (!isEmpty(config.cc))
		config.cc = config.cc.split(',');

	if (!isEmpty(config.bcc))
		config.bcc = config.bcc.split(',');

	platform.log('Sendgrid Connector Initialized.');
	platform.notifyReady();
});
