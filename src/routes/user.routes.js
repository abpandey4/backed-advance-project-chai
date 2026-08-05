import { Router } from "express";
import registerUser from "../controllers/user.controller.js";

const router = Router();                    // just like we do for express: app = express()this is same way for router 

router.route("/register").post(registerUser)      // POST send data to server    

export default router;