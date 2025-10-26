import Joi from 'joi';

export const PaginationDto = Joi.object({
	limit: Joi.number().min(1).optional().default(10),
	offset: Joi.number().min(0).optional().default(0),
})

