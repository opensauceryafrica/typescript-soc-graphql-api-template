import Joi from 'joi';
import { Currency } from '../types/misc/currency';
import { Country } from '../types/misc/country';

export const register = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one number, one letter and one special character',
            'string.min': 'Password must be at least 8 characters long',
        }),
}).required();

export const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).required();

export const onboard = Joi.object({
    monthlyRecurringRevenue: Joi.number().required(),
    operationCountry: Joi.string()
        .required()
        .valid(...Object.values(Country)),
    reportingCurrency: Joi.string()
        .required()
        .valid(...Object.values(Currency)),
    phone: Joi.string().required(),
    otp: Joi.string().required(),
}).required();

export const requestPhoneVerification = Joi.object<{ phone: string }>({
    phone: Joi.string().required(),
}).required();

export const requestEmailVerification = Joi.object({
    email: Joi.string().email().required(),
}).required();

export const verifyEmail = Joi.object({
    token: Joi.string().required(),
}).required();

export const updatePassword = Joi.object({
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one number, one letter and one special character',
            'string.min': 'Password must be at least 8 characters long',
        }),
    oldPassword: Joi.string().required(),
}).required();

export const recoverPassword = Joi.object({
    email: Joi.string().email().required(),
}).required();

export const resetPassword = Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one number, one letter and one special character',
            'string.min': 'Password must be at least 8 characters long',
        }),
}).required();
