class apiError extends Error{              // Error is a built in class in js which is used to create custom error classes. here we are creating our own custom error class 
    constructor(
        statusCode,
        message= 'Something went wrong',
        errors=[],
        stack = ""                              // this shows where error is occurred
    ){
        super(message)                          // calling the parent (Error)constructor...if class extends another class , JS  requires to call super() before using 'this' keyword
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.errors = errors
        this.success = false

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default apiError