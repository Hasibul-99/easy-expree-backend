import { Document, Model, model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  photo: string;
  creatingDate: any;
  status: boolean;
  isUnbrandCategory: boolean;
}

const categorySchema: Schema = new Schema({
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
  isUnbrandCategory: {
    type: Boolean,
    default: false
  }
});

const Category: Model<ICategory> = model("Category", categorySchema);

export default Category;
