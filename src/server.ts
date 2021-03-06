import bodyParser from "body-parser";
import express from "express";

import {handleErrors} from "./middleware/error-handler";
import connectDB from "../config/database";
import auth from "./routes/api/auth";
import user from "./routes/api/user";
import category from "./routes/api/Category";
import product from "./routes/api/Product";
import order from "./routes/api/order";
import tips from "./routes/api/Tips";
import payment from "./routes/api/payment";
import rating from "./routes/api/rating";
import * as cors from "cors"

const app = express();

// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors.default());

//static file configure
const path:string=(__dirname + '/uploads').split("/dist/src/uploads")[0]+"/uploads";
app.use("/static",express.static(path));

/************ */
/***
 * middleware
 */
const mongooseQueryParser=require("./middleware/mongoose-query-parser");
/************** */




app.use(mongooseQueryParser);

app.get("/", (_req, res) => {
  res.send("API Running");
});



app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/category", category);
app.use("/api/product", product);
app.use("/api/order", order);
app.use("/api/tips", tips);
app.use("/api/payment", payment);
app.use("/api/rating", rating);

app.use(handleErrors);

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
