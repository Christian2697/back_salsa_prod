import Joi from 'joi'

const schemas = {
    register: Joi.object({
        username: Joi.string()
            .min(3)
            .max(20)
            .regex(/^\S+$/)
            .required()
            .messages({
                'string.min': 'El nombre de usuario debe tener al menos 3 caracteres.',
                'string.max': 'El nombre de usuario no puede exceder 20 caracteres.',
                'string.regex.base': 'El nombre de usuario no se permiten espacios en blanco.',
                'any.required': 'El nombre de usuario es obligatorio.'
            }),

        password: Joi.string()
            .regex(/^\S+$/)
            .min(5)
            .max(20)
            .messages({
                'string.empty': 'La contraseña es obligatoria.',
                'string.regex.base': 'La contraseña no permite espacios en blanco.',
                'string.min': 'La contraseña debe ser de al menos 5 caracteres.',
                'string.max': 'La contraseña debe ser de menos de 21 caracteres.'
            }),

        repeat_password: Joi.any()
            .equal(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Las contraseñas no coinciden.',
                'any.required': 'La confirmación de la contraseña es obligatoria.'
            }),
    }),

    login: Joi.object({
        username: Joi.string()
            .regex(/^\S+$/)
            .min(3)
            .max(20)
            .required()
            .messages({
                'string.regex.base': 'El nombre de usuario no se permiten espacios en blanco.',
                'string.empty': 'El nombre de usuario es obligatorio.',
                'string.min': 'El nombre de usuario debe ser de al menos 3 caracteres.',
                'string.max': 'El nombre de usuario debe ser de menos de 21 caracteres.'
            }),

        password: Joi.string()
            .regex(/^\S+$/)
            .min(5)
            .max(20)
            .messages({
                'string.empty': 'La contraseña es obligatoria.',
                'string.regex.base': 'La contraseña no permite espacios en blanco.',
                'string.min': 'La contraseña debe ser de al menos 5 caracteres.',
                'string.max': 'La contraseña debe ser de menos de 21 caracteres.'
            }),

    }),

    usuarios: Joi.object({
        name: Joi.string()
            .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.pattern.base': 'El nombre solo debe contener letras y espacios.',
                'string.empty': 'El nombre es obligatorio.',
                'string.min': 'El nombre debe ser de al menos 3 caracteres.',
                'string.max': 'El nombre debe ser de menos de 31 caracteres.'
            }),


        lastname: Joi.string()
            .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.pattern.base': 'El apellido solo debe contener letras y espacios.',
                'string.empty': 'El apellido es obligatorio.',
                'string.min': 'El apellido debe ser de al menos 3 caracteres.',
                'string.max': 'El apellido debe ser de menos de 31 caracteres.'
            }),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'es', 'mx'] } })
            .required()
            .messages({
                'string.empty': 'El correo es obligatorio.',
                'string.email': 'El correo no es un email válido.',
            }),

        id_event: Joi.number()
            .integer()
            .min(0)
            .max(5)
            .optional(),

        idsUsers: Joi.array()
            .optional(),

    }),
    reser: Joi.object({
        nameReservation: Joi.string()
            .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.pattern.base': 'El nombre solo debe contener letras y espacios.',
                'string.empty': 'El nombre es obligatorio.',
                'string.min': 'El nombre debe ser de al menos 3 caracteres.',
                'string.max': 'El nombre debe ser de menos de 31 caracteres.'
            }),

        id_event: Joi.number()
            .integer()
            .min(1)
            .max(4)
            .required()
            .messages({
                'number.integer': 'El id del evento debe ser un número entero.',
                'number.empty': 'El id del evento es obligatorio es obligatorio.',
                'number.min': 'El id del evento debe ser mayor a 0.',
                'number.max': 'El id del evento debe ser menor a 5.'
            }),

        id_typeReservation: Joi.number()
            .integer()
            .min(1)
            .max(3)
            .required()
            .messages({
                'number.integer': 'El id del tipo de reservación debe ser un número entero.',
                'number.empty': 'El id del tipo de reservación es obligatorio es obligatorio.',
                'number.min': 'El id del tipo de reservación debe ser mayor a 0.',
                'number.max': 'El id del tipo de reservación debe ser menor a 4.'
            }),
    }),
}

export { schemas }