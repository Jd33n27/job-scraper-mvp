async function scrape(userQuery) {
  const url = "https://remoteok.com/api";
  console.log(`Fetching RemoteOK jobs from API: ${url}...`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Index 0 is the legal disclaimer, slice it out
    const rawJobs = data.slice(1);

    // Normalize search query terms
    const queryTerms = userQuery
      ? userQuery.toLowerCase().split(/\s+/)
      : ["react", "golang", "developer"];

    const filteredJobs = rawJobs.filter(job => {
      const title = (job.position || "").toLowerCase();
      const desc = (job.description || "").toLowerCase();
      const tags = (job.tags || []).map(t => t.toLowerCase());

      // Match if at least one query term matches title, description, or tags
      return queryTerms.some(term => 
        title.includes(term) || desc.includes(term) || tags.includes(term)
      );
    });

    console.log(`RemoteOK API returned ${rawJobs.length} raw jobs, filtered to ${filteredJobs.length} for query "${userQuery}"`);

    return filteredJobs.map(job => {
      return {
        title: job.position,
        company: job.company,
        location: job.location || "Remote",
        url: job.apply_url || job.url,
        description: job.description || "",
        source: "RemoteOK",
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
      };
    });
  } catch (error) {
    console.error("RemoteOK API scrape error:", error);
    return [];
  }
}

module.exports = { scrape };

