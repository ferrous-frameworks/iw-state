
///<reference path='../typings/master.d.ts' />

import _ = require('lodash');

import ironworks = require('ironworks');

import idHelper = ironworks.helpers.idHelper;

import IWorker = ironworks.workers.IWorker;
import Worker = ironworks.workers.Worker;

import IStateWorkerOpts = require('./IStateWorkerOpts');

class StateWorker extends Worker implements IWorker {
    constructor(opts?: IStateWorkerOpts) {
        super([], {
            id: idHelper.newId(),
            name: 'iw-state'
        }, opts);
        var defOpts: IStateWorkerOpts = {};
        this.opts = this.opts.beAdoptedBy(defOpts, 'worker');
        this.opts.merge(opts);
    }
}

export = StateWorker;
