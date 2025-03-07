import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
import router from "./Routes/CarsRoute.js";
import mongoose from "mongoose";
import cors from "cors";
import carPricesModel from "./Models/carPricesModel.js";
import carModel from "./Models/carModel.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use(router);

app.get("/filter-cars", async (req, res) => {
  try {
    const { manufacturer, model, year, price } = req.query;

    const cars = await carModel.find({});

    const filterCars = cars.filter((car) => {
      const manufacturerTerm = manufacturer ? manufacturer.toLowerCase() : "";
      const modelTerm = model ? model.toLowerCase() : "";
      const yearTerm = year ? year.toLowerCase() : "";
      const priceTerm = price ? price.toLowerCase() : "";

      const carModelLower = car.carModel ? car.carModel.toLowerCase() : "";
      const carYearLower = car.carYear ? String(car.carYear).toLowerCase() : "";
      const carPriceLower = car.carPrice
        ? String(car.carPrice).toLowerCase()
        : "";

      const modelMatch =
        manufacturer && model
          ? carModelLower.includes(`${manufacturerTerm} ${modelTerm}`)
          : false;

      const manuOnlyMatch =
        manufacturer && !model
          ? carModelLower.includes(manufacturerTerm)
          : false;

      const modelOnlyMatch =
        !manufacturer && model ? carModelLower.includes(modelTerm) : false;

      const yearMatch = year ? carYearLower.includes(yearTerm) : false;
      const priceMatch = price ? carPriceLower.includes(priceTerm) : false;

      return (
        modelMatch || manuOnlyMatch || modelOnlyMatch || yearMatch || priceMatch
      );
    });

    res.json({ cars: filterCars });
  } catch (error) {
    console.error("Error filtering cars:", error);
    res.status(500).json({ error: "Failed to filter cars" });
  }
});
// app.get("/all-cars", async (req, res) => {
//   try {
//     const cars = await carPricesModel.find({});
//     const brands = await carPricesModel.distinct("brand");
//     const model = cars
//       .flatMap((car) => {
//         return car.models;
//       })
//       .map((model) => {
//         return model.model;
//       });

//     const years = cars
//       .flatMap((car) => {
//         return car.models;
//       })
//       .map((year) => {
//         return year.prices_by_year;
//       });

//     res.json({ years });
//   } catch (error) {
//     console.error("Error fetching cars:", error);
//     res.status(500).json({ error: "Failed to fetch car data" });
//   }
// });

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
