import { Model } from "mongoose";
import escapeString from "escape-string-regexp"

export const queryData = async (mongooseObj: Model<any>, queryParams: any) => {



    //console.log(JSON.stringify(queryObj));

    var skip = (queryParams.page - 1) * queryParams.limit;
    var result = await mongooseObj
        .find(queryParams.query)
        .sort(queryParams.sort)
        .skip(skip)
        .limit(queryParams.limit);
    return result;
}

export const queryDataPopulate = async (mongooseObj: Model<any>, queryParams: any, path: string) => {

    var skip = (queryParams.page - 1) * queryParams.limit;
    var result = await mongooseObj
        .find(queryParams.query)
        .populate(path)
        .sort(queryParams.sort)
        .skip(skip)
        .limit(queryParams.limit);
    return result;
}

export const queryDataPopulateAll = async (mongooseObj: Model<any>, queryParams: any, paths: { path: string, select: string }[]) => {

    let query = mongooseObj
        .find(queryParams.query);

    paths.forEach(item => {
        query.populate(item.path, item.select);
    });

    var skip = (queryParams.page - 1) * queryParams.limit;
    var result = await query
        .sort(queryParams.sort)
        .skip(skip)
        .limit(queryParams.limit);
    return result;
}




export const searchDataPopulateAll = async (mongooseObj: Model<any>, queryParams: any, paths: { path: string, select: string }[]) => {
    let queryObj: any = {};
    Object.keys(queryParams.query).forEach((item: string) => {
        queryObj[item] = {
            $regex: new RegExp(queryParams.query[item], "i")
        }
    })

    //console.log(queryObj)

    let query = mongooseObj
        .find(queryObj);

    paths.forEach(item => {
        query.populate(item.path, item.select);
    });

    var skip = (queryParams.page - 1) * queryParams.limit;
    var result = await query
        .sort(queryParams.sort)
        .skip(skip)
        .limit(queryParams.limit);
    return result;
}

export const count = async (mongooseObj: Model<any>, queryParams: any) => {
    let queryObj: any = {};
    Object.keys(queryParams.query).forEach((item: string) => {
        queryObj[item] = {
            $regex: new RegExp(queryParams.query[item], "i")
        }
    })

    //console.log(queryObj)

    let query = mongooseObj
        .countDocuments(queryObj);
    var result = await query
    console.log(result)
    return result;
}