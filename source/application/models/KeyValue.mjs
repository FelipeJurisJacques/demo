import { IndexedDataBase } from "../utils/IndexedDataBase.mjs";

export class KeyValue {
    
    /**
     * @param {string} key
     * @returns {any}
     */
    static async getValue(key) {
        const connection = IndexedDataBase.from('key_value')
        await connection.open()
        const transaction = connection.transaction('values', false)
        const storage = transaction.storage('values')
        const index = storage.index('key')
        const line = await index.get(key)
        connection.close()
        return line.value
    }

    /**
     * @param {string} key
     * @param {any} value
     * @returns {void}
     */
    static async setValue(key, value) {
        const connection = IndexedDataBase.from('key_value')
        await connection.open()
        const transaction = connection.transaction('values', true)
        const storage = transaction.storage('values')
        const index = storage.index('key')
        const line = await index.get(key)
        if (line) {
            if (line.value === value) {
                transaction.abort()
            } else {
                line.value = value
                storage.put(line)
                transaction.commit()
            }
        } else {
            await storage.add({
                key: key,
                value: value,
            })
            transaction.commit()
        }
        connection.close()
    }
}