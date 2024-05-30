const RES_TYPES = {
    200: (data, msg) => ({
        statusCode: 200,
        error: 0,
        message: msg || "Success",
        data
    }),
    400: (msg) => ({
        statusCode: 400,
        error: 1,
        message: msg || "Bad Request",
    }),
    404: (msg) => ({
        statusCode: 400,
        error: 1,
        message: msg || "Not Found",
    }),
    500: (msg) => ({
        statusCode: 500,
        error: 1,
        message: msg || "Internal Server Error",
    }),
}

module.exports = RES_TYPES