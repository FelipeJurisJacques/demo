import { SharedWorker } from "../libraries/workers/SharedWorker.mjs";

export class IndexedDataBaseSharedWorker extends SharedWorker {
    constructor(database) {
        super(new URL(
            `${location.origin}/source/application/services/IndexedDataBaseSharedWorker.mjs`
        ), database)
    }
}