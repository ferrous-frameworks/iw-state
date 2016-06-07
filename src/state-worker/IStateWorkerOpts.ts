
///<reference path='../typings/index.d.ts' />

import ironworks = require('ironworks');
import IWorkerChildOpts = ironworks.options.IWorkerChildOpts;

import redisWorker = require('iw-redis');
import IRedisWorkerOpts = redisWorker.IRedisWorkerOpts;

interface IStateWorkerOpts extends IWorkerChildOpts {
    redisChannelPrefix?: string;
    redis?: IRedisWorkerOpts;
}

export = IStateWorkerOpts;
