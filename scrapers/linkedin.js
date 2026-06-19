const puppeteer = require("puppeteer");

async function scrape(userQuery) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();

  // Realistic User Agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  const allResults = [];

  let queries = ["Junior%20React", "Junior%20Go"];

  if (userQuery) {
    queries = [encodeURIComponent(userQuery)];
  }

  try {
    for (const q of queries) {
      console.log(`Scraping LinkedIn for: ${q}...`);
      // Public LinkedIn job search with precise keywords
      await page.goto(`https://www.linkedin.com/jobs/search?keywords=${q}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll(".base-search-card");
        const results = [];

        jobCards.forEach((card) => {
          const title = card
            .querySelector(".base-search-card__title")
            ?.innerText.trim();
          const company = card
            .querySelector(".base-search-card__subtitle")
            ?.innerText.trim();
          const location = card
            .querySelector(".job-search-card__location")
            ?.innerText.trim();
          const url = card.querySelector(".base-card__full-link")?.href;

          if (title && company) {
            results.push({
              title,
              company,
              location,
              url,
              description: "",
              source: "LinkedIn",
            });
          }
        });

        return results;
      });

      allResults.push(...jobs);
      await new Promise((r) => setTimeout(r, 2000));
    }

    return allResults;
  } catch (error) {
    console.error("LinkedIn scrape error:", error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };
