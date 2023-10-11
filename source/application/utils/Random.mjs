export class Random {

    /**
     * @param {number} init
     * @param {number} end
     * @param {boolean} int
     * @returns {number}
     */
    static between(init = 0.0, end = 1.0, int = false) {
        const random = Math.random() * end
        return int ? parseInt(random + init) : random + init
    }
}