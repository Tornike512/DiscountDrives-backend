import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", async (req, res) => {
  const cars = await scrapeWithPuppeteer();

  if (!cars) {
    return res.status(400).json({ message: error });
  }

  res.status(200).json({ cars });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
