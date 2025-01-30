import puppeteer from "puppeteer";
import carModel from "../Models/carModel.js";
import { sendCarNotification } from "../utils/telegramMessage.js";

const url =
  "https://www.myauto.ge/ka/s/iyideba-manqanebi?0=page&vehicleType=0&bargainType=0&mansNModels=&priceFrom=900&priceTo=10000&currId=1&mileageType=1&locations=2&customs=1&sort=1&page=1&layoutId=1";

export const scrapeWithPuppeteer = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      timeout: 120000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
      headless: "new",
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    const cars = await page.evaluate(() => {
      const carDivs = document.querySelectorAll(
        ".flex.flex-col.items-start.md\\:flex-row.md\\:p-\\[16px\\].transition-opacity.duration-700.ease-in-out"
      );

      return Array.from(carDivs).map((div) => ({
        title:
          div.querySelector(".line-clamp-1.text-raisin-100")?.innerText ||
          "N/A",
        price:
          div.querySelector(".flex.items-center.undefined")?.innerText || "N/A",
        year:
          div.querySelector(
            ".mr-\\[8px\\].ml-\\[0px\\].md\\:ml-\\[8px\\].flex.text-\\[\\#8996ae\\].font-medium.whitespace-nowrap"
          )?.innerText || "N/A",
        link:
          div.querySelector("a.line-clamp-1.text-raisin-100")?.href || "N/A",
        imageUrl: div.querySelector(".items__image")?.src || "N/A",
      }));
    });

    const formattedCars = cars.map((car) => ({
      carModel: car.title,
      carPrice: car.price,
      carYear: car.year,
      carLink: car.link,
      carImage: car.imageUrl,
    }));

    try {
      const result = await carModel.insertMany(formattedCars, {
        ordered: false,
      });

      if (result.length <= 0) {
        await sendCarNotification(result);
        console.log(
          `Successfully inserted ${result.length} new cars and sent notification`
        );
      }
    } catch (error) {
      if (error.writeErrors && error.insertedDocs.length > 0) {
        await sendCarNotification(error.insertedDocs);
        console.log(
          `Inserted ${error.insertedDocs.length} cars, ${error.writeErrors.length} duplicates skipped`
        );
      }
    }
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};
