// Typed error so route handlers can `throw new ApiError(404, '...')` and
// the central error handler translates it into the right HTTP response.
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
