
///<reference path='../typings/master.d.ts' />

import ironworks = require('ironworks');
import IWorkerChildOpts = ironworks.options.IWorkerChildOpts;

import redisWorker = require('redis-worker');
import IRedisWorkerOpts = redisWorker.IRedisWorkerOpts;

interface IStateWorkerOpts extends IWorkerChildOpts {
    redis?: IRedisWorkerOpts;
}

export = IStateWorkerOpts;
