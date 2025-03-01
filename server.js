import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
import router from "./Routes/CarsRoute.js";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
// app.get("/all-cars", async (req, res) => {
//   const allCars = await carPricesModel.find({});

//   console.log(allCars);

//   res.json(allCars);
// });
app.use(router);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      scrapeWithPuppeteer().catch(console.error);

      setInterval(async () => {
        try {
          await scrapeWithPuppeteer();
          console.log("Scheduled scrape completed");
        } catch (error) {
          console.error("Scheduled scrape failed:", error);
        }
      }, 600000);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
