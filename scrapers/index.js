const express = require("express");
const cors = require("cors");
const Bottleneck = require("bottleneck");
const remoteok = require("./remoteok");
const indeed = require("./indeed");
const linkedin = require("./linkedin");
const upwork = require("./upwork");
const fiverr = require("./fiverr");
const remoteco = require("./remote-co");
const flexjobs = require("./flexjobs");
const robots = require("./robots");
const himalayas = require("./himalayas");
const remotive = require("./remotive");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Rate limiter: ensure we don't hit multiple sites too fast
const limiter = new Bottleneck({
  minTime: 1000, // 1 second between scraper calls
});

app.post("/scrape", async (req, res) => {
  const { keywords } = req.body || {};
  
  // If keywords are empty, fallback to Musa's main skills from CV
  const queryList =
    keywords && keywords.length > 0
      ? keywords
      : ["react", "next.js", "typescript", "go", "golang"];

  console.log(
    `Scrape request received for keywords: ${JSON.stringify(queryList)}. Aggregating from 9 sources...`,
  );

  try {
    const allJobsMap = new Map();

    // Query for each keyword individually to get maximum coverage
    for (const query of queryList) {
      console.log(`Scraping for keyword: "${query}"...`);

      const results = await Promise.allSettled([
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://remoteok.com/"))) {
            console.warn("Robots.txt Disallowed: RemoteOK");
            return [];
          }
          return remoteok.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://himalayas.app/"))) {
            console.warn("Robots.txt Disallowed: Himalayas");
            return [];
          }
          return himalayas.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://remotive.com/"))) {
            console.warn("Robots.txt Disallowed: Remotive");
            return [];
          }
          return remotive.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://remote.co/"))) {
            console.warn("Robots.txt Disallowed: Remote.co");
            return [];
          }
          return remoteco.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://www.flexjobs.com/"))) {
            console.warn("Robots.txt Disallowed: FlexJobs");
            return [];
          }
          return flexjobs.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://www.indeed.com/"))) {
            console.warn("Robots.txt Disallowed: Indeed");
            return [];
          }
          return indeed.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://www.linkedin.com/"))) {
            console.warn("Robots.txt Disallowed: LinkedIn");
            return [];
          }
          return linkedin.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://www.upwork.com/"))) {
            console.warn("Robots.txt Disallowed: Upwork");
            return [];
          }
          return upwork.scrape(query);
        }),
        limiter.schedule(async () => {
          if (!(await robots.isAllowed("https://www.fiverr.com/"))) {
            console.warn("Robots.txt Disallowed: Fiverr");
            return [];
          }
          return fiverr.scrape(query);
        }),
      ]);

      results.forEach((res, index) => {
        const sources = [
          "RemoteOK",
          "Himalayas",
          "Remotive",
          "Remote.co",
          "FlexJobs",
          "Indeed",
          "LinkedIn",
          "Upwork",
          "Fiverr",
        ];
        
        if (res.status === "fulfilled") {
          const jobs = res.value || [];
          jobs.forEach((job) => {
            if (job && job.url) {
              allJobsMap.set(job.url, job);
            }
          });
        } else {
          console.error(`Scraper ${sources[index]} failed for query "${query}":`, res.reason);
        }
      });
    }

    const allJobs = Array.from(allJobsMap.values());
    console.log(`Scrape complete. Total unique jobs found: ${allJobs.length}`);
    res.json(allJobs);
  } catch (error) {
    console.error("Scraping orchestration failed:", error);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper service listening on port ${PORT}`);
});

