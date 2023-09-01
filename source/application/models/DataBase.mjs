import { ServiceWorker } from "../utils/ServiceWorker.mjs";

export class DataBase {
    // get(name) {
    // }

    static async #transaction(request) {
        return ServiceWorker.message.request(request, 'database', 1000)
    }

    static read(path) {

    }

    static write(path, value) {

    }
}