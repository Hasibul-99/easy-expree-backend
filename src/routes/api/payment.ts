import { Router, Response, NextFunction } from "express";
import { GeneralError, NotFound } from "../../utils/errors";
import Order, { EOrderStatus, IOrder } from "../../models/schema-model/Order";
import Request from "../../types/Request";
import { generateSession, validatePaymentByOrderId, validatePaymentByTranID } from "../../service/sslcommerz-session-generate";
import { IUser } from "../../models/schema-model/User";
import User from "../../models/schema-model/User";
import auth from "../../middleware/auth";
import { PaymentStatus, SslIPN } from "../../types/ssl-ipn";
import { IInvoiceDoc, InvoicePaymentStatus, VerifiedEnum } from "../../models/schema-model/Invoice";
import Invoice from "../../models/schema-model/Invoice";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import { getData } from "../../utils/http";
const router: Router = Router();

router.get("/:orderId", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let orderId = req.params.orderId;
        let order: IOrder = await Order.findById(orderId).populate("invoice");
        if (!order) {
            throw new NotFound("No order found.");
        }
        if (order.invoice && order.invoice.invoicePaymentStatus === InvoicePaymentStatus.COMPLETED) {
            throw new NotFound("This order invoice already PAID");
        }
        let user: IUser = await User.findById(req.userId);

        let session = await generateSession({
            cus_email: user.email || "cse.sanjida@gmail.com",
            cus_name: user.name,
            cus_phone: user.mobile,
            num_of_item: order.products.length,
            product_category: "Multiple",
            product_name: "Multiple Product",
            total_amount: order.totalPrice,
            tran_id: order._id,
            cus_add1: user.address || "N/A",
            cus_city: "DHAKA",
            cus_country: "BANGLADESH"
        });
        if (session) {
            res.send(session);
        } else {
            throw new GeneralError("No valid session found for this order.Please contact with admin");
        }
    } catch (error) {
        next(error);
    }
});
router.post("/ssl-ipn", async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("ssl-ipn call ", req.body);
        let webhookData: SslIPN = req.body;
        let order: IOrder = await Order.findById(webhookData.tran_id);
        let invoice: IInvoiceDoc = await Invoice.findOne({
            order: webhookData.tran_id
        });
        if (!invoice) {
            throw new NotFound("No invoice found.");
        }

        let userReqObj: SslIPN = await validatePaymentByTranID(webhookData.val_id)
        if (userReqObj.status === "VALID" || userReqObj.status === "VALIDATED") {
            invoice.invoicePaymentStatus = InvoicePaymentStatus.COMPLETED;
        } else {
            invoice.invoicePaymentStatus = userReqObj.status;
        }
        invoice.gatewayPaymentInfo = {
            status: userReqObj.status,
            tran_date: userReqObj.tran_date,
            val_id: userReqObj.val_id,
            bank_tran_id: userReqObj.bank_tran_id,
            amount: userReqObj.amount,
            store_amount: userReqObj.store_amount,
            paymentMethod: userReqObj.card_type,
            card_no: userReqObj.card_no,
            currency: userReqObj.currency,
            verifiedFrom: VerifiedEnum.IPN,
            fullResponse: req.body
        }

        await invoice.save();
        let response: DefaultPayloadModel<string> = {
            isSuccess: true,
            msg: "successfully received msg",
            data: "successfully received msg"
        }
        res.send(response);

    } catch (error) {
        next(error);
    }
});

router.post("/userPaymentValidation/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let order: IOrder = await Order.findById(req.params.id);
        let invoice: IInvoiceDoc = await Invoice.findOne({
            order: req.params.id
        });
        if (!invoice) {
            throw new NotFound("No invoice found.");
        }

        let allStatus: SslIPN[] = await validatePaymentByOrderId(req.params.id);
        console.log("payment status ",allStatus,req.params.id);
        for (let i in allStatus) {
            let userReqObj: SslIPN = allStatus[i];
            if (userReqObj.val_id) {
                if (userReqObj.status === "VALID" || userReqObj.status === "VALIDATED") {
                    invoice.invoicePaymentStatus = InvoicePaymentStatus.COMPLETED;
                } else {
                    invoice.invoicePaymentStatus = userReqObj.status;
                }
                invoice.gatewayPaymentInfo = {
                    status: userReqObj.status,
                    tran_date: userReqObj.tran_date,
                    val_id: userReqObj.val_id,
                    bank_tran_id: userReqObj.bank_tran_id,
                    amount: userReqObj.amount,
                    store_amount: userReqObj.store_amount,
                    paymentMethod: userReqObj.card_type,
                    card_no: userReqObj.card_no,
                    currency: userReqObj.currency,
                    verifiedFrom: VerifiedEnum.IPN,
                    fullResponse: JSON.stringify(userReqObj)
                }

                await invoice.save();
                break;
            }
        }
        let response: DefaultPayloadModel<IInvoiceDoc> = {
            isSuccess: true,
            msg: "successfully received msg",
            data: invoice
        }
        res.send(response);

    } catch (error) {
        next(error);
    }
});


router.post("/cash-on-delivery-change-status/:id/:status", async (req: Request, res: Response, next: NextFunction) => {
    try {
        //let order: IOrder = await Order.findById(req.params.id);
        let invoice: IInvoiceDoc = await Invoice.findOne({
            order: req.params.id
        });
        if (!invoice) {
            throw new NotFound("No invoice found.");
        }
        invoice.invoicePaymentStatus = req.params.status as InvoicePaymentStatus;
        await invoice.save();
        
        let response: DefaultPayloadModel<IInvoiceDoc> = {
            isSuccess: true,
            msg: "successfully received msg",
            data: invoice
        }
        res.send(response);

    } catch (error) {
        next(error);
    }
});
export default router;