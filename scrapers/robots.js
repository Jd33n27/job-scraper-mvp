/**
 * Simple robots.txt checker
 */
async function isAllowed(url, userAgent = "*") {
  try {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;

    // We'll use a simple fetch. Since we don't have axios in package.json,
    // I should check what's available or just use native fetch if node version supports it.
    // Package.json has express, puppeteer, etc. Node 18+ has fetch.
    const response = await fetch(robotsUrl).catch(() => null);
    if (!response || !response.ok) return true; // Assume allowed if robots.txt is missing/error

    const text = await response.text();
    const lines = text.split("\n");
    let currentUserAgentMatch = false;
    let allowed = true;

    for (let line of lines) {
      line = line.trim().toLowerCase();
      if (line.startsWith("user-agent:")) {
        const agent = line.split(":")[1].trim();
        currentUserAgentMatch =
          agent === "*" || agent === userAgent.toLowerCase();
      } else if (currentUserAgentMatch && line.startsWith("disallow:")) {
        const path = line.split(":")[1].trim();
        if (path && parsedUrl.pathname.startsWith(path)) {
          allowed = false;
        }
      } else if (currentUserAgentMatch && line.startsWith("allow:")) {
        const path = line.split(":")[1].trim();
        if (path && parsedUrl.pathname.startsWith(path)) {
          allowed = true;
        }
      }
    }

    return allowed;
  } catch (error) {
    console.error(`Error checking robots.txt for ${url}:`, error.message);
    return true; // Default to allowed on error
  }
}

module.exports = { isAllowed };
