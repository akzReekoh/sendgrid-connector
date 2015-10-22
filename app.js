'use strict';

var platform = require('./platform'),
	sendgrid, config;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	var isJSON = require('is-json');

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

	platform.log('Sendgrid Connector Initialized.');
	platform.notifyReady();
});
