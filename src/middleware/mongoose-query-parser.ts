import { NextFunction } from "express";
import Request from "../types/Request";

var parser = (req: any, res: Response, next: NextFunction) => {

    var sortList: any[] = req.query.sort ? req.query.sort.split(",") : [];
    var sortObj: any = {};
    sortList.forEach(item => {
        item = item.trim();
        if (item.startsWith("-")) {
            sortObj[item.substring(1)] = -1;
        } else {
            sortObj[item] = 1;
        }
    });

    var query = JSON.parse(JSON.stringify(req.query));
    var removeKeyList = ["sort", "limit", "page"];
    removeKeyList.forEach(item => {
        delete query[item];
    });

    //console.log("req : ",JSON.stringify(req.query));
    req.mongoseQuery = {
        sort: sortObj,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        page: req.query.page ? parseInt(req.query.page) : 1,
        query: query
    };
    //console.log("mongoseQuery : ",req.mongoseQuery);
    next();
}
module.exports = parser;