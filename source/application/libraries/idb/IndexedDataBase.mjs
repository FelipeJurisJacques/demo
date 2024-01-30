import { Transaction } from "./Transaction.mjs"

export class IndexedDataBase {

    #name

    constructor(database) {
        this.#name = database
    }

    transaction(tables, write = false) {
        return new Transaction({
            mode: write ? 'readwrite' : 'readonly',
            trace: this.#trace(),
            tables: typeof tables === 'string' ? [tables] : tables,
            database: this.#name,
        })
    }

    #trace() {
        const error = new Error()
        const list = []
        for (let trace of error.stack.split('\n')) {
            trace = trace.trim()
            if (!trace.startsWith('at')) {
                continue
            }
            let parts = trace.split(' ')
            let item = {
                at: '',
                line: '',
                file: '',
            }
            item.file = parts.pop()
            item.at = parts.pop()
            if (item.at.indexOf('.') < 0) {
                continue
            }
            parts = item.at.split('.')
            if (parts.shift() === this.constructor.name) {
                continue
            }
            item.file = item.file.substring(1, item.file.length - 2)
            parts = item.file.split(':')
            parts.pop()
            item.line = parseInt(parts.pop())
            item.file = parts.join(':')
            list.push(item)
        }
        return list
    }
}