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

  let queries = ["junior+react", "junior+go+developer"];

  if (userQuery) {
    queries = [userQuery.replace(/\s+/g, "+")];
  }

  try {
    for (const q of queries) {
      console.log(`Scraping Indeed for: ${q}...`);
      await page.goto(`https://www.indeed.com/jobs?q=${q}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll(".job_seen_beacon");
        const results = [];

        jobCards.forEach((card) => {
          const title = card.querySelector("h2.jobTitle")?.innerText.trim();
          const company = card
            .querySelector('[data-testid="company-name"]')
            ?.innerText.trim();
          const location = card
            .querySelector('[data-testid="text-location"]')
            ?.innerText.trim();
          const url = card.querySelector("a.jcs-JobTitle")?.href;

          if (title && company) {
            results.push({
              title,
              company,
              location,
              url,
              description: "",
              source: "Indeed",
            });
          }
        });

        return results;
      });

      allResults.push(...jobs);
      await new Promise((r) => setTimeout(r, 3000)); // Be gentle with Indeed
    }

    return allResults;
  } catch (error) {
    console.error("Indeed scrape error:", error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };
