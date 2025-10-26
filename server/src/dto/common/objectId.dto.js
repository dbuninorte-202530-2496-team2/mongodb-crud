import Joi from 'joi';
export const objectIdDto = Joi.string().hex().length(24).required();
