import { Router, Response, NextFunction } from "express";
import Request from "../../types/Request";
import { GeneralError, NotFound } from "../../utils/errors";
import { DefaultPayloadModel } from "../../models/DefaultPayload";
import { queryData } from "../../utils/query-service-utility";
import { ITips } from "../../models/schema-model/Tips";
import Tips from "../../models/schema-model/Tips";

var multer = require('multer')
var upload = multer({ dest: 'uploads/' });

const router: Router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let tips: ITips[] = await queryData(Tips, req.mongoseQuery);
    let response: DefaultPayloadModel<ITips[]> = {
        isSuccess: true,
        msg: "Successfull",
        data: tips
    }
    res.json(response);
});

router.post("/addTipsPhoto", upload.array('photos'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let files: any[] = req.files;
        let tips = await Tips.findById(req.body._id);
        if (!tips)
            throw new NotFound("No tips found.");
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileName = file.filename;
            tips.photos.push(fileName);
        }
        await tips.save();
        let response: DefaultPayloadModel<ITips> = {
            isSuccess: true,
            msg: "Successfully create tips",
            data: tips
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.post("/updateTipsPhoto", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, photos } = req.body;
        let tips = await Tips.findById(req.body._id);
        if (!tips)
            throw new NotFound("No tips found.");
        tips.photos = photos;
        await tips.save();
        let response: DefaultPayloadModel<ITips> = {
            isSuccess: true,
            msg: "Successfully update tips",
            data: tips
        }
        res.json(response);
    } catch (error) {
        next(error);
    }
});


router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, tipsDetails } = req.body;
        let tipsModel = { name, tipsDetails };
        let tips: ITips = new Tips(tipsModel);
        await tips.save();
        let response: DefaultPayloadModel<ITips> = {
            isSuccess: true,
            msg: "Successfully create tips",
            data: tips
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});

router.put("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, _id, tipsDetails } = req.body;
        //let tipsModel = { name, regularPrice, sellPrice, stock, sku, category, categoryBrand, categoryBrandSubCategory, _id };

        let tips: ITips = await Tips.findById(_id);
        if (!tips) {
            throw new NotFound("not found.");
        }

        tips.name = name;
        tips.tipsDetails = tipsDetails;

        await tips.save();
        let response: DefaultPayloadModel<ITips> = {
            isSuccess: true,
            msg: "Successfully create tips",
            data: tips
        }
        res.json(response);
    } catch (error) {
        next(error);
    }

});
export default router;