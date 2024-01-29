import { Connection } from "../libraries/StorageDataBase/Connection.mjs"
import { File as FileModel } from "../models/File.mjs"

export class File {

    /**
     * @var {number}
     */
    static #mmt

    /**
     * @var {number}
     */
    static #tmp

    /**
     * @var {File[]}
     */
    static #externals = []

    /**
     * @var {int}
     */
    #id

    /**
     * @var {File|null}
    */
    #file

    /**
    * @var {String}
    */
    #path

    /**
     * @var {int}
     */
    #size

    /**
     * @var {String}
     */
    #type

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

    /**
     * @var {int}
     */
    #parent

    /**
     * @var {bool}
     */
    #deleted

    /**
     * @var {int}
     */
    #created

    /**
     * @var {int}
     */
    #updated

    static async install() {
        const folders = [
            'mmt',
            'tmp',
            'home',
        ]
        const connection = Connection.from(FileModel.database)
        const transaction = await connection.transaction(FileModel.table, true)
        try {
            const query = await FileModel.select()
            query.where('parent', '=', 0)
            const files = await query.all()
            const time = (new Date()).getTime()
            for (let folder of folders) {
                let model = null
                for (let file of files) {
                    if (folder === file.name) {
                        model = file
                        break
                    }
                }
                if (!model) {
                    let model = new FileModel()
                    model.name = folder
                    model.size = null
                    model.type = null
                    model.parent = 0
                    model.deleted = false
                    model.created = time
                    model.updated = time
                    await model.save()
                }
                switch (folder) {
                    case 'mmt':
                        this.#mmt = model.id
                        break
                    case 'tmp':
                        this.#tmp = model.id
                        break
                    default:
                        break
                }
            }
            transaction.commit()
        } catch (error) {
            console.error(error)
            transaction.abort()
        }
    }

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

    static async glob(path = '/*') {
        const names = path.split('/')
        const level = names.length - 2
        if (level < 0) {
            return []
        }
        const result = []
        const transaction = await this.#connection.transaction('files')
        const query = transaction.select()
        if (level === 0) {
            query.where('parent', '=', 0)
            const files = await query.all()
            for (let file of files) {
                file.path = `/${file.name}`
                console.log(file)
                result.push(new File(file))
            }
        }
        return result
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
            File.#externals.push(this)
        } else {
            this.#id = stream.id
            this.#path = stream.path
            this.#size = stream.size
            this.#type = stream.type
            this.#parent = stream.parent
            this.#created = stream.created
            this.#deleted = stream.deleted
            this.#updated = stream.updated
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

    get path() {
        if (this.#path) {
            return this.#path
        }
        let path
        if (this.#file && this.#file.name) {
            path = this.#file.name
        }
        if (this.#entry && this.#entry.fullPath) {
            path = this.#entry.fullPath
        }
        if (this.#handle && this.#handle.name) {
            path = this.#handle.name
        }
        if (path) {
            if (path.substring(0, 1) === '/') {
                path = path.substring(1)
            }
            return `/storage/${path}`
        }
        return ''
    }

    get origin() {
        const path = this.path
        const index = path.lastIndexOf('/')
        return path.substring(0, index + 1)
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
        if (this.#path) {
            const list = this.#path.split('/')
            return list[list.length - 1]
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
        if (this.#updated) {
            return this.#updated
        }
        return null
    }

    get content() {
        return new Promise(async (resolve, reject) => {
            if (this.#file && this.#file.text) {
                resolve(await this.#file.text())
            } else if (this.#id) {
                const query = Query.connection('storage')
                query.from('files_content')
                query.where(Query.equal('file_id', this.#id))
                const file = await query.fetch()
                console.log(file)
                if (!file) {
                    const time = (new Date()).getTime()
                    query = new Query(connection)
                    query.from('files')
                    const id = await query.add({
                        path: path,
                        size: this.size,
                        type: this.type,
                        deleted: false,
                        created: time,
                        updated: time,
                    })
                    query = new Query(connection)
                    await query.add({
                        file_id: id,
                        content: content,
                    })
                    result = new File()
                    result.#id = id
                    result.#path = path
                }
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

    async copy(to) {
        if (!to || to.substr(-1, 1) !== '/') {
            return null
        }
        const from = this.origin
        const content = await this.content
        // do dispositivo
        if (from.substring(0, 8) === '/storage') {
            // para diretorio temporario
            if (to.substring(0, 10) === '/temporary') {
                const path = `${to}${this.name}`
                const connection = Connection.from('storage')
                await connection.open()
                const transaction = connection.transaction([
                    'files',
                    'files_content',
                ], true)
                let result = null
                try {
                    let query = new Query(connection)
                    query.from('files')
                    query.where(Query.equal('path', path))
                    const file = await query.fetch()
                    console.log(file)
                    if (!file) {
                        const time = (new Date()).getTime()
                        query = new Query(connection)
                        query.from('files')
                        const id = await query.add({
                            path: path,
                            size: this.size,
                            type: this.type,
                            deleted: false,
                            created: time,
                            updated: time,
                        })
                        query = new Query(connection)
                        query.from('files_content')
                        await query.add({
                            file_id: id,
                            content: content,
                        })
                        result = new File()
                        result.#id = id
                        result.#path = path
                    }
                    transaction.commit()
                } catch (error) {
                    console.error(error)
                    transaction.abort()
                } finally {
                    connection.close()
                }
                console.log(result)
                return result
            }
        }
        return null
    }

    async save() {
        if (!this.#path) {
            throw new Error('path is invalid')
        }
        const content = await this.content
        const connection = IndexedDataBase.from('files')
        await connection.open()
        const transaction = connection.transaction([
            'files',
            'paths',
        ], true)
        let result = null
        try {
            const fstorage = transaction.storage('files')
            const pstorage = transaction.storage('paths')
            const index = pstorage.index('path')
            if (await index.empty(this.#path)) {
                const time = (new Date).getTime()
                const id = await pstorage.add({
                    path: this.path,
                    size: this.size,
                    type: this.type,
                    parent: null,
                    deleted: false,
                    created: time,
                    updated: time,
                })
                await fstorage.add({
                    path: id,
                    content: content,
                })
                result = new File()
                result.#id = id
                result.#path = path
            }
            transaction.commit()
        } catch (error) {
            console.error(error)
            transaction.abort()
        } finally {
            connection.close()
        }
        return result
    }

    static get #connection() {
        return Connection.from('storage')
    }
}