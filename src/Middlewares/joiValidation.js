const validation = (schema) => {
    const joiValidation = (req, res, next) => {
        const {error} = schema.validate(req.body, {
            abortEarly: false
        });
        if (error) {
            const {details} = error;
            console.log(details.map(detalle => detalle.message));
            res.status(422).json({error: details})
        } else {
            next();
        }
    }
    return joiValidation;
}

export { validation }