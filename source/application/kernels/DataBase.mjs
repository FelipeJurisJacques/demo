export class DataBase {
    static get versions() {
        return {
            database: {
                version: 1,
                upgrade: {
                    stores: [
                        {
                            name: 'tabela_teste',
                            options: {
                                keyPath: 'id',
                                autoIncrement: true,
                            },
                            indexes: [
                                {
                                    name: 'indice',
                                    options: {
                                        unique: false,
                                    }
                                }
                            ],
                        },
                    ],
                }
            }
        }
    }
}