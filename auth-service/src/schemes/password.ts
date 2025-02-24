import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().trim().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is a required field',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is a required field'
  })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().trim().min(4).max(12).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is a required field',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must not exceed 12 characters',
    'any.required': 'Password is a required field'
  }),
  confirmPassword: Joi.string().trim().required().valid(Joi.ref('password')).messages({
    'string.base': 'Confirm password must be a string',
    'string.empty': 'Confirm password is a required field',
    'any.only': 'Passwords must match',
    'any.required': 'Confirm password is a required field'
  })
});

const changePasswordSchema: ObjectSchema = Joi.object().keys({
  currentPassword: Joi.string().trim().min(4).max(12).required().messages({
    'string.base': 'Current password must be a string',
    'string.empty': 'Current password is a required field',
    'string.min': 'Current password must be at least 4 characters long',
    'string.max': 'Current password must not exceed 12 characters',
    'any.required': 'Current password is a required field'
  }),
  newPassword: Joi.string().trim().min(4).max(12).required().disallow(Joi.ref('currentPassword')).messages({
    'string.base': 'New password must be a string',
    'string.empty': 'New password is a required field',
    'string.min': 'New password must be at least 4 characters long',
    'string.max': 'New password must not exceed 12 characters',
    'any.required': 'New password is a required field',
    'any.invalid': 'New password must be different from current password'
  })
});

export { changePasswordSchema, emailSchema, passwordSchema };
