'use strict';

var _        = require('lodash'),
	platform = require('./platform'),
	sendgrid, config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	var isJSON = require('is-json');

	if (isJSON(data, true)) {
		console.log(data);

		var to, cc, bcc, replyTo, subject, body;

		if (!_.isEmpty(data.to))
			data.to = data.to.split(',');

		if (!_.isEmpty(data.cc))
			data.cc = data.cc.split(',');

		if (!_.isEmpty(data.bcc))
			data.bcc = data.bcc.split(',');

		if (!_.isEmpty(data.to))
			to = data.to;
		else
			to = config.to;

		if (!_.isEmpty(data.cc))
			cc = data.cc;
		else
			cc = config.cc;

		if (!_.isEmpty(data.bcc))
			bcc = data.bcc;
		else
			bcc = config.bcc;

		if (!_.isEmpty(data.reply_to))
			replyTo = data.reply_to;
		else
			replyTo = config.reply_to;

		if (!_.isEmpty(data.subject))
			subject = data.subject;
		else
			subject = config.subject;

		if (!_.isEmpty(data.body))
			body = data.body;
		else
			body = config.body;

		if (_.isEmpty(to))
			return platform.handleException(new Error('Kindly specify email recipients.'));

		if (_.isEmpty(subject))
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

		if (!_.isEmpty(replyTo))
			params.replyto = replyTo;

		if (_.isEmpty(body))
			params.text = JSON.stringify(data, null, 4);
		else
			params.text = body + '\n\n' + JSON.stringify(data, null, 4);

		console.log(JSON.stringify(params));

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

	if (!_.isEmpty(config.to))
		config.to = config.to.split(',');

	if (!_.isEmpty(config.cc))
		config.cc = config.cc.split(',');

	if (!_.isEmpty(config.bcc))
		config.bcc = config.bcc.split(',');

	platform.log('Sendgrid Connector Initialized.');
	platform.notifyReady();
});
