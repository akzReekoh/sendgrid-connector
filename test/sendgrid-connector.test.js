'use strict';

var API_KEY = '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',
	TO      = 'support@reekoh.com',
	FROM    = 'bsicam@reekoh.com',
	SUBJECT = 'Sendgrid Connector',
	BODY    = 'Test Mail';

var cp     = require('child_process'),
	should = require('should'),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function () {
		connector.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						apikey: API_KEY,
						to: TO,
						from: FROM
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the data', function () {
			connector.send({
				type: 'data',
				data: {
					subject: SUBJECT,
					body: BODY,
					co2_1hr: '11%',
					co2_8hr: '8%',
					n_1hr: '70%',
					n_8hr: '72%',
					o2_1hr: '19%',
					o2_8hr: '20%'
				}
			}, done);
		});
	});
});