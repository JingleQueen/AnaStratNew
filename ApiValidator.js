import httpErrors from 'http-errors';

class ApiValidator {
  static validate(data, schema) {
    const { error } = schema.validate(data);

    if (error) {
      throw new httpErrors.BadRequest(error.message);
    }
  }
}

export default ApiValidator;
