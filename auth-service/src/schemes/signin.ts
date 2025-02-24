import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().trim().email().required().messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is a required field',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is a required field'
    }),
    otherwise: Joi.string().trim().min(4).max(12).required().messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username is a required field',
      'string.min': 'Username must be at least 4 characters long',
      'string.max': 'Username must not exceed 12 characters',
      'any.required': 'Username is a required field'
    })
  }),
  password: Joi.string().trim().min(4).max(12).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is a required field',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must not exceed 12 characters',
    'any.required': 'Password is a required field'
  })
});

export { loginSchema };
