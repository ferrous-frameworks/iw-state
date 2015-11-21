
///<reference path='../typings/master.d.ts' />

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
        s.info('ready', () => {
            done();
        }).start();
    });

    it("should ...", (done) => {
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
                })
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