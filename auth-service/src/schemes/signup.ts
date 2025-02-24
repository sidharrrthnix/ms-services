import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object({
  username: Joi.string().trim().min(4).max(12).required().messages({
    'string.base': 'Username must be a string',
    'string.empty': 'Username is a required field',
    'string.min': 'Username must be at least 4 characters long',
    'string.max': 'Username must not exceed 12 characters'
  }),
  password: Joi.string().trim().min(4).max(12).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is a required field',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must not exceed 12 characters'
  }),
  country: Joi.string().trim().required().messages({
    'string.base': 'Country must be a string',
    'string.empty': 'Country is a required field'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is a required field',
    'string.email': 'Please provide a valid email address'
  }),
  profilePicture: Joi.string()
    .trim()
    // If expecting a URL format:
    // .uri()
    .required()
    .messages({
      'string.base': 'Profile picture must be a string',
      'string.empty': 'Profile picture is a required field'
      // 'string.uri': 'Profile picture must be a valid URL'
    })
});

export { signupSchema };
