
///<reference path='../typings/master.d.ts' />

import chai = require('chai');
var expect = chai.expect;

import async = require('async');
import _ = require('lodash');

import ironworks = require('ironworks');

import IService = ironworks.service.IService;
import Service = ironworks.service.Service;

var s: IService;

describe('state-worker', () => {
    beforeEach((done) => {
        s = new Service('test-service');
        s.info('ready', () => {
            done();
        });
        s.start();
    });

    it("should ...", (done) => {
        done();
    });
});