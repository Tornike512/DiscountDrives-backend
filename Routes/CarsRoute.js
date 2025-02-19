import { Router } from "express";
import { sendCarsData, sendCarsLength } from "../Controllers/CarsController.js";

const router = Router();

router.route("/").get(sendCarsData);

router.route("/page-length").get(sendCarsLength);

export default router;
