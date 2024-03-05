import { Calendar } from "./Calendar.mjs"

export class Cryptography {

    /**
     * @method static
     * @returns {string}
     */
    static uuid() {
        const random = Math.random()
        const value = random.toString()
        return `${Calendar.timestamp()}${value.substring(2)}`
    }
}