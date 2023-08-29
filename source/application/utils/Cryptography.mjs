export class Cryptography {

    /**
     * @method static
     * @returns {string}
     */
    static uuid() {
        const date = new Date()
        const random = Math.random()
        const value = random.toString()
        return `${date.getTime()}${value.substring(2)}`
    }
}