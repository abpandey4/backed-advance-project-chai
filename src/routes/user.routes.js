import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();                    // just like we do for express: app = express()this is same way for router 

router.route("/register").post(                   // POST send data to server
    upload.fields([                         // here we have injected middleware to registerUser upload is multer middleware...we have imported can check
        {
            name: "avatar",
            maxCount: 1,                   // maxcount: means how much file should accept
        },
        {
            name: "coverImage",
            maxCount: 1, 
        }
    ]),
    registerUser
)  

router.route("/login").post(loginUser)

// secured Routes

router.route("/logout").post(verifyJWT, logoutUser)          // verifyJWt is middleware create by own in auth midd.js
router.route("/refresh-token").post(refreshAccessToken)      // added refreshtoken endpoint

export default router;