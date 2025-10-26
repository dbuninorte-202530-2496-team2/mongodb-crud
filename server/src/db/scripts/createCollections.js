db = db.getSiblingDB('biblioteca');
db.dropDatabase();

db.createCollection("autor", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["nombre"],
			properties: {
				nombre: {
					bsonType: "string",
					description: "Requerido. Debe ser único"
				},
			}
		}
	}
});
db.autor.createIndex({ "nombre": 1 }, { unique: true });


db.createCollection("libro", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["titulo"],
			properties: {
				titulo: {
					bsonType: "string",
					description: "Requerido. Debe ser único"
				},
			}
		}
	}
});
db.libro.createIndex({ "titulo": 1 }, { unique: true });

db.createCollection("autorea", {
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
})
db.autorea.createIndex(
	{ "autor_id": 1, "libro_id": 1 },
	{ unique: true }
);

db.createCollection("edicion", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["libro_id", "isbn", "año", "idioma"],
			properties: {
				libro_id: {
					bsonType: "objectId",
					description: "objectId. Requerido por participación obligatoria"
				},
				isbn: {
					bsonType: "string",
					description: "Requerido. Debe ser único"
				},
				año: {
					bsonType: "date",
					description: "Requerido."
				},
				idioma: {
					bsonType: "string",
					description: "Requerido"
				},
			}
		}
	}
});
db.edicion.createIndex({ "isbn": 1 }, { unique: true });


db.createCollection("copia", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["edicion_id"],
			properties: {
				edicion_id: {
					bsonType: "objectId",
					description: "Requerido, parte de la llave primaria de esta entidad."
				},
				numero_copia: {
					bsonType: "int",
					minimum: 1,
					description: "Requerido, debe ser positivo"
				}
			}
		}
	}
});
db.copia.createIndex(
	{ "edicion_id": 1, "numero_copia": 1 },
	{ unique: true, name: "idx_copia_edicion_numero_unique" }
);


db.createCollection("usuario", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["RUT", "nombre"],
			properties: {
				RUT: {
					bsonType: "string",
					description: "Requerido, debe ser único."
				},
				nombre: {
					bsonType: "string",
					description: "Requerido"
				}
			}
		}
	}
});
db.usuario.createIndex({ "RUT": 1 }, { unique: true });


db.createCollection("prestamo", {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			required: ["usuario_id", "copia_id", "fecha_prestamo"],
			properties: {
				usuario_id: {
					bsonType: "objectId",
					description: "Requerido"
				},
				copia_id: {
					bsonType: "objectId",
					description: "Requerido"
				},
				fecha_prestamo: {
					bsonType: "date",
					description: "Requerida"
				},
				fecha_devolucion: {
					bsonType: "date",
					description: "Fecha de devolución"
				},
			}
		}
	}
});
db.prestamo.createIndex(
	{ "usuario_id": 1, "copia_id": 1 },
	{ unique: true }
);
