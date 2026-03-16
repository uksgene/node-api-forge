// Schema validator for API responses.
// Inputs: JSON schema + response body
// Outputs: throws on mismatch; used in tests to enforce contracts.
import Ajv, { JSONSchemaType } from "ajv";

class Validator {

    static validate<T>(schema: JSONSchemaType<T> | object, data: unknown): void {
        const ajv = new Ajv();
        const validate = ajv.compile(schema as object);
        const valid = validate(data);

        if (!valid) {
            throw new Error(JSON.stringify(validate.errors));
        }
    }

}

export default Validator;
