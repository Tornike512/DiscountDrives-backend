import express from "express";
import { scrapeWithPuppeteer } from "./scraping/scraping.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

scrapeWithPuppeteer();

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
