import { Document, Model, model, Schema } from "mongoose";

export interface ITips extends Document {
    name: string;
    tipsDetails: string;
    creatingDate: any;
    photos: string[]

}

const tipsSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    tipsDetails: {
        type: String,
        required: false,
        default: ""
    },
    creatingDate: {
        type: Date,
        default: Date.now
    },
    photos: [String]
});

const Tips: Model<ITips> = model("Tips", tipsSchema);

export default Tips;
