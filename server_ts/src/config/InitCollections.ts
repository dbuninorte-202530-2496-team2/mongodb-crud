import { Db } from "mongodb";

export async function initializeCollections(db: Db) {
	try {
		await createAutorCollection(db);
		await createLibroCollection(db);
		await createAutoreaCollection(db);
		await createEdicionCollection(db);
		await createCopiaCollection(db);
		await createUsuarioCollection(db);
		await createPrestamoCollection(db);
	} catch (error) {
		throw error;
	}
}

async function createAutorCollection(db: Db) {
	const collections = await db.listCollections({ name: 'autor' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('autor', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['nombre'],
					properties: {
						nombre: {
							bsonType: 'string',
							description: 'Requerido. Debe ser único'
						}
					}
				}
			}
		});
		await db.collection('autor').createIndex({ nombre: 1 }, { unique: true });
	}
}

async function createLibroCollection(db: Db) {
	const collections = await db.listCollections({ name: 'libro' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('libro', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['titulo'],
					properties: {
						titulo: {
							bsonType: 'string',
							description: 'Requerido. Debe ser único'
						}
					}
				}
			}
		});
		await db.collection('libro').createIndex({ titulo: 1 }, { unique: true });
	}
}

async function createAutoreaCollection(db: Db) {
	const collections = await db.listCollections({ name: 'autorea' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('autorea', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['autor_id', 'libro_id'],
					properties: {
						autor_id: {
							bsonType: 'objectId',
							description: 'Requerido'
						},
						libro_id: {
							bsonType: 'objectId',
							description: 'Requerido'
						}
					}
				}
			}
		});
		await db.collection('autorea').createIndex(
			{ autor_id: 1, libro_id: 1 },
			{ unique: true }
		);
	}
}

async function createEdicionCollection(db: Db) {
	const collections = await db.listCollections({ name: 'edicion' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('edicion', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['libro_id', 'isbn', 'año', 'idioma'],
					properties: {
						libro_id: {
							bsonType: 'objectId',
							description: 'Requerido por participación obligatoria'
						},
						isbn: {
							bsonType: 'string',
							description: 'Requerido. Debe ser único'
						},
						año: {
							bsonType: 'date',
							description: 'Requerido.'
						},
						idioma: {
							bsonType: 'string',
							description: 'Requerido'
						}
					}
				}
			}
		});
		await db.collection('edicion').createIndex({ isbn: 1 }, { unique: true });
	}
}

async function createCopiaCollection(db: Db) {
	const collections = await db.listCollections({ name: 'copia' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('copia', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['edicion_id'],
					properties: {
						edicion_id: {
							bsonType: 'objectId',
							description: 'Requerido, parte de la llave primaria de esta entidad.'
						},
						numero_copia: {
							bsonType: 'int',
							minimum: 1,
							description: 'Requerido, debe ser positivo'
						}
					}
				}
			}
		});
		await db.collection('copia').createIndex(
			{ edicion_id: 1, numero_copia: 1 },
			{ unique: true, name: 'idx_copia_edicion_numero_unique' }
		);
	}
}

async function createUsuarioCollection(db: Db) {
	const collections = await db.listCollections({ name: 'usuario' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('usuario', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['RUT', 'nombre'],
					properties: {
						RUT: {
							bsonType: 'string',
							description: 'Requerido, debe ser único.'
						},
						nombre: {
							bsonType: 'string',
							description: 'Requerido'
						}
					}
				}
			}
		});
		await db.collection('usuario').createIndex({ RUT: 1 }, { unique: true });
	}
}

async function createPrestamoCollection(db: Db) {
	const collections = await db.listCollections({ name: 'prestamo' }).toArray();
	if (collections.length === 0) {
		await db.createCollection('prestamo', {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['usuario_id', 'copia_id', 'fecha_prestamo'],
					properties: {
						usuario_id: {
							bsonType: 'objectId',
							description: 'Requerido'
						},
						copia_id: {
							bsonType: 'objectId',
							description: 'Requerido'
						},
						fecha_prestamo: {
							bsonType: 'date',
							description: 'Requerida'
						},
						fecha_devolucion: {
							bsonType: 'date',
							description: 'Fecha de devolución'
						}
					}
				}
			}
		});
		await db.collection('prestamo').createIndex(
			{ usuario_id: 1, copia_id: 1 },
			{ unique: true }
		);
	}
}