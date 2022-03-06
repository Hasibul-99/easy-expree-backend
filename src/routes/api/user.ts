import bcrypt from "bcryptjs";
import config from "config";
import e, { Router, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator/check";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";

import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser, UserStatus, UserType } from "../../models/schema-model/User";
import { GeneralError, NotFound } from "../../utils/errors";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import auth from "../../middleware/auth";
import { count } from "../../utils/query-service-utility";
import { SmsApi } from "../../service/SmsService";

var multer = require('multer')
var upload = multer({ dest: 'uploads/' });

const router: Router = Router();

// @route   POST api/user
// @desc    Register user given their email and password, returns the token upon successful registration
// @access  Public
router.post(
  "/createAdmin",
  [
    check("mobile", "Please include a valid mobile").isLength({
      min: 11,
      max: 11
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let errs: any[] = errors.array();
        throw new GeneralError(errs.map(item => item.msg).join(","));
      }

      const { email, password, name, mobile, nid, address, dateOfBirth } = req.body;
      try {
        let user: IUser = await User.findOne({ mobile });

        if (user) {
          throw new GeneralError("Mobile number already exists");
        }




        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Build user object based on IUser
        const userFields = {
          userName: mobile,
          email,
          password: hashed,
          name,
          userType: UserType.ADMIN,
          userActiveStatus: UserStatus.VERIFIED,
          mobile,
          nid,
          address,
          dateOfBirth
        };

        user = new User(userFields);

        await user.save();

        const payload: Payload = {
          userId: user.id
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: config.get("jwtExpiration") },
          (err, token) => {
            if (err) throw err;

            let response: DefaultPayloadModel<string> = {
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
    } catch (error) {
      next(error);
    }

  }
);

router.post(
  "/createMarchant",
  [
    check("mobile", "Please include a valid mobile").isLength({
      min: 11,
      max: 11
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let errs: any[] = errors.array();
        throw new GeneralError(errs.map(item => item.msg).join(","));
      }

      const { email, password, name, mobile, nid, address, dateOfBirth, marchant, facebook } = req.body;
      try {
        let user: IUser = await User.findOne({ mobile });

        if (user) {
          throw new GeneralError("Mobile number already exists");
        }


        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Build user object based on IUser
        const userFields = {
          userName: mobile,
          email,
          password: hashed,
          name,
          userType: UserType.MARCHANT,
          userActiveStatus: UserStatus.NOT_VERIFIED,
          mobile,
          nid,
          address,
          dateOfBirth,
          facebook,
          marchant
        };

        user = new User(userFields);

        await user.save();
        let text: string = `Congratulations! You have successfully applied as a merchant. Please wait for confirmation from the admin -- easyexpress24.com`;
        await SmsApi(user.mobile, text);

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
              msg: "Please verify your account",
              data: ""
            }
            res.json(response);
          }
        );
      } catch (err) {
        next(err);
      }
    } catch (error) {
      next(error);
    }

  }
);

router.post(
  "/changePassword",
  auth
  ,
  [
    check("oldPassword", "Old Password is required").exists(),
    check("password", "Password is required").exists()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let response: DefaultPayloadModel<string> = {
        isSuccess: false,
        msg: "BAD REQUEST",
        data: errors.array().join(",")
      }
      return res
        .json(response);
    }

    const { oldPassword, password } = req.body;
    try {
      let user: IUser = await User.findById(req.userId);


      if (!user) {
        throw new NotFound("Please login first");
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        throw new GeneralError("Old password is not match");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      user.password = hashed;
      await user.save();

      let response: DefaultPayloadModel<any> = {
        isSuccess: true,
        msg: "Successfully changed password",
        data: "Successfully changed password"
      }
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/uploadProfilePhoto", auth, upload.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  //console.log(req.file, req.userId);
  try {
    let user: IUser = await User.findById(req.userId);
    if (user) {
      user.avatar = req.file.filename;
      await user.save();
      let response: DefaultPayloadModel<string> = {
        isSuccess: true,
        msg: "Successfully user photo update.",
        data: user.avatar
      };
      res.send(response);
    }
  } catch (error) {
    next(error);
  }


});

router.post(
  "/verifyUser",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      let loginUser: IUser = await User.findById(req.userId);
      if (!loginUser) {
        throw new GeneralError("Please login first");
      }
      if (loginUser.userType !== UserType.ADMIN) {
        throw new GeneralError("Login user must be admin.");
      }
      let user: IUser = await User.findById(userId);
      if (!user) {
        throw new GeneralError("No User Found.");
      }
      user.userActiveStatus = UserStatus.VERIFIED;
      await user.save();

      if (user.userType === UserType.MARCHANT)
        SmsApi(user.mobile, "Congratulations you are selected as a Merchant ,Your user ID : " + user.userName + "\n-- for any query -01911559933 , easyexpress24.com");


      let response: DefaultPayloadModel<string> = {
        isSuccess: true,
        msg: "Successfully Verify user",
        data: "Successfully Verify user"
      }
      res.json(response);
    } catch (error) {
      next(error);
    }
  });


router.post(
  "/",
  [
    check("mobile", "Please include a valid mobile").isLength({
      min: 11,
      max: 11
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let errs: any[] = errors.array();
        throw new GeneralError(errs.map(item => item.msg).join(","));
      }

      const { email, password, name, mobile, nid, address, dateOfBirth, facebook = "" } = req.body;
      try {
        let user: IUser = await User.findOne({ mobile });

        if (user) {
          throw new GeneralError("User already exists");
        }

        const options: gravatar.Options = {
          s: "200",
          r: "pg",
          d: "mm"
        };


        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Build user object based on IUser
        const userFields = {
          userName: mobile,
          email,
          password: hashed,
          name,
          userType: UserType.USER,
          userActiveStatus: UserStatus.VERIFIED,
          mobile,
          nid,
          address,
          facebook,
          dateOfBirth
        };

        user = new User(userFields);

        await user.save();

        const payload: Payload = {
          userId: user.id
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: config.get("jwtExpiration") },
          (err, token) => {
            if (err) throw err;

            let response: DefaultPayloadModel<string> = {
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
    } catch (error) {
      next(error);
    }

  }
);

router.put(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, mobile, nid, address, dateOfBirth, marchant, facebook } = req.body;
      try {
        let user: IUser = await User.findById(req.userId);

        if (!user) {
          throw new GeneralError("No User found.");
        }

        if (name) {
          user.name = name;
        }

        if (mobile) {
          user.mobile = mobile;
          if (!user.userName && user.mobile.length === 11) {
            user.userName = user.mobile;
          } else if (!user.userName) {
            throw new GeneralError("Please update with valid mobile number.Like 01XXXXXXXXX");
          }
        }

        if (nid) {
          user.nid = nid;
        }
        if (address) {
          user.address = address;
        }
        if (dateOfBirth) {
          user.dateOfBirth = dateOfBirth;
        }
        if (facebook) {
          user.facebook = facebook;
        }
        if (marchant) {
          let {
            bussinessName,
            marchantDesignation,
            bankInfo
          } = marchant;

          if (bussinessName) {
            user.marchant.bussinessName = bussinessName;
          }

          if (marchantDesignation) {
            user.marchant.marchantDesignation = marchantDesignation;
          }

          if (bankInfo) {
            let { accountName, accountNumber, branch } = bankInfo;
            if (accountName) {
              user.marchant.bankInfo.accountName = accountName;
            }
            if (accountNumber) {
              user.marchant.bankInfo.accountNumber = accountNumber;
            }
            if (branch) {
              user.marchant.bankInfo.branch = branch;
            }
          }
        }


        await user.save();

        const payload: Payload = {
          userId: user.id
        };
        delete user.password;

        let response: DefaultPayloadModel<IUser> = {
          isSuccess: true,
          msg: "Successfully updated user",
          data: user
        }
        res.json(response);
      } catch (err) {
        next(err);
      }
    } catch (error) {
      next(error);
    }

  }
);


router.get("/count", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let usersCount = await count(User, req.mongoseQuery);
    let response: DefaultPayloadModel<number> = {
      isSuccess: true,
      msg: "Successfull",
      data: usersCount
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
}
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let users: IUser[] = await User.find({}).select("-password");
    let response: DefaultPayloadModel<IUser[]> = {
      isSuccess: true,
      msg: "Successfull",
      data: users
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
}
);

export default router;
