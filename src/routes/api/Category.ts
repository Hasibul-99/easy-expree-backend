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
var multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const router: Router = Router();


router.post("/updateCategoryPhoto/:id", upload.single('img'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let id = req.param("id");
        console.log(id);
        let obj = await Category.findById(id);
        let uploadedFileName: string = req.file.filename;
        obj.photo = uploadedFileName;
        await obj.save();
        let response: DefaultPayloadModel<String> = {
            isSuccess: true,
            msg: "successfully upload photo",
            data: uploadedFileName
        }
        res.send(response);
    } catch (error) {
        next(error);
    }
});

router.post("/updateCategoryBrandPhoto/:id", upload.single('img'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let id = req.param("id");
        let obj = await CategoryBrand.findById(id);
        let uploadedFileName: string = req.file.filename;
        obj.photo = uploadedFileName;
        await obj.save();
        let response: DefaultPayloadModel<String> = {
            isSuccess: true,
            msg: "successfully upload photo",
            data: uploadedFileName
        }
        res.send(response);
    } catch (error) {
        next(error);
    }
});

router.post("/updateCategoryBrandSubcategoryPhoto/:id", upload.single('img'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let id = req.param("id");
        let obj = await CategoryBrandSubCategory.findById(id);
        let uploadedFileName: string = req.file.filename;
        obj.photo = uploadedFileName;
        await obj.save();
        let response: DefaultPayloadModel<String> = {
            isSuccess: true,
            msg: "successfully upload photo",
            data: uploadedFileName
        }
        res.send(response);
    } catch (error) {
        next(error);
    }
});

router.get("/menuList", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categories: ICategory[] = await Category.find({ status: true });
        let categoriesBrand: ICategoryBrand[] = await CategoryBrand.find({ status: true });
        let categoriesBrandSubCategories: ICategoryBrandSubCategory[] = await CategoryBrandSubCategory.find({ status: true });
        let response: DefaultPayloadModel<any> = {
            isSuccess: true,
            msg: "Successfull",
            data: {
                categories,
                categoriesBrand,
                categoriesBrandSubCategories
            }
        }
        res.json(response);
    } catch (error) {
        next(error)
    }

})

router.get("/categoryBrand/search", async (req: Request, res: Response, next: NextFunction) => {
    let categoryBrand: ICategoryBrand[] = await searchDataPopulateAll(CategoryBrand, req.mongoseQuery,[]);
    let response: DefaultPayloadModel<ICategoryBrand[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: categoryBrand
    }
    res.json(response);
});

router.get("/categoryBrand", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categoryBrand: ICategoryBrand[] = await queryData(CategoryBrand, req.mongoseQuery);
        let response: DefaultPayloadModel<ICategoryBrand[]> = {
            isSuccess: true,
            msg: "Successfull",
            data: categoryBrand
        }
        res.json(response);
    } catch (error) {
        next(error)
    }

})
router.post("/categoryBrand", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, category } = req.body;
        let categoryBrand: ICategoryBrand = new CategoryBrand({ name, category });
        await categoryBrand.save();
        let response: DefaultPayloadModel<ICategoryBrand> = {
            isSuccess: true,
            msg: "Successfully create category brand",
            data: categoryBrand
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.put("/categoryBrand", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, category, _id,status } = req.body;
        let categoryBrand: ICategoryBrand = await CategoryBrand.findById(_id);
        if (!categoryBrand) {
            throw new NotFound("not found.");
        }
        categoryBrand.status = status;
        categoryBrand.name = name;
        categoryBrand.category = category;

        await categoryBrand.save();
        let response: DefaultPayloadModel<ICategoryBrand> = {
            isSuccess: true,
            msg: "Successfully update category brand",
            data: categoryBrand
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});



router.get("/categoryBrandSubCategory/search", async (req: Request, res: Response, next: NextFunction) => {
    let categoryBrandSubCategory: ICategoryBrandSubCategory[] = await searchDataPopulateAll(CategoryBrandSubCategory, req.mongoseQuery,[]);
    let response: DefaultPayloadModel<ICategoryBrandSubCategory[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: categoryBrandSubCategory
    }
    res.json(response);
});

router.get("/categoryBrandSubCategory", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categoryBrandSubCategory: ICategoryBrandSubCategory[] = await queryData(CategoryBrandSubCategory, req.mongoseQuery);
        let response: DefaultPayloadModel<ICategoryBrandSubCategory[]> = {
            isSuccess: true,
            msg: "Successfull",
            data: categoryBrandSubCategory
        }
        res.json(response);
    } catch (error) {
        next(error)
    }

});


router.post("/categoryBrandSubCategory", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, category, categoryBrand } = req.body;
        let categoryBrandSubCategory: ICategoryBrandSubCategory = new CategoryBrandSubCategory({ name, category, categoryBrand });
        await categoryBrandSubCategory.save();
        let response: DefaultPayloadModel<ICategoryBrandSubCategory> = {
            isSuccess: true,
            msg: "Successfully create category brand sub category",
            data: categoryBrandSubCategory
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.put("/categoryBrandSubCategory", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, category, categoryBrand, _id,status } = req.body;
        let categoryBrandSubCategory: ICategoryBrandSubCategory = await CategoryBrandSubCategory.findById(_id);
        if (!categoryBrandSubCategory) {
            throw new NotFound("not found.");
        }
        categoryBrandSubCategory.status = status;
        categoryBrandSubCategory.name = name;
        categoryBrandSubCategory.category = category;
        categoryBrandSubCategory.categoryBrand = categoryBrand;

        await categoryBrandSubCategory.save();
        let response: DefaultPayloadModel<ICategoryBrandSubCategory> = {
            isSuccess: true,
            msg: "Successfully update category brand sub category",
            data: categoryBrandSubCategory
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});


router.get("/search", async (req: Request, res: Response, next: NextFunction) => {
    let categories: ICategory[] = await searchDataPopulateAll(Category, req.mongoseQuery,[]);
    let response: DefaultPayloadModel<ICategory[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: categories
    }
    res.json(response);
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categories: ICategory[] = await queryData(Category, req.mongoseQuery);
        let response: DefaultPayloadModel<ICategory[]> = {
            isSuccess: true,
            msg: "Successfull",
            data: categories
        }
        res.json(response);
    } catch (error) {
        next(error)
    }

});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, isUnbrandCategory } = req.body;
        let category: ICategory = new Category({ name, isUnbrandCategory });
        await category.save();
        let response: DefaultPayloadModel<ICategory> = {
            isSuccess: true,
            msg: "Successfully create category",
            data: category
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});

router.put("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, _id, isUnbrandCategory,status } = req.body;
        let category: ICategory = await Category.findById(_id);
        if (!category) {
            throw new NotFound("not found.");
        }
        category.status = status;
        category.name = name;
        category.isUnbrandCategory = isUnbrandCategory;
        await category.save();
        let response: DefaultPayloadModel<ICategory> = {
            isSuccess: true,
            msg: "Successfully update category",
            data: category
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});

export default router;