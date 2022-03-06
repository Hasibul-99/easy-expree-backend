import { ProductProfile, ShipingMethod, SslSessionBody } from "../types/ssl-session-body";
import config from "config";
import { getData, postDataUrlEncodeJson } from "../utils/http";
import { SslIPN } from "ssl-ipn";

export async function generateSession({
    total_amount,
    tran_id,
    cus_name,
    cus_email,
    cus_phone,
    num_of_item,
    product_name,
    product_category,
    cus_add1,
    cus_city,
    cus_country
}: {
    total_amount: number,
    tran_id: string,
    cus_name: string,
    cus_email: string,
    cus_phone: string,
    num_of_item: number,
    product_name: string,
    product_category: string,
    cus_add1: string,
    cus_city: string,
    cus_country: string,
}): Promise<any> {
    console.log("store_id", config.get("store_id"));
    console.log("store_passwd", config.get("store_passwd"));
    let reqBody: SslSessionBody = {
        store_id: config.get("store_id"),
        store_passwd: config.get("store_passwd"),
        cancel_url: config.get("cancel_url"),
        fail_url: config.get("fail_url"),
        success_url: config.get("success_url"),
        ipn_url: config.get("ipn_url"),
        currency: "BDT",
        cus_email,
        cus_name,
        cus_phone,
        num_of_item,
        product_category,
        product_name,
        product_profile: ProductProfile.general,
        ship_name: "BD USER",
        shipping_method: ShipingMethod.NO,
        total_amount,
        tran_id,
        cus_add1,
        cus_city,
        cus_country
    }
    // console.log(JSON.stringify(reqBody));

    try {
        let url: string = config.get("ssl_url");
        // console.log(url);
        let res: any = await postDataUrlEncodeJson(url, reqBody, {});
        res = JSON.parse(res);
        return res;
    } catch (error) {
        console.log(error);
        return {};
    }
}


export async function validatePaymentByTranID(tranId: string): Promise<SslIPN> {
    let store_id = config.get("store_id");
    let store_pass = config.get("store_passwd");
    let validateUrl = config.get("payment_validation_url");
    let data: any = await getData(`${validateUrl}?store_id=${store_id}&store_passwd=${store_pass}&val_id=${tranId}`);
    let paymentInfo: SslIPN = JSON.parse(data);
    return paymentInfo;
}


export async function validatePaymentByOrderId(orderId: string): Promise<SslIPN[]> {
    let store_id = config.get("store_id");
    let store_pass = config.get("store_passwd");
    let payment_validation_by_orderid_url = config.get("payment_validation_by_orderid_url");
    //console.log(payment_validation_by_orderid_url);
    let data: any = await getData(`${payment_validation_by_orderid_url}?store_id=${store_id}&store_passwd=${store_pass}&tran_id=${orderId}`);
    //console.log("data validation ",data);
    let transactionAllList = JSON.parse(data);
    //console.log("data validation 2 ",transactionAllList);
    let allStatus: SslIPN[] = transactionAllList && transactionAllList.element ? transactionAllList.element : [];
    return allStatus;
}