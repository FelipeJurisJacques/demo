export class File {

    /**
     * @var {File|null}
     */
    #file

    /**
     * @var {FileSystemEntry|FileSystemDirectoryEntry|null}
     */
    #entry

    /**
     * @var {FileSystemFileHandle|FileSystemDirectoryHandle|null}
     */
    #handle

    /**
     * @var {DataTransferItem|null}
     */
    #stream

    static files(stream) {
        const data = []
        if (typeof stream === 'object') {
            if (stream instanceof DataTransfer) {
                if (stream.items) {
                    for (let item of stream.items) {
                        data.push(new File(item))
                    }
                }
            } else if (stream instanceof DataTransferItemList) {
                for (let item of stream) {
                    data.push(new File(item))
                }
            } else if (stream instanceof DataTransferItem) {
                data.push(new File(stream))
            }
        }
        return data
    }

    constructor(stream = null) {
        this.#file = null
        this.#entry = null
        this.#handle = null
        this.#stream = null
        if (stream instanceof DataTransferItem) {
            this.#stream = stream
            if (this.#stream.getAsFile) {
                this.#file = this.#stream.getAsFile()
            }
            if (this.#stream.webkitGetAsEntry) {
                this.#entry = this.#stream.webkitGetAsEntry()
            }
            if (this.#stream.getAsFileSystemHandle) {
                this.#stream.getAsFileSystemHandle().then(handle => {
                    this.#handle = handle
                })
            }
        }
    }

    get isFile() {
        if (this.#entry && this.#entry.isFile) {
            return true
        }
        if (this.#handle && this.#handle.kind === 'file') {
            return true
        }
        if (this.#stream && this.#stream.kind === 'file') {
            return true
        }
        if (this.type) {
            return true
        }
        return false
    }

    get isDirectory() {
        if (this.#entry && this.#entry.isDirectory) {
            return true
        }
        if (this.#handle && this.#handle.kind === 'directory') {
            return true
        }
        if (this.#stream && this.#stream.kind === 'directory') {
            return true
        }
        if (!this.type) {
            return true
        }
        return false
    }

    get name() {
        if (this.#file && this.#file.name) {
            return this.#file.name
        }
        if (this.#entry && this.#entry.name) {
            return this.#entry.name
        }
        if (this.#handle && this.#handle.name) {
            return this.#handle.name
        }
        return ''
    }

    get type() {
        if (this.#file && this.#file.type) {
            return this.#file.type
        }
        if (this.#handle && this.#handle.mime) {
            return this.#handle.mime
        }
        if (this.#stream && this.#stream.type) {
            return this.#stream.type
        }
        return ''
    }

    get size() {
        if (this.#file && this.#file.size) {
            return this.#file.size
        }
        return 0
    }

    get modified() {
        if (this.#file && this.#file.lastModified) {
            return new Date(this.#file.lastModified)
        }
        return null
    }

    get content() {
        return new Promise(async (resolve, reject) => {
            if (this.#file && this.#file.text) {
                resolve(await this.#file.text())
            } else {
                reject(new Error('undefined file'))
            }
        })
    }

    get extension() {
        const name = this.name
        const list = name.split('.')
        if (list.length > 1) {
            const extension = list[list.length - 1]
            return extension.toLowerCase()
        }
        return ''
    }
}