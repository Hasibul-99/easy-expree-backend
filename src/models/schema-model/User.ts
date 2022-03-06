import { Document, Model, model, Schema } from "mongoose";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param password:string
 * @param avatar:string
 */
export interface IUser extends Document {
  name:string,
  email: string;
  userName: string;
  password: string;
  avatar: string;
  userType: UserType,
  userActiveStatus: UserStatus,
  mobile: string;
  nid: string;
  address: string;
  dateOfBirth: any;
  facebook:string,
  marchant?: {
    bussinessName: string,
    marchantDesignation: string,
    bankInfo?: {
      accountName: string,
      accountNumber: string,
      branch: string
    }
  };
}
export enum UserType {
  'SUPER_ADMIN' = 'SUPER_ADMIN',
  'ADMIN' = "ADMIN",
  "MARCHANT" = "MARCHANT",
  "USER" = "USER"
}

export enum UserStatus {
  'VERIFIED' = 'VERIFIED',
  'NOT_VERIFIED' = "NOT_VERIFIED",
  "BANNED" = "BANNED"
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String
  },
  nid: {
    type: String
  },
  address: {
    type: String
  },
  facebook: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', "MARCHANT", "USER"],
    default: "USER"
  },
  userActiveStatus: {
    type: String,
    enum: ['VERIFIED', 'NOT_VERIFIED', "BANNED"],
    default: "NOT_VERIFIED"
  },
  avatar: {
    type: String
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  dateOfBirth: {
    type: Date,
    default: Date.now
  },
  marchant: {
    bussinessName: {
      type: String
    },
    marchantDesignation: {
      type: String
    },
    bankInfo: {
      accountName: {
        type: String
      },
      accountNumber: {
        type: String
      },
      branch: {
        type: String
      }
    }
  }

});

const User: Model<IUser> = model("User", userSchema);

export default User;
