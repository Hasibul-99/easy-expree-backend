import { Document, Model, model, Schema } from "mongoose";
import { ICategory } from "./Category";

export interface ICategoryBrand extends Document {
  name: string;
  photo: string;
  creatingDate: any;
  status: boolean;
  category:string & ICategory
}

const categoryBrandSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Boolean,
    default: true
  },
  photo: {
    type: String,
    default: ""
  },
  creatingDate: {
    type: Date,
    default: Date.now
  },
  category:{
    type:Schema.Types.ObjectId,
    ref:"Category",
    required: true
  }

});

const CategoryBrand: Model<ICategoryBrand> = model("CategoryBrand", categoryBrandSchema);

export default CategoryBrand;
