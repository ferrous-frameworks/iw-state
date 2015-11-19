///<reference path='../typings/master.d.ts' />
var chai = require('chai');
var expect = chai.expect;
var ironworks = require('ironworks');
var Service = ironworks.service.Service;
var EnvironmentWorker = ironworks.workers.EnvironmentWorker;
var StateWorker = require('./StateWorker');
describe('state-worker', function () {
    beforeEach(function (done) {
        new Service('test-service')
            .use(new ironworks.workers.HttpServerWorker({
            apiRoute: 'api',
            port: 9967
        }))
            .use(new EnvironmentWorker('test', {
            genericConnections: [{
                    name: 'test-redis-service',
                    host: '127.0.0.1',
                    port: '6379',
                    type: 'redis'
                }]
        }))
            .use(new StateWorker())
            .start()
            .info('ready', function () {
            done();
        });
    });
    it("should ...", function (done) {
        done();
    });
});
//# sourceMappingURL=StateWorker.test.js.map