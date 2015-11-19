///<reference path='../typings/master.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var redisWorker = require('redis-worker');
var RedisWorker = redisWorker.RedisWorker;
var StateWorker = (function (_super) {
    __extends(StateWorker, _super);
    function StateWorker(opts) {
        var defOpts = {};
        _super.call(this, _.isUndefined(opts) ? defOpts.redis : opts.redis);
        this.opts = this.opts.beAdoptedBy(defOpts, 'redis');
        this.opts.merge(opts);
        this.me.name = 'iw-state';
    }
    StateWorker.prototype.init = function (cb) {
        var _this = this;
        return _super.prototype.init.call(this, function (e) {
            if (e === null) {
                var parentListeners = _.filter(_this.allCommListeners(), function (l) {
                    return l.commEvent.worker === _this.me.name;
                });
                _.each(parentListeners, function (l) {
                    l.annotation.internal = true;
                });
            }
            if (!_.isUndefined(cb)) {
                cb(e);
            }
        });
    };
    StateWorker.prototype.postInit = function (deps, cb) {
        return _super.prototype.postInit.call(this, deps, function (e) {
            if (e === null) {
            }
            if (!_.isUndefined(cb)) {
                cb(e);
            }
        });
    };
    return StateWorker;
})(RedisWorker);
module.exports = StateWorker;
//# sourceMappingURL=StateWorker.js.map