const robots = require("./robots");

async function scrape(query = "developer") {
  const url = `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(query)}`;

  const allowed = await robots.isAllowed("https://himalayas.app/");
  if (!allowed) {
    console.log(`Scraping disallowed by robots.txt for Himalayas`);
    return [];
  }

  try {
    console.log(`Fetching Himalayas jobs: ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jobs = data.jobs || [];
    
    return jobs.map(job => {
      const location = job.locationRestrictions && job.locationRestrictions.length > 0
        ? job.locationRestrictions.join(", ")
        : "Remote";
        
      return {
        title: job.title,
        company: job.companyName,
        location: location,
        url: job.applicationLink || job.guid,
        description: job.description || "Himalayas Remote Listing",
        source: "Himalayas",
        salary_min: job.minSalary || null,
        salary_max: job.maxSalary || null,
      };
    });
  } catch (error) {
    console.error("Error fetching Himalayas jobs:", error.message);
    return [];
  }
}

module.exports = { scrape };
