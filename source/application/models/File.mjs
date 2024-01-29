import { Model } from "../libraries/StorageDataBase/Model.mjs";
import { Connection } from "../libraries/StorageDataBase/Connection.mjs";

export class File extends Model {

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

    static get table() {
        return 'files'
    }

    static get database() {
        return 'storage'
    }
    
    static async install() {
        const folders = [
            'mmt',
            'tmp',
            'home',
        ]
        const connection = Connection.from(this.database)
        const transaction = await connection.transaction(this.table, true)
        try {
            const query = await this.select()
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
                    let model = new this.prototype.constructor()
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

    constructor() {
        super()
    }
}