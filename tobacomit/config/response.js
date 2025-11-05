class Response {
    constructor(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    toJson() {
        return { code: this.code, message: this.message, data: this.data };
    }

    isInternalError() {
        return this.code >= 500;
    }

    isClientError() {
        return this.code >= 400 && this.code < 500;
    }

    isSuccess() {
        return this.code >= 200 && this.code < 300;
    }
}

module.exports = { Response };