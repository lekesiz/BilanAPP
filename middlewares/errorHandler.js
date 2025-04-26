const { ValidationError } = require('joi');
const { CustomError } = require('../utils/errors');

const handleErrors = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden',
      code: 'FORBIDDEN',
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      status: 'error',
      message: 'Not found',
      code: 'NOT_FOUND',
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

module.exports = { handleErrors }; 