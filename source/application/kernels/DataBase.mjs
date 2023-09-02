export class DataBase {
    static get versions() {
        return {
            database: {
                version: 1,
                upgrade: {}
            }
        }
    }
}