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

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.log(error, "Error connecting to MongoDB");
  process.exit(1);
}

await scrapeWithPuppeteer();
