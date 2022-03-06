const request = require('request');
var querystring = require('querystring');
export const getHeaders = (url = "", headers = {}) => {
    let promise = new Promise((res, rej) => {
        request.get({
            url: url,
            headers: headers,
            followRedirect: false,
            "rejectUnauthorized": false
        }, function (err: any, response: any, body: any) {
            res(response.headers);
        });
    });
    return promise;
}

export const getData = (url: String = "", headers: any = {}) => {
    let promise = new Promise((res, rej) => {
        request.get({
            url: url,
            headers: headers,
            "rejectUnauthorized": false
        }, function (err: any, response: any, body: any) {
            res(body);
        });
    });
    return promise;
}


/*
******data example*****
`data=eyJzYWx0IjoiNzYxIiwic2lnbiI6ImIxZTViODg4Y2IwOTYyYjVmYTgwZmE5OWJhYWYyMTU2IiwibWV0aG9kX25hbWUiOiJnZXRfY2F0ZWdvcmllcyJ9`
*/
export const postDataUrlEncode = (url = "", data = "", headers: any = {}) => {
    headers["content-type"] = 'application/x-www-form-urlencoded';
    let promise = new Promise((res, rej) => {
        request.post({
            headers: headers,
            url: url,
            body: data,
            "rejectUnauthorized": false
        }, function (err: any, response: any, body: any) {
            res(body);
        });
    });
    return promise;
}
export const postDataUrlEncodeJson = (url = "", data: any, headers: any = {}) => {
    let processData = ``;
    Object.keys(data).forEach(key=>{
        processData += key+"="+data[key]+"&";
    })
   // console.log(processData);
    headers["content-type"] = 'application/x-www-form-urlencoded';
    let promise = new Promise((res, rej) => {
        request.post({
            headers: headers,
            url: url,
            body: processData,
            "rejectUnauthorized": false
        }, function (err: any, response: any, body: any) {
            res(body);
        });
    });
    return promise;
}

export const postDataJson = (url = "", data = {}, headers: any = {}) => {
    headers["Content-Type"] = 'application/json';
    if (!headers["User-Agent"]) {
        headers["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36";
    }
    let promise = new Promise((res, rej) => {
        request.post({
            uri: url,
            headers: headers,
            body: JSON.stringify(data),
            "rejectUnauthorized": false
        }, function (err: any, response: any, body: any) {
            res(body);
        });
    });
    return promise;
}