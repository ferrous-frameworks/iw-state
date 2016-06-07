
///<reference path='../typings/index.d.ts' />

import async = require('async');
import _ = require('lodash');
import chai = require('chai');
var expect = chai.expect;

import ironworks = require('ironworks');

import IService = ironworks.service.IService;
import Service = ironworks.service.Service;
import EnvironmentWorker = ironworks.workers.EnvironmentWorker;

import StateWorker = require('./StateWorker');
import IState = require('./IState');

interface ITest {
    some: string;
}
var test: ITest = {
    some: 'data'
};
var channelPrefix = 'state-worker-tests-channel';
var s: IService;
describe('state-worker', () => {
    beforeEach((done) => {
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
        s.info('ready', () => {
            done();
        }).start();
    });

    it("should be able to save and monitor worker state keys", (done) => {
        var key = 'test-state-key';
        s.info<any>('state-update-' + key, (state) => {
            expect(state.some).to.be.equal(test.some);
            done();
        });
        async.waterfall([
            (cb) => {
                s.check<IState>('iw-state.save', {
                    key: key,
                    value: test
                }, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.check<string>('iw-state.monitor', key, (e) => {
                    cb(e);
                });
            }
        ], (e) => {
            expect(e).to.be.null;
        });
    });

    it("should be able to unmonitor worker state keys", (done) => {
        var key = 'test-state-key';
        async.waterfall([
            (cb) => {
                s.check<IState>('iw-state.save', {
                    key: key,
                    value: test
                }, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.check<string>('iw-state.monitor', key, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.info<any>('state-update-' + key, (state) => {
                    throw new Error("state-update shouldn't have been called because it was unmonitored");
                }).check<string>('iw-state.unmonitor', key, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.check<IState>('iw-state.save', {
                    key: key,
                    value: test
                }, (e) => {
                    setTimeout(() => {
                        cb(e);
                    }, 100);
                });
            }
        ], (e) => {
            expect(e).to.be.null;
            done();
        });
    });

    it("should be able to delete worker state keys", (done) => {
        var key = 'test-state-key';
        async.waterfall([
            (cb) => {
                s.check<IState>('iw-state.save', {
                    key: key,
                    value: test
                }, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.check<string>('iw-state.monitor', key, (e) => {
                    cb(e);
                });
            },
            (cb) => {
                s.info<any>('state-update-' + key, (state) => {
                    expect(state).to.be.null;
                    cb(null);
                }).check<string>('iw-state.delete', key, (e) => {
                    expect(e).to.be.null;
                });
            }
        ], (e) => {
            expect(e).to.be.null;
            done();
        });
    });

    afterEach((done) => {
        if (!_.isUndefined(s)) {
            async.waterfall([
                (cb) => {
                    s.check<string>('iw-state.del-pattern', channelPrefix + '*', (e) => {
                        cb(e);
                    });
                },
                (cb) => {
                    s.dispose(() => {
                        cb(null);
                    });
                }
            ], (e) => {
                expect(e).to.be.null;
                done();
            });
        }
    });
});