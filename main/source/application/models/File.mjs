import { Model } from "../libraries/idb/Model.mjs";

export class File extends Model {
    static get table() {
        return 'files'
    }

    static get database() {
        return 'storage'
    }

    constructor() {
        super()
    }
}