import puppeteer from "puppeteer";

const url =
  "https://www.myauto.ge/ka/s/iyideba-manqanebi?0=page&vehicleType=0&bargainType=0&mansNModels=&priceFrom=900&priceTo=10000&currId=1&mileageType=1&locations=2&customs=1&sort=1&page=1&layoutId=1";

export const scrapeWithPuppeteer = async () => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
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
      }));
    });

    return cars;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

scrapeWithPuppeteer().catch(console.error);
