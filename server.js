import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
import carModel from "./Models/carModel.js";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  try {
    const cars = await carModel.find().sort({ _id: -1 }).limit(50);
    if (!cars || cars.length === 0) {
      return res.status(404).json({ message: "No cars were found" });
    }
    res.status(200).json({ cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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
      }, 60000);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
