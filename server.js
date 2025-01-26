import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
import carModel from "./Models/carModel.js";
import mongoose from "mongoose";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", async (req, res) => {
  const cars = await carModel.find();
  if (!cars) {
    return res.status(404).json({ message: "No cars were found" });
  }
  res.status(200).json({ cars });
});

app.post("/", async (req, res) => {
  try {
    const cars = await scrapeWithPuppeteer();

    const formattedCars = cars.map((car) => ({
      carModel: car.title,
      carLink: car.link,
      carYear: car.year,
      carPrice: car.price,
      carImage: car.imageUrl,
    }));

    await carModel.insertMany(formattedCars);

    res.status(200).json({ cars });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error loading cars", error: error.message });
  }
});

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
  });
} catch (error) {
  console.log(error, "Error connecting to mongodb");
  process.exit(1);
}
