import { Router, Response, NextFunction } from "express";
import Request from "../../types/Request";
import User, { IUser } from "../../models/schema-model/User";
import { GeneralError, NotFound } from "../../utils/errors";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import auth from "../../middleware/auth";
import Category, { ICategory } from "../../models/schema-model/Category";
import CategoryBrand from "../../models/schema-model/CategoryBrand";
import { ICategoryBrand } from "../../models/schema-model/CategoryBrand";
import CategoryBrandSubCategory, { ICategoryBrandSubCategory } from "../../models/schema-model/CategoryBrandSubCategory";
import { count, queryDataPopulate, queryDataPopulateAll } from "../../utils/query-service-utility";
import { EOrderStatus, IOrder, ISellProductItem } from "../../models/schema-model/Order";
import Order from "../../models/schema-model/Order";
import Product from "../../models/schema-model/Product";
import { CartProductModel } from "../../models/CartProductModel";
import { IInvoiceDoc, PaymentByType } from "../../models/schema-model/Invoice";
import Invoice from "../../models/schema-model/Invoice";
import { InvoicePaymentStatus } from "../../models/schema-model/Invoice";



const router: Router = Router();


router.get("/count", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let ordersCount = await count(Order, req.mongoseQuery);
        let response: DefaultPayloadModel<number> = {
            isSuccess: true,
            msg: "Successfull",
            data: ordersCount
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
}
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let query: { path: string, select: string }[] = [
        {
            "path": "products.product",
            "select": ""
        },
        {
            "path": "user",
            "select": "-password"
        },
        {
            "path": "invoice",
            "select": ""
        }
    ]
    let orders: IOrder[] = await queryDataPopulateAll(Order, req.mongoseQuery, query);
    let response: DefaultPayloadModel<IOrder[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: orders
    }
    res.json(response);
});
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { userId, products, paymentType }: { userId: String, products: CartProductModel[], paymentType: PaymentByType } = req.body;
        let user = await User.findById(userId);
        if (!user) {
            throw new NotFound("No user found.");
        }

        let totalDiscount = 0;
        let totalPrice = 0;
        let productsMap: any = {};
        let productList: ISellProductItem[] = [];


        for (let i = 0; i < products.length; i++) {
            let item: CartProductModel = products[i];
            let product = await Product.findById(item.product);
            if (!product)
                throw new NotFound("No product found.");
            productsMap[item.product] = product;
            totalPrice += (product.sellPrice * item.qty);
            totalDiscount += (product.discountPrice * item.qty);
            productList.push({
                unit: item.qty,
                product: item.product,
                price: (product.sellPrice * item.qty),
                discountPrice: (product.discountPrice * item.qty),
                productOwner: product.productOwner
            });
            product.stock -= item.qty;
            product.totalSell += 1;
            await product.save();
        }

        //let finalPrice = totalPrice - totalDiscount;



        let orderModel = {
            user: userId,
            totalPrice: totalPrice,
            discount: totalDiscount,
            extraCharge: 0,
            orderStatus: EOrderStatus.PENDING,
            products: productList
        };
        let order: IOrder = new Order(orderModel);
        order.paymentType = paymentType;
        await order.save();

        let invoice: IInvoiceDoc = new Invoice({
            user: userId,
            order: order._id,
            invoicePaymentStatus: InvoicePaymentStatus.PENDING,
            paymentBy: paymentType
        });
        await invoice.save();
        order.invoice = invoice._id;
        await order.save();


        let response: DefaultPayloadModel<IOrder> = {
            isSuccess: true,
            msg: "Successfully create order",
            data: order
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});

// router.put("/", async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let { _id, products, orderStatus }: { _id: String, products: CartProductModel[], orderStatus: string } = req.body;
//         let order: IOrder = await Order.findById(_id);
//         if (!order) {
//             throw new NotFound("not found.");
//         }

//         let orderState: EOrderStatus = EOrderStatus[orderStatus];
//         if (orderState === EOrderStatus.DELIVERD) {
//             throw new GeneralError("Deliverd order can't be edit.");
//         }

//         let totalDiscount = 0;
//         let totalPrice = 0;
//         let productsMap: any = {};
//         let productList: ISellProductItem[] = [];

//         for (let i = 0; i < products.length; i++) {
//             let item: CartProductModel = products[i];
//             let product = await Product.findById(item.product);
//             if (!product)
//                 throw new NotFound("No product found.");
//             productsMap[item.product] = product;
//             totalPrice += (product.sellPrice * item.qty);
//             totalDiscount += (product.discountPrice * item.qty);
//             productList.push({
//                 unit: item.qty,
//                 product: item.product,
//                 price: (product.sellPrice * item.qty),
//                 discountPrice: (product.discountPrice * item.qty)
//             });
//         }

//         order.totalPrice = totalPrice;
//         order.discount = totalDiscount;
//         order.totalPrice = totalPrice;
//         order.products = productList;
//         order.orderStatus = orderState;




//         await order.save();
//         let response: DefaultPayloadModel<IOrder> = {
//             isSuccess: true,
//             msg: "Successfully update order",
//             data: order
//         }
//         res.json(response);
//     } catch (error) {
//         next(error);
//     }

// });
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, orderStatus, paymentType }: { _id: String, orderStatus: EOrderStatus, paymentType: PaymentByType } = req.body;
        let order: IOrder = await Order.findById(_id);
        if (!order) {
            throw new NotFound("not found.");
        }
        let state: EOrderStatus = EOrderStatus[orderStatus];

        if (order.orderStatus === EOrderStatus.DELIVERD) {
            throw new GeneralError(order.orderStatus + " order can't be edited.");
        }

        if (state === EOrderStatus.CANCEL) {

            for (let i = 0; i < order.products.length; i++) {

                let item: ISellProductItem = order.products[i];

                let product = await Product.findById(item.product);
                if (!product)
                    throw new NotFound("No product found.");

                product.stock += item.unit;
                product.totalSell -= 1;
                await product.save();
            }
        }





        order.orderStatus = state;
        if (paymentType)
            order.paymentType = paymentType;



        await order.save();
        let response: DefaultPayloadModel<IOrder> = {
            isSuccess: true,
            msg: "Successfully update order",
            data: order
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});
export default router;