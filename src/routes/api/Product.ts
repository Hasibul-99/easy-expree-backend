import { Router, Response, NextFunction } from "express";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/schema-model/User";
import { GeneralError, NotFound } from "../../utils/errors";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import auth from "../../middleware/auth";
import Category, { ICategory } from "../../models/schema-model/Category";
import CategoryBrand from "../../models/schema-model/CategoryBrand";
import { ICategoryBrand } from "../../models/schema-model/CategoryBrand";
import CategoryBrandSubCategory, { ICategoryBrandSubCategory } from "../../models/schema-model/CategoryBrandSubCategory";
import { queryData, searchDataPopulateAll } from "../../utils/query-service-utility";
import { IProduct } from "../../models/schema-model/Product";
import Product from "../../models/schema-model/Product";

var multer = require('multer')
var upload = multer({ dest: 'uploads/' });

const router: Router = Router();

router.get("/search", async (req: Request, res: Response, next: NextFunction) => {
    let products: IProduct[] = await searchDataPopulateAll(Product, req.mongoseQuery, []);
    let response: DefaultPayloadModel<IProduct[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: products
    }
    res.json(response);
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let products: IProduct[] = await queryData(Product, req.mongoseQuery);
    let response: DefaultPayloadModel<IProduct[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: products
    }
    res.json(response);
});

router.post("/addProductPhoto", upload.array('photos'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let files: any[] = req.files;
        let product = await Product.findById(req.body._id);
        if (!product)
            throw new NotFound("No product found.");
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileName = file.filename;
            product.photos.push(fileName);
        }
        await product.save();
        let response: DefaultPayloadModel<IProduct> = {
            isSuccess: true,
            msg: "Successfully create product",
            data: product
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.post("/updateProductPhoto", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, photos } = req.body;
        let product = await Product.findById(req.body._id);
        if (!product)
            throw new NotFound("No product found.");
        product.photos = photos;
        await product.save();
        let response: DefaultPayloadModel<IProduct> = {
            isSuccess: true,
            msg: "Successfully update product",
            data: product
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});


router.post("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, regularPrice, sellPrice, stock, sku, category, categoryBrand, categoryBrandSubCategory, discountPrice, isFlushSell, isSlideProduct, isBundleProduct, productDetails } = req.body;
        let productModel = { name, regularPrice, sellPrice, stock, sku, category, categoryBrand, categoryBrandSubCategory, discountPrice, isFlushSell, isSlideProduct, isBundleProduct, productDetails, productOwner: req.userId };
        let product: IProduct = new Product(productModel);
        await product.save();
        let response: DefaultPayloadModel<IProduct> = {
            isSuccess: true,
            msg: "Successfully create product",
            data: product
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});

router.put("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, regularPrice, sellPrice, stock, sku, category, categoryBrand, categoryBrandSubCategory, _id, isSlideProduct, isBundleProduct, productDetails } = req.body;
        //let productModel = { name, regularPrice, sellPrice, stock, sku, category, categoryBrand, categoryBrandSubCategory, _id };

        let product: IProduct = await Product.findById(_id);
        if (!product) {
            throw new NotFound("not found.");
        }

        product.name = name;
        product.regularPrice = regularPrice;
        product.sellPrice = sellPrice;
        product.stock = stock;
        product.sku = sku;
        product.category = category;
        product.categoryBrand = categoryBrand;
        product.categoryBrandSubCategory = categoryBrandSubCategory;
        product.isSlideProduct = isSlideProduct;
        product.isBundleProduct = isBundleProduct;
        product.productDetails = productDetails;

        await product.save();
        let response: DefaultPayloadModel<IProduct> = {
            isSuccess: true,
            msg: "Successfully create product",
            data: product
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});


router.delete("/:id", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let product: IProduct = await Product.findById(req.params.id);
        if (!product) {
            throw new NotFound("No Product found.");
        }
        await product.remove();
        let responseModel: DefaultPayloadModel<string> = {
            isSuccess: true,
            data: "Product successfully delete",
            msg: "Product successfully delete",
        }
        res.send(responseModel);
    } catch (error) {
        next(error);
    }
})
export default router;