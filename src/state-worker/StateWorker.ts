
///<reference path='../typings/master.d.ts' />

import _ = require('lodash');

import ironworks = require('ironworks');

import idHelper = ironworks.helpers.idHelper;

import IWorker = ironworks.workers.IWorker;

import redisWorker = require('redis-worker');
import RedisWorker = redisWorker.RedisWorker;

import IStateWorkerOpts = require('./IStateWorkerOpts');

class StateWorker extends RedisWorker implements IWorker {
    constructor(opts?: IStateWorkerOpts) {
        var defOpts: IStateWorkerOpts = {};
        super(_.isUndefined(opts) ? defOpts.redis : opts.redis);
        this.opts = this.opts.beAdoptedBy(defOpts, 'redis');
        this.opts.merge(opts);
        this.me.name = 'iw-state';
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
            }
            if (!_.isUndefined(cb)) {
                cb(e);
            }
        });
    }

    public postInit(deps?, cb?): IWorker {
        return super.postInit(deps, (e) => {
            if (e === null) {
                //add listeners here
            }
            if (!_.isUndefined(cb)) {
                cb(e);
            }
        });
    }
}

export = StateWorker;
