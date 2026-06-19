const puppeteer = require("puppeteer");
const { isAllowed } = require("./robots");

async function scrape(query = "developer") {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.flexjobs.com/search?search=${encodedQuery}&location=`;

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
    console.log(`Scraping FlexJobs: ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll(".job-listing");
      const results = [];

      jobElements.forEach((el) => {
        const titleEl = el.querySelector(".job-title");
        const title = titleEl?.innerText.trim();
        const url = titleEl
          ? "https://www.flexjobs.com" + titleEl.getAttribute("href")
          : "";

        const companyEl = el.querySelector(".job-company");
        const company = companyEl?.innerText.trim() || "FlexJobs Employer";

        const locationEl = el.querySelector(".job-location");
        const location = locationEl?.innerText.trim() || "Remote";

        // Salary extraction heuristic
        let salaryMin = null;
        let salaryMax = null;
        const text = el.innerText;
        const salaryMatch = text.match(/\$(\d{2,3}),?(\d{3})?/g);
        if (salaryMatch) {
          const vals = salaryMatch.map((s) =>
            parseInt(s.replace(/[^0-9]/g, "")),
          );
          if (vals.length >= 2) {
            salaryMin = vals[0];
            salaryMax = vals[1];
          } else {
            salaryMin = vals[0];
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
            description: "FlexJobs Remote Listing",
            source: "FlexJobs",
            salary_min: salaryMin,
            salary_max: salaryMax,
          });
        }
      });

      return results;
    });

    allResults.push(...jobs);
  } catch (error) {
    console.error("Error scraping FlexJobs:", error);
  } finally {
    await browser.close();
  }

  return allResults;
}

module.exports = { scrape };
