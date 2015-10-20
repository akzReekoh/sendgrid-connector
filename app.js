'use strict';

var isJSON   = require('is-json'),
	platform = require('./platform'),
	sendgrid, config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (isJSON(data, true)) {
		var params = {
			to: data.to || config.to,
			from: data.from || config.from,
			subject: data.subject || config.subject
		};

		delete data.to;
		delete data.from;
		delete data.subject;
		delete data.body;

		params.html = data.body || ((config.body || '') + '\n\n' + JSON.stringify(data, null, 4));

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
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	sendgrid = require('sendgrid')(options.apikey);
	config = options;

	platform.log('Sendgrid Connector Initialized.');
	platform.notifyReady();
});
