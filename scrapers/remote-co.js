const puppeteer = require("puppeteer");
const { isAllowed } = require("./robots");

async function scrape(query) {
  const url = "https://remote.co/remote-jobs/developer";

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

  // Realistic User Agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  const allResults = [];

  try {
    console.log(`Scraping Remote.co: ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll(
        ".card.m-0.border-left-0.border-right-0.border-top-0.p-2",
      );
      const results = [];

      jobElements.forEach((el) => {
        const titleEl = el.querySelector(".font-weight-bold.larger");
        const title = titleEl?.innerText.trim();
        const url = titleEl
          ? "https://remote.co" + titleEl.getAttribute("href")
          : "";

        // Remote.co structure for company and date is a bit nested
        const textContent = el.innerText;
        const companyMatch = textContent.match(/\|\s+(.*)\s+\|/);
        const company = companyMatch ? companyMatch[1].trim() : "Remote.co";

        const location = "Remote";

        // Filtering for keywords locally to save AI later
        const isRelevant =
          /react|node|go|golang|typescript|frontend|junior/i.test(title);

        if (title && url && isRelevant) {
          results.push({
            title,
            company,
            location,
            url,
            description: "Remote.co Developer Job",
            source: "Remote.co",
          });
        }
      });

      return results;
    });

    allResults.push(...jobs);
  } catch (error) {
    console.error("Error scraping Remote.co:", error);
  } finally {
    await browser.close();
  }

  return allResults;
}

module.exports = { scrape };
