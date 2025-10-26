import Joi from "joi";
export const libroAndAutorIdsDto = Joi.object({
	autor_id: objectIdDto,
	libro_id: objectIdDto
});
