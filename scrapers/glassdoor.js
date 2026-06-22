const puppeteer = require("puppeteer");
const { isAllowed } = require("./robots");

async function scrape(query = "react developer") {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedQuery}`;

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
  
  // Set a realistic user agent to avoid basic blocks
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  const allResults = [];

  try {
    console.log(`Scraping Glassdoor: ${url}...`);
    // Glassdoor is aggressive with bot detection, so we set a timeout and proceed on DOMContentLoaded
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait a brief moment to let dynamic content load
    await new Promise((r) => setTimeout(r, 3000));

    const jobs = await page.evaluate(() => {
      // Find all job listing cards/items using various possible Glassdoor selectors
      const jobCards = document.querySelectorAll(
        'li[data-test="jobListing"], [class*="JobCard_jobCard"], .jobCard, [data-test="job-listing"], li[class*="react-job-listing"]'
      );
      
      const results = [];

      jobCards.forEach((el) => {
        // Title element selection
        const titleEl = el.querySelector(
          'a[data-test="job-link"], [class*="JobCard_jobTitle"], .job-title, a[class*="jobTitle"]'
        );
        const title = titleEl ? titleEl.innerText.trim() : "";

        // URL selection
        let jobUrl = "";
        if (titleEl) {
          const href = titleEl.getAttribute("href");
          if (href) {
            jobUrl = href.startsWith("http") ? href : "https://www.glassdoor.com" + href;
          }
        }

        // Company name selection
        const companyEl = el.querySelector(
          '[class*="JobCard_companyName"], [class*="EmployerProfile"], .employer-name, .company-name, [class*="companyName"]'
        );
        let company = companyEl ? companyEl.innerText.trim() : "Glassdoor Employer";
        // Clean company name if it contains rating (e.g. "Google\n4.5")
        if (company.includes("\n")) {
          company = company.split("\n")[0].trim();
        }

        // Location selection
        const locationEl = el.querySelector(
          '[class*="JobCard_location"], [data-test="job-location"], .location, [class*="location"]'
        );
        const location = locationEl ? locationEl.innerText.trim() : "Remote / USA";

        // Salary extraction
        let salaryMin = null;
        let salaryMax = null;
        const salaryEl = el.querySelector(
          '[data-test="detailSalary"], [class*="JobCard_salaryEstimate"], .salary, [class*="salaryEstimate"]'
        );
        if (salaryEl) {
          const salaryText = salaryEl.innerText; // E.g., "$80K - $120K (Glassdoor est.)"
          const matches = salaryText.match(/\$(\d+)[kK]?/g);
          if (matches && matches.length >= 2) {
            const minStr = matches[0].replace("$", "").toLowerCase();
            const maxStr = matches[1].replace("$", "").toLowerCase();
            salaryMin = parseInt(minStr) * (minStr.includes("k") ? 1000 : 1);
            salaryMax = parseInt(maxStr) * (maxStr.includes("k") ? 1000 : 1);
          } else if (matches && matches.length === 1) {
            const minStr = matches[0].replace("$", "").toLowerCase();
            salaryMin = parseInt(minStr) * (minStr.includes("k") ? 1000 : 1);
          }
        }

        if (title && jobUrl) {
          results.push({
            title,
            company,
            location,
            url: jobUrl,
            description: "Glassdoor Job Listing",
            source: "Glassdoor",
            salary_min: salaryMin,
            salary_max: salaryMax,
          });
        }
      });

      return results;
    });

    allResults.push(...jobs);
  } catch (error) {
    console.error("Error scraping Glassdoor:", error.message);
  } finally {
    await browser.close();
  }

  return allResults;
}

module.exports = { scrape };
