const Ajv = require("ajv");

class Validator {

    static validate(schema, data) {

        const ajv = new Ajv();
        const validate = ajv.compile(schema);

        const valid = validate(data);

        if (!valid) {
            throw new Error(JSON.stringify(validate.errors));
        }

    }

}

module.exports = Validator;
