import { Schema } from "../libraries/database/IndexedDataBase/Schema.mjs";
import { Upgrade } from "../libraries/database/IndexedDataBase/resources/Upgrade.mjs";
import { Connection } from "../libraries/database/IndexedDataBase/Connection.mjs";

const connection = new Connection('storage')
connection.open(13, function (event) {
    console.log(event)
    if (event instanceof Upgrade) {
        const files = event.table('files')
        if (files instanceof Schema) {
            files.column('id', {
                [Schema.KEY]: true,
                [Schema.AUTO_INCREMENT]: true,
            })
            files.column('hash', {
                [Schema.INDEX]: true,
            })
            files.column('path', {
                [Schema.INDEX]: true,
                [Schema.UNIQUE]: true,
            })
            files.column('type', {
                [Schema.INDEX]: true,
            })
            files.column('size', {
                [Schema.INDEX]: true,
            })
            files.column('content', {
                [Schema.HEAVY]: true,
            })
            files.column('updated', {
                [Schema.INDEX]: true,
            })
            files.save()
            console.log(files)
        }
    }
})