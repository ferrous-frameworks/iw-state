
declare module "state-worker" {

    import ironworks = require('ironworks');

    import IWorker = ironworks.workers.IWorker;
    import Worker = ironworks.workers.Worker;
    import IWorkerChildOpts = ironworks.options.IWorkerChildOpts;

    export interface IStateWorkerOpts extends IWorkerChildOpts {}

    export class StateWWorker extends Worker implements IWorker {
        constructor(opts?: IStateWorkerOpts);
    }
}
