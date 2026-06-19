const puppeteer = require("puppeteer");
const { isAllowed } = require("./robots");

async function scrape(query = "full stack developer") {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.fiverr.com/search/gigs?query=${encodedQuery}&source=main_banner&search_in=everywhere`;

  const allowed = await isAllowed(url);
  if (!allowed) {
    console.log(`Scraping disallowed by robots.txt for ${url}`);
    return [];
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  const allResults = [];

  try {
    console.log(`Scraping Fiverr: ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const gigCards = document.querySelectorAll(".gig-card-layout");
      const results = [];

      gigCards.forEach((el) => {
        const titleEl = el.querySelector("h3");
        const title = titleEl?.innerText.trim();
        const urlEl = el.querySelector("a");
        const url = urlEl
          ? "https://www.fiverr.com" + urlEl.getAttribute("href")
          : "";

        const sellerEl = el.querySelector(".seller-name");
        const company = sellerEl?.innerText.trim() || "Fiverr Seller";

        const location = "Remote";

        // Price extraction
        let salaryMin = null;
        const priceEl = el.querySelector(".price-wrapper, .price");
        if (priceEl) {
          const priceText = priceEl.innerText;
          const match = priceText.match(/\$(\d+)/);
          if (match) {
            salaryMin = parseInt(match[1]);
          }
        }

        if (title && url) {
          results.push({
            title,
            company,
            location,
            url,
            description: "Fiverr Gig / Project",
            source: "Fiverr",
            salary_min: salaryMin,
          });
        }
      });

      return results;
    });

    allResults.push(...jobs);
  } catch (error) {
    console.error("Error scraping Fiverr:", error.message);
  } finally {
    await browser.close();
  }

  return allResults;
}

module.exports = { scrape };
