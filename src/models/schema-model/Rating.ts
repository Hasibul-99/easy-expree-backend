import { Document, Model, model, Schema } from "mongoose";
import { IProduct } from "./Product";
import { IUser } from "./User";

export interface IRating extends Document {
    ratingBy: string | IUser;
    product: string | IProduct;
    totalRating: number;
}

const ratingSchema: Schema = new Schema({
    ratingBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    totalRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Rating: Model<IRating> = model("Rating", ratingSchema);

export default Rating;
