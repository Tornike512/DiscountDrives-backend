import puppeteer from "puppeteer";
import carModel from "../Models/carModel.js";
import carPricesModel from "../Models/carPricesModel.js";
import { sendCarNotification } from "../utils/telegramMessage.js";

const url =
  "https://www.myauto.ge/en/s/iyideba-manqanebi?vehicleType=0&bargainType=0&mansNModels=&currId=1&mileageType=1&hideDealPrice=1&period=1h&customs=1&vinCode=1&sort=1&page=1&layoutId=1";

export const scrapeWithPuppeteer = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      timeout: 120000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--js-flags=--expose-gc",
        "--use-gl=disabled",
        "--window-size=1280,720",
        "--blink-settings=imagesEnabled=false",
      ],
      headless: "new",
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.setCacheEnabled(false);

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "font" ||
        resourceType === "media"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    const cars = await page.evaluate(() => {
      const carDivs = document.querySelectorAll(
        ".flex.flex-col.items-start.md\\:flex-row.md\\:p-\\[16px\\].transition-opacity.duration-700.ease-in-out"
      );

      return Array.from(carDivs)

        .filter((div) => {
          const priceLabel = div.querySelector('div[class*="bg-[#38de7a]"]');
          const labelText = priceLabel?.textContent.replace(/\s+/g, " ").trim();
          return labelText === "Low Price";
        })
        .map((div) => ({
          title:
            div.querySelector(".line-clamp-1.text-raisin-100")?.innerText ||
            "N/A",
          price:
            div.querySelector(".flex.items-center.undefined")?.innerText ||
            "N/A",
          year:
            div.querySelector(
              ".mr-\\[8px\\].ml-\\[0px\\].md\\:ml-\\[8px\\].flex.text-\\[\\#8996ae\\].font-medium.whitespace-nowrap"
            )?.innerText || "N/A",
          link:
            div.querySelector("a.line-clamp-1.text-raisin-100")?.href || "N/A",
          imageUrl: div.querySelector(".items__image")?.src || "N/A",
          priceLabel: "Low Price",
        }));
    });

    await page.close();

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

      if (result.length > 0) {
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

    console.log("Memory after scraping:", process.memoryUsage());

    if (global.gc) {
      global.gc();
    }

    return formattedCars;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed properly");
    }
  }
};
