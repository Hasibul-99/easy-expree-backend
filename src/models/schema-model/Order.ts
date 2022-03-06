import { Document, Model, model, Schema } from "mongoose";
import { IInvoiceDoc, PaymentByType } from "./Invoice";
import { IProduct } from "./Product";
import { IUser } from "./User";

export interface IOrder extends Document {
  user: String | IUser,
  totalPrice: number,
  discount: number,
  extraCharge: number,
  creatingDate: any,
  orderStatus: EOrderStatus,
  products: ISellProductItem[],
  invoice: string & IInvoiceDoc,
  paymentType:PaymentByType
}
export interface ISellProductItem {
  product: String | IProduct,
  price: number,
  discountPrice: number,
  unit: number,
  productOwner: string | IUser
}
export enum EOrderStatus {
  "PENDING" = "PENDING",
  "DELIVERD" = "DELIVERD",
  "CANCEL" = "CANCEL"
}


const orderSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    default: 0
  },
  extraCharge: {
    type: Number,
    required: true,
    default: 0
  },
  creatingDate: {
    type: Date,
    default: Date.now
  },
  orderStatus: {
    type: String,
    enum: ["PENDING", "DELIVERD", "CANCEL"],
    default: "PENDING"
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product"
      },
      productOwner: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      price: {
        type: Number,
        required: true,
        default: 0
      },
      discountPrice: {
        type: Number,
        required: true,
        default: 0
      },
      unit: {
        type: Number,
        required: true,
        default: 1
      },
    }
  ],
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "Invoice"
  },
  paymentType: {
    type: String,
    enum: ["CASH_ON_DELIVERY", "GATEWAY"],
    default: "GATEWAY"
  }
}, {
  timestamps: true,
});

const Order: Model<IOrder> = model("Order", orderSchema);

export default Order;
