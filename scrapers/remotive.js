const robots = require("./robots");

async function scrape(query = "developer") {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;

  const allowed = await robots.isAllowed("https://remotive.com/");
  if (!allowed) {
    console.log(`Scraping disallowed by robots.txt for Remotive`);
    return [];
  }

  try {
    console.log(`Fetching Remotive jobs: ${url}...`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jobs = data.jobs || [];
    
    return jobs.map(job => {
      // Parse salary if present (heuristic)
      let salaryMin = null;
      let salaryMax = null;
      if (job.salary) {
        const matches = job.salary.match(/\$(\d+)[kK]?/g);
        if (matches && matches.length >= 2) {
          salaryMin = parseInt(matches[0].replace(/[^0-9]/g, "")) * (job.salary.toLowerCase().includes("k") ? 1000 : 1);
          salaryMax = parseInt(matches[1].replace(/[^0-9]/g, "")) * (job.salary.toLowerCase().includes("k") ? 1000 : 1);
        } else if (matches && matches.length === 1) {
          salaryMin = parseInt(matches[0].replace(/[^0-9]/g, "")) * (job.salary.toLowerCase().includes("k") ? 1000 : 1);
        }
      }

      return {
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        url: job.url,
        description: job.description || "",
        source: "Remotive",
        salary_min: salaryMin,
        salary_max: salaryMax,
      };
    });
  } catch (error) {
    console.error("Error fetching Remotive jobs:", error.message);
    return [];
  }
}

module.exports = { scrape };
