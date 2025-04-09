const asyncHsndler = (requestHandler) => {
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next))
        .catch((err) => {
            next(err)
        })
    }
}

export {asyncHsndler} 

// wraper function for async function to handle errors
// const asyncHsndler = (fn) => async (req , res , next) => {
// try{
    // await fn(req , res , next) ;
// }catch(err) {
//     res.status(err.code || 500).json({
//         success : false,
//         msg : err.message || "Internal Server Error",
//     })
// }
// }