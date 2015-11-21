///<reference path='../typings/master.d.ts' />
var async = require('async');
var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;
var ironworks = require('ironworks');
var Service = ironworks.service.Service;
var EnvironmentWorker = ironworks.workers.EnvironmentWorker;
var StateWorker = require('./StateWorker');
var test = {
    some: 'data'
};
var channelPrefix = 'state-worker-tests-channel';
var s;
describe('state-worker', function () {
    beforeEach(function (done) {
        s = new Service('test-service')
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
            .use(new StateWorker({
            redisChannelPrefix: channelPrefix
        }));
        s.info('ready', function () {
            done();
        }).start();
    });
    it("should ...", function (done) {
        var key = 'test-state-key';
        s.info('state-update-' + key, function (state) {
            expect(state.some).to.be.equal(test.some);
            done();
        });
        async.waterfall([
            function (cb) {
                s.check('iw-state.save', {
                    key: key,
                    value: test
                }, function (e) {
                    cb(e);
                });
            },
            function (cb) {
                s.check('iw-state.monitor', key, function (e) {
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
        });
    });
    afterEach(function (done) {
        if (!_.isUndefined(s)) {
            async.waterfall([
                function (cb) {
                    s.check('iw-state.del-pattern', channelPrefix + '*', function (e) {
                        cb(e);
                    });
                },
                function (cb) {
                    s.dispose(function () {
                        cb(null);
                    });
                }
            ], function (e) {
                expect(e).to.be.null;
                done();
            });
        }
    });
});
//# sourceMappingURL=StateWorker.test.js.map