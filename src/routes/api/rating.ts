import { Router, Response, NextFunction } from "express";
import Request from "../../types/Request";
import auth from "../../middleware/auth";
import Product, { IProduct } from "../../models/schema-model/Product";
import { NotFound } from "../../utils/errors";
import Rating, { IRating } from "../../models/schema-model/Rating";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
const router: Router = Router();
router.post("/product/:productId", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { totalRating } = req.body;
        let productId = req.params.productId;
        let product = await Product.findById(productId);
        if (!product) {
            throw new NotFound("No product found..")
        }
        let rating: IRating = await Rating.findOne({
            product: productId,
            ratingBy: req.userId
        });
        if (!rating) {
            rating = new Rating({
                ratingBy: req.userId,
                product: productId,
                totalRating
            })
        }
        rating.totalRating = totalRating;
        await rating.save();

        let productRatingInfo = await Rating.aggregate([
            {
                $match: {
                    product: product._id
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalRating: { $sum: "$totalRating" }
                }
            }]);
        product.totalRating = productRatingInfo[0].totalRating;
        product.givenByRating = productRatingInfo[0].count;
        await product.save();
        let response: DefaultPayloadModel<IProduct> = {
            isSuccess: true,
            data: product,
            msg: "successfully rate product"
        }
        res.send(response);

    } catch (error) {
        next(error);
    }
});

router.post("/user-rating-by-product", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let products: string[] = req.body;
        let usersRating: IRating[] = await Rating.find({
            ratingBy: req.userId,
            product: {
                $in: products
            }
        });
        let response: DefaultPayloadModel<IRating[]> = {
            data: usersRating,
            isSuccess: true,
            msg: "successfully get all product rating by user"
        }
        res.send(response);

    } catch (error) {
        next(error);
    }
});

export default router;