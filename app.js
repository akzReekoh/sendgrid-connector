'use strict';

var platform = require('./platform'),
	sendgrid, config;


/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {

	sendgrid = require('sendgrid')(options.apikey);
	config = options;

	platform.log('Sendgrid Coneector Initialized.');
	platform.notifyReady();
});

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {

	var email_config = {};

	if (config.defaukt) {
		email_config.to = config.to;
		email_config.from = config.from;
		email_config.subject = config.subject;
		email_config.text = config.body + '\n' + JSON.stringify(data); // append data in email
	}  else {
		email_config.to = data.to;
		email_config.from = data.from;
		email_config.subject = data.subject;
		email_config.text = data.body;
	}

	sendgrid.send(email_config, function(error, json) {
		if (error) {
			console.error(error);
			platform.handleException(error);
		}
	});

});
