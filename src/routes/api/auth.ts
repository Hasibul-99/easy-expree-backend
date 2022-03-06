import bcrypt from "bcryptjs";
import config from "config";
import { Router, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator/check";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser, UserStatus } from "../../models/schema-model/User";
import { GeneralError, NotFound } from "../../utils/errors";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import auth from "../../middleware/auth";

const router: Router = Router();

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: IUser = await User.findById(req.userId).select("-password");
    if (!user) {
      throw new NotFound("No login user found.");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @route   POST api/auth
// @desc    Login user and get token
// @access  Public
router.post(
  "/",
  [
    check("userName", "Please include a valid mobile").isLength({
      min:11,
      max:11
    }),
    check("password", "Password is required").exists()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    console.log(errors.array())
    if (!errors.isEmpty()) {
      let response: DefaultPayloadModel<string> = {
        isSuccess: false,
        msg: "BAD REQUEST",
        data: errors.array().map((item:any)=>item.msg).join(",")
      }
      return res
        //.status(HttpStatusCodes.BAD_REQUEST)
        .json(response);
    }

    const { userName, password } = req.body;
    try {
      let user: IUser = await User.findOne({ userName });


      if (!user) {
        throw new NotFound("User Name or password is invalid");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new GeneralError("UserName or password is invalid");
      }

      if(user.userActiveStatus!==UserStatus.VERIFIED){
        throw new GeneralError("User is not verified.Please contact with admin.");
      }

      const payload: Payload = {
        userId: user.id
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiration") },
        (err, token) => {
          if (err) throw err;

          let response: DefaultPayloadModel<any> = {
            isSuccess: true,
            msg: "Successfully generate token",
            data: token
          }
          res.json(response);
        }
      );
    } catch (err) {
      next(err);
    }
  }
);




export default router;
