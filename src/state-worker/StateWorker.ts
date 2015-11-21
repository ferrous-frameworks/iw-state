
///<reference path='../typings/master.d.ts' />

import _ = require('lodash');
import async = require('async');

import ironworks = require('ironworks');

import idHelper = ironworks.helpers.idHelper;

import IWorker = ironworks.workers.IWorker;
import ICommEmitData = ironworks.eventing.ICommEmitData;

import redisWorker = require('redis-worker');
import RedisWorker = redisWorker.RedisWorker;
import IPublish = redisWorker.IPublish;
import ISubscriptionMessage = redisWorker.ISubscriptionMessage;
import ISet = redisWorker.ISet;

import IStateWorkerOpts = require('./IStateWorkerOpts');
import IState = require('./IState');

class StateWorker extends RedisWorker implements IWorker {
    private redisChannelPrefix: string;

    constructor(opts?: IStateWorkerOpts) {
        var name = 'iw-state';
        var defOpts: IStateWorkerOpts = {
            redisChannelPrefix: name
        };
        super(_.isUndefined(opts) ? defOpts.redis : opts.redis);
        this.opts = this.opts.beAdoptedBy(defOpts, 'redis');
        this.opts.merge(opts);
        this.me.name = name;
        this.redisChannelPrefix = this.opts.get<string>('redisChannelPrefix');
    }

    public init(cb?): IWorker {
        return super.init((e) => {
            if (e === null) {
                var parentListeners = _.filter(this.allCommListeners(), (l) => {
                    return l.commEvent.worker === this.me.name;
                });
                _.each(parentListeners, (l) => {
                    l.annotation.internal = true;
                });
                this.verify<string>('monitor', (key, cb, anno, emit) => {
                    var channel = this.getChannel(emit, key);
                    async.waterfall([
                        (cb) => {
                            this.request<string, string>('subscribe', channel, (e) => {
                                if (e === null) {
                                    this.info<ISubscriptionMessage>('message-' + channel, (message) => {
                                        this.inform(emit.emitter.name + '.state-update-' + key, message);
                                    });
                                }
                                cb(e);
                            });
                        },
                        (cb) => {
                            this.request<string, any>('get', channel, (e, current) => {
                                this.inform(emit.emitter.name + '.state-update-' + key, current);
                                cb(e);
                            });
                        }
                    ], (e) => {
                        cb(e)
                    });
                });
                this.verify<IState>('save', (state, cb, anno, emit) => {
                    var channel = this.getChannel(emit, state.key);
                    async.waterfall([
                        (cb) => {
                            this.request<string, any>('get', channel, (e, current) => {
                                cb(e, current);
                            });
                        },
                        (current, cb) => {
                            if (!_.isEqual(current, state.value)) {
                                this.check<ISet>('set', {
                                    key: channel,
                                    value: _.extend(current === null ? {} : current, state.value)
                                }, (e) => {
                                    cb(e);
                                });
                            }
                            else {
                                cb(null);
                            }
                        },
                        (cb) => {
                            this.request<IPublish, string>('publish', {
                                channel: channel,
                                value: state.value
                            }, (e) => {
                                cb(e);
                            });
                        }
                    ], (e) => {
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
                this.inform('error', e);
            }
        });
    }

    private getChannel(emit: ICommEmitData, key: string): string {
        var sections = [
            _.trimRight(this.redisChannelPrefix, '-'),
            emit.emitter.name,
            key
        ];
        return sections.join('~');
    }
}

export = StateWorker;
