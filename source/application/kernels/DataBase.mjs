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
            },
            key_value: {
                version: 1,
                upgrade: {
                    stores: [
                        {
                            name: 'values',
                            options: {
                                keyPath: 'id',
                                autoIncrement: true,
                            },
                            indexes: [
                                {
                                    name: 'key',
                                    options: {
                                        unique: true,
                                    }
                                }
                            ],
                        },
                    ],
                }
            },
            recursive: {
                version: 1,
                upgrade: {
                    stores: [
                        {
                            name: 'storage',
                            options: {
                                keyPath: 'id',
                                autoIncrement: true,
                            },
                            indexes: [
                                {
                                    name: 'parent',
                                    options: {
                                        unique: false,
                                    }
                                }
                            ],
                        },
                    ],
                }
            },
            integrity: {
                version: 1,
                upgrade: {
                    stores: [
                        {
                            name: 'storage',
                            options: {
                                keyPath: 'id',
                                autoIncrement: true,
                            },
                            indexes: [
                                {
                                    name: 'key',
                                    options: {
                                        unique: false,
                                    }
                                },
                                {
                                    name: 'child',
                                    options: {
                                        unique: false,
                                    }
                                },
                                {
                                    name: 'parent',
                                    options: {
                                        unique: false,
                                    }
                                },
                                {
                                    name: 'updated',
                                    options: {
                                        unique: false,
                                    }
                                },
                                {
                                    name: 'deleted',
                                    options: {
                                        unique: false,
                                    }
                                },
                            ],
                        },
                    ],
                }
            },
        }
    }
}