
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

describe('state-worker', () => {
    beforeEach((done) => {
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
            .info('ready', () => {
                done();
            });
    });

    it("should ...", (done) => {
        done();
    });
});