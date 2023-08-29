import { ServiceWorker } from "../utils/ServiceWorker.mjs";

export class DataBase {
    // get(name) {
    // }

    static async #transaction(request) {
        
        await ServiceWorker.postMessage(request)
        
    }

    static read(path) {

    }

    static write(path, value) {

    }
}