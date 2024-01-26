export class Model {
    static find() {
        console.log(this.database)
    }

    static get table() {
        throw new Error('implements')
    }
    
    static get database() {
        throw new Error('implements')
    }

    constructor() {

    }

    save() {
        console.log(this.constructor.table)
    }
}