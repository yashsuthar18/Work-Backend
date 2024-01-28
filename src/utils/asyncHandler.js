const asyncHandler = (requestHandeler) => {
    return (req, res, next) => {                          // return is most important
        Promise.resolve(requestHandeler(req, res.next))
            .catch((err) => next(err))
    }
}


export { asyncHandler }


// const asyncHandler =( ) => {}
// const asyncHandler =( func) => () =>{}
// const asyncHandler =( func) => async () =>{}



// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.state(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }