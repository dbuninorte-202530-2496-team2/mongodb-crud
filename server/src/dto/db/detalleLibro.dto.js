import Joi from "joi"

export const edicionDto = Joi.object({
	isbn: Joi.string().required(),
	año: Joi.date().iso().required(),
	idioma: Joi.string().required(),
	numCopias: Joi.number().min(1).required(),
})

export const detalleLibroDto = Joi.object({
	titulo: Joi.string().required(),

	autores: Joi.array()
		.items(Joi.string().required())
		.min(1)
		.required(),

	ediciones: Joi.array()
		.items(edicionDto.required())
		.required(),
})

