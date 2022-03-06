import { Request } from "express";
import Payload from "./Payload";
import PayloadFile from "./PayloadFile";
import MongooseQuery from "./MongooseQuery";

/**
 * Extended Express Request interface to pass Payload Object to the request. Used by the auth middleware to pass data to the request by token signing (jwt.sign) and token verification (jwt.verify).
 * @param userId:string
 */
type request = Request & Payload & PayloadFile & MongooseQuery;

export default request;