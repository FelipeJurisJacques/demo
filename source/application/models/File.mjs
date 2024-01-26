import { Model } from "../libraries/StorageDataBase/Model.mjs";

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