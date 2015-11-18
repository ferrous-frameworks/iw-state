///<reference path='../typings/master.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ironworks = require('ironworks');
var idHelper = ironworks.helpers.idHelper;
var Worker = ironworks.workers.Worker;
var StateWorker = (function (_super) {
    __extends(StateWorker, _super);
    function StateWorker(opts) {
        _super.call(this, [], {
            id: idHelper.newId(),
            name: 'iw-state'
        }, opts);
        var defOpts = {};
        this.opts = this.opts.beAdoptedBy(defOpts, 'worker');
        this.opts.merge(opts);
    }
    return StateWorker;
})(Worker);
module.exports = StateWorker;
//# sourceMappingURL=StateWorker.js.map