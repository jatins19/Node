import Joi from 'joi';

const validates = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.body);
        if (error) {
            console.log(error);
            return res.status(422).json({ errors: error?.details[0]?.message, status: false });
        };
        next();
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
};

export default validates;