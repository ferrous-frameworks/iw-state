///<reference path='../typings/master.d.ts' />
var chai = require('chai');
var expect = chai.expect;
var ironworks = require('ironworks');
var Service = ironworks.service.Service;
var s;
describe('state-worker', function () {
    beforeEach(function (done) {
        s = new Service('test-service');
        s.info('ready', function () {
            done();
        });
        s.start();
    });
    it("should ...", function (done) {
        done();
    });
});
//# sourceMappingURL=StateWorker.test.js.map