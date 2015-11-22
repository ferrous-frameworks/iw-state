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
    it("should be able to save and monitor worker state keys", function (done) {
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
    it("should be able to unmonitor worker state keys", function (done) {
        var key = 'test-state-key';
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
            },
            function (cb) {
                s.info('state-update-' + key, function (state) {
                    throw new Error("state-update shouldn't have been called because it was unmonitored");
                }).check('iw-state.unmonitor', key, function (e) {
                    cb(e);
                });
            },
            function (cb) {
                s.check('iw-state.save', {
                    key: key,
                    value: test
                }, function (e) {
                    setTimeout(function () {
                        cb(e);
                    }, 100);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to delete worker state keys", function (done) {
        var key = 'test-state-key';
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
            },
            function (cb) {
                s.info('state-update-' + key, function (state) {
                    expect(state).to.be.null;
                    cb(null);
                }).check('iw-state.delete', key, function (e) {
                    expect(e).to.be.null;
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
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