import { getData } from "../utils/http";
export const SmsApi = async (number: String, body: String) => {
   
    let url: String = `http://bulk.fmsms.biz/smsapi?api_key=C20074796041ea6dbbf157.03538086&type=text&contacts=` + number + `&senderid=8809612446206&msg=` + body;
    console.log(url);
    let response: any = await getData(url, {});
    console.log(response);
    return response;
}