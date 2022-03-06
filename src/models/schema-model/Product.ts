import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./User";

export interface IProduct extends Document {
  name: string;
  productDetails: string;
  creatingDate: any;
  status: boolean;
  regularPrice: number;
  sellPrice: number;
  totalSell: number;
  stock: number;
  sku: number;
  photos: string[],
  productOwner: string | IUser,
  category: string,
  categoryBrand: string,
  categoryBrandSubCategory: string,
  discountPrice: number,
  isFlushSell: boolean,
  isSlideProduct: boolean,
  isBundleProduct: boolean,
  totalRating: number,
  givenByRating: number

}

const productSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  productDetails: {
    type: String,
    required: false,
    default: ""
  },
  regularPrice: {
    type: Number,
    required: true
  },
  totalRating: {
    type: Number,
    required: true,
    default: 0
  },
  givenByRating: {
    type: Number,
    required: true,
    default: 0
  },
  sellPrice: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  sku: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  isFlushSell: {
    type: Boolean,
    default: false
  },
  isSlideProduct: {
    type: Boolean,
    default: false
  },
  isBundleProduct: {
    type: Boolean,
    default: false
  },
  totalSell: {
    type: Number,
    default: 0
  },
  creatingDate: {
    type: Date,
    default: Date.now
  },
  photos: [String],
  productOwner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  categoryBrand: {
    type: Schema.Types.ObjectId,
    ref: "CategoryBrand"
  },
  categoryBrandSubCategory: {
    type: Schema.Types.ObjectId,
    ref: "CategoryBrandSubCategory"
  }
});
const Product: Model<IProduct> = model("Product", productSchema);

export default Product;
