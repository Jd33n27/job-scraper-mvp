const puppeteer = require("puppeteer");
const { isAllowed } = require("./robots");

async function scrape(query = "react golang developer") {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.upwork.com/nx/search/jobs/?q=${encodedQuery}&sort=recency`;

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

  // Set a realistic user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  const allResults = [];

  try {
    console.log(`Scraping Upwork: ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Upwork jobs are in [data-test="job-tile-list"]
    await page
      .waitForSelector('[data-test="job-tile"]', { timeout: 10000 })
      .catch(() => null);

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('[data-test="job-tile"]');
      const results = [];

      jobElements.forEach((el) => {
        const titleEl = el.querySelector(".job-tile-title a");
        const title = titleEl?.innerText.trim();
        const url = titleEl
          ? "https://www.upwork.com" + titleEl.getAttribute("href")
          : "";

        const company = "Upwork Client"; // Upwork hides client names in search
        const location = "Remote / International";

        // Budget extraction
        let salaryMin = null;
        let salaryMax = null;
        const budgetEl =
          el.querySelector('[data-test="budget"]') ||
          el.querySelector('[data-test="job-type"]');
        if (budgetEl) {
          const budgetText = budgetEl.innerText;
          const matches = budgetText.match(/\$(\d+)/g);
          if (matches && matches.length >= 2) {
            salaryMin = parseInt(matches[0].replace("$", ""));
            salaryMax = parseInt(matches[1].replace("$", ""));
          } else if (matches && matches.length === 1) {
            salaryMin = parseInt(matches[0].replace("$", ""));
          }
        }

        // Filtering for keywords locally to save AI later
        const isRelevant =
          /react|node|go|golang|typescript|frontend|junior/i.test(title);

        if (title && url && isRelevant) {
          results.push({
            title,
            company,
            location,
            url,
            description: "Upwork Freelance Opportunity",
            source: "Upwork",
            salary_min: salaryMin,
            salary_max: salaryMax,
          });
        }
      });

      return results;
    });

    allResults.push(...jobs);
  } catch (error) {
    console.error("Error scraping Upwork:", error.message);
  } finally {
    await browser.close();
  }

  return allResults;
}

module.exports = { scrape };
