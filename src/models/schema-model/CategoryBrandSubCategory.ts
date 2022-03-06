import { Document, Model, model, Schema } from "mongoose";

export interface ICategoryBrandSubCategory extends Document {
  name: string;
  photo: string;
  creatingDate: any;
  status: boolean;
  category: string,
  categoryBrand: string
}

const categoryBrandSubCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Boolean,
    default: true
  },
  creatingDate: {
    type: Date,
    default: Date.now
  },
  photo: {
    type: String,
    default: ""
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  categoryBrand: {
    type: Schema.Types.ObjectId,
    ref: "CategoryBrand",
    required: true
  }
});

const CategoryBrandSubCategory: Model<ICategoryBrandSubCategory> = model("CategoryBrandSubCategory", categoryBrandSubCategorySchema);

export default CategoryBrandSubCategory;
