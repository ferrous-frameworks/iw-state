///<reference path='../typings/master.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var async = require('async');
var redisWorker = require('redis-worker');
var RedisWorker = redisWorker.RedisWorker;
var StateWorker = (function (_super) {
    __extends(StateWorker, _super);
    function StateWorker(opts) {
        var defOpts = {
            redisChannelPrefix: 'iw-worker-state'
        };
        _super.call(this, _.isUndefined(opts) ? defOpts.redis : opts.redis);
        this.opts = this.opts.beAdoptedBy(defOpts, 'redis');
        this.opts.merge(opts);
        this.me.name = 'iw-state';
        this.redisChannelPrefix = this.opts.get('redisChannelPrefix');
    }
    StateWorker.prototype.init = function (cb) {
        var _this = this;
        return _super.prototype.init.call(this, function (e) {
            if (e === null) {
                _this.annotate({
                    internal: true
                }).verify('monitor', function (key, cb, anno, emit) {
                    var channel = _this.getChannel(emit, key);
                    async.waterfall([
                        function (cb) {
                            _this.request('subscribe', channel, function (e) {
                                if (e === null) {
                                    _this.info('message-' + channel, function (message) {
                                        _this.inform(emit.emitter.name + '.state-update-' + key, message);
                                    });
                                }
                                cb(e);
                            });
                        },
                        function (cb) {
                            _this.request('get', channel, function (e, current) {
                                _this.inform(emit.emitter.name + '.state-update-' + key, current);
                                cb(e);
                            });
                        }
                    ], function (e) {
                        cb(e);
                    });
                });
                _this.annotate({
                    internal: true
                }).verify('unmonitor', function (key, cb, anno, emit) {
                    var channel = _this.getChannel(emit, key);
                    _this.removeAllListeners('message-' + channel);
                    _this.request('unsubscribe', channel, function (e) {
                        cb(e);
                    });
                });
                _this.annotate({
                    internal: true
                }).verify('save', function (state, cb, anno, emit) {
                    var channel = _this.getChannel(emit, state.key);
                    async.waterfall([
                        function (cb) {
                            _this.request('get', channel, function (e, current) {
                                cb(e, current);
                            });
                        },
                        function (current, cb) {
                            if (!_.isEqual(current, state.value)) {
                                _this.check('set', {
                                    key: channel,
                                    value: _.extend(current === null ? {} : current, state.value)
                                }, function (e) {
                                    cb(e);
                                });
                            }
                            else {
                                cb(null);
                            }
                        },
                        function (cb) {
                            _this.request('publish', {
                                channel: channel,
                                value: state.value
                            }, function (e) {
                                cb(e);
                            });
                        }
                    ], function (e) {
                        cb(e);
                    });
                });
                _this.annotate({
                    internal: true
                }).verify('delete', function (key, cb, anno, emit) {
                    var channel = _this.getChannel(emit, key);
                    async.waterfall([
                        function (cb) {
                            _this.request('del', channel, function (e) {
                                cb(e);
                            });
                        },
                        function (cb) {
                            _this.request('publish', {
                                channel: channel,
                                value: null
                            }, function (e) {
                                cb(e);
                            });
                        }
                    ], function (e) {
                        cb(e);
                    });
                });
                if (!_.isUndefined(cb)) {
                    cb(e);
                }
            }
            else if (!_.isUndefined(cb)) {
                cb(e);
            }
            else {
                _this.inform('error', e);
            }
        });
    };
    StateWorker.prototype.getChannel = function (emit, key) {
        var sections = [
            _.trimRight(this.redisChannelPrefix, ':'),
            emit.emitter.name,
            key
        ];
        return sections.join(':');
    };
    return StateWorker;
})(RedisWorker);
module.exports = StateWorker;
//# sourceMappingURL=StateWorker.js.map