export class SpeechSynthesis {

    /**
     * @var {SpeechSynthesisUtterance}
     */
    #statement

    constructor() {
        this.#statement = new SpeechSynthesisUtterance()
    }

    /**
     * @returns {string[]}
     */
    get languages() {
        const list = []
        if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices()
            for (let voice of voices) {
                if (list.indexOf(voice.lang) < 0) {
                    list.push(voice.lang)
                }
            }
        }
        return list
    }

    /**
     * @param {SpeechSynthesisVoice} value
     */
    set voice(value) {
        this.#statement.voice = value
    }

    /**
     * @param {string} lang
     * @returns {SpeechSynthesisVoice[]}
     */
    voices(lang = '') {
        if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices()
            if (lang) {
                const list = []
                for (let voice of voices) {
                    if (lang === voice.lang) {
                        list.push(voice)
                    }
                }
                return list
            } else {
                return voices
            }
        }
        return []
    }

    /**
     * @param {string} speech
     * @returns {void}
     */
    speak(speech) {
        if ('speechSynthesis' in window) {
            this.#statement.text = speech
            window.speechSynthesis.speak(this.#statement)
        }
    }
}