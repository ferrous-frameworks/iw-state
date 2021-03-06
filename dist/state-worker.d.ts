
/// <reference path='./typings/index.d.ts' />

declare module "iw-state" {

    import ironworks = require('ironworks');

    import IWorker = ironworks.workers.IWorker;
    import Worker = ironworks.workers.Worker;
    import IWorkerChildOpts = ironworks.options.IWorkerChildOpts;

    import redisWorker = require('iw-redis');
    import IRedisWorkerOpts = redisWorker.IRedisWorkerOpts;
    
    export interface IState {
        key: string;
        value: any;
    }

    export interface IStateWorkerOpts extends IWorkerChildOpts {
        redisChannelPrefix?: string;
        redis?: IRedisWorkerOpts;
    }

    export class StateWorker extends Worker implements IWorker {
        constructor(opts?: IStateWorkerOpts);
    }
}
