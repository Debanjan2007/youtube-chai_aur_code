import { asyncHsndler } from '../utils/asyncHanlder.js' ;

export const registerUser = asyncHsndler(async (req , res) => {
    return res.status(202).json({
        message: "OK"
    })
})

