class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;







/////////////////////////// FIIXXXX ERRORRR RESPONSE !!!!!!!!!!!!