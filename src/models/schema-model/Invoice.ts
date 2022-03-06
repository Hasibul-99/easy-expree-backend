import { Document, Model, model, Schema } from "mongoose";
import { PaymentStatus } from "../../types/ssl-ipn";
import { IOrder } from "./Order";
import { IUser } from "./User";

export interface IInvoiceDoc extends Document {
    user: string | IUser,
    order: string | IOrder,
    invoicePaymentStatus: InvoicePaymentStatus,
    paymentBy: PaymentByType,
    gatewayPaymentInfo: {
        status: PaymentStatus,
        tran_date: string,
        val_id: string,
        bank_tran_id: string,
        amount: number,
        store_amount: number,
        paymentMethod: string,
        card_no: string,
        currency: string,
        verifiedFrom: VerifiedEnum,
        fullResponse: any
    }
}
export enum VerifiedEnum {
    "USER" = "USER",
    "IPN" = "IPN"
}
export enum InvoicePaymentStatus {
    "COMPLETED" = "COMPLETED",
    "VALIDATED" = "VALIDATED",
    "PENDING" = "PENDING",
    "CANCELLED" = "CANCELLED",
    "FAILED" = "FAILED",
    "UNATTEMPTED" = "UNATTEMPTED",
    "EXPIRED" = "EXPIRED"
}

export enum PaymentByType {
    "CASH_ON_DELIVERY" = "CASH_ON_DELIVERY",
    "GATEWAY" = "GATEWAY"
}

const invoiceSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    order: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Order"
    },
    invoicePaymentStatus: {
        type: String,
        enum: ["COMPLETED", "PENDING", "CANCELLED", "FAILED", "UNATTEMPTED", "EXPIRED"],
        default: "PENDING"
    },
    paymentBy: {
        type: String,
        enum: ["CASH_ON_DELIVERY", "GATEWAY"],
        default: "GATEWAY"
    },
    gatewayPaymentInfo: {
        status: {
            type: String,
            enum: ["VALID","VALIDATED", "FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED"],
            default: "UNATTEMPTED"
        },
        tran_date: {
            type: String,
            default: ""
        },
        val_id: {
            type: String,
            default: ""
        },
        bank_tran_id: {
            type: String,
            default: ""
        },
        amount: {
            type: Number,
            default: 0
        },
        store_amount: {
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String,
            default: ""
        },
        card_no: {
            type: String,
            default: ""
        },
        currency: {
            type: String,
            default: "BDT"
        },
        verifiedFrom: {
            type: String,
            enum: ["USER", "IPN"]
        },
        fullResponse: Object
    }


}, {
    timestamps: true,
});

const Invoice: Model<IInvoiceDoc> = model("Invoice", invoiceSchema);

export default Invoice;
