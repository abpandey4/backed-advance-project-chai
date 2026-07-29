// wrapper using Promises

const asyncHandler = (requestHandler)=>{
    (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) =>next(err))
    }
}
export default asyncHandler;




// (we made wrapper) using try catch method
/*

const asyncHandler = (fn) => async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({    // this 500 means status code 
            success: false,
            message: err.message
        })
    }
}

*/