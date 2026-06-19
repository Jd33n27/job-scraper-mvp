const puppeteer = require("puppeteer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const url = process.argv[2];
const userName = process.env.USER_NAME || "Default Name";
const userEmail = process.env.USER_EMAIL || "default@example.com";
const userPhone = process.env.USER_PHONE || "0000000000";
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!url) {
  console.error("Usage: node applier.js <url>");
  process.exit(1);
}

async function getGeminiSelectors(html) {
  if (!geminiApiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analyze the following HTML form and identify the CSS selectors for the following fields:
- Full Name
- Email Address
- Phone Number

HTML:
${html.substring(0, 10000)}

Respond ONLY with a JSON object like this:
{
  "name": "input[name='full_name']",
  "email": "#email-field",
  "phone": ".phone-input"
}
If a field is not found, use null.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean JSON response
    text = text
      .replace(/```json\n?/, "")
      .replace(/```/, "")
      .trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini selector extraction failed:", e.message);
    return null;
  }
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // 1. Get Form HTML for Gemini
    const formHtml = await page.evaluate(() => {
      const form = document.querySelector("form");
      return form ? form.outerHTML : document.body.innerHTML;
    });

    // 2. Get Selectors from Gemini (or fallback to heuristics)
    let geminiSelectors = await getGeminiSelectors(formHtml);

    const heuristicSelectors = {
      name: [
        'input[name*="name" i]',
        'input[id*="name" i]',
        'input[placeholder*="name" i]',
      ],
      email: [
        'input[name*="email" i]',
        'input[type="email"]',
        'input[id*="email" i]',
      ],
      phone: [
        'input[name*="phone" i]',
        'input[type="tel"]',
        'input[id*="phone" i]',
      ],
    };

    const fieldsToFill = {
      name: {
        value: userName,
        selectors: geminiSelectors?.name
          ? [geminiSelectors.name]
          : heuristicSelectors.name,
      },
      email: {
        value: userEmail,
        selectors: geminiSelectors?.email
          ? [geminiSelectors.email]
          : heuristicSelectors.email,
      },
      phone: {
        value: userPhone,
        selectors: geminiSelectors?.phone
          ? [geminiSelectors.phone]
          : heuristicSelectors.phone,
      },
    };

    let filledAny = false;

    for (const [key, config] of Object.entries(fieldsToFill)) {
      for (const selector of config.selectors) {
        if (!selector) continue;
        try {
          const element = await page.$(selector);
          if (element) {
            // Clear field first
            await page.click(selector, { clickCount: 3 });
            await page.keyboard.press("Backspace");

            await page.type(selector, config.value);
            console.log(
              `Filled ${key} using selector: ${selector} (${geminiSelectors && geminiSelectors[key] === selector ? "AI" : "Heuristic"})`,
            );
            filledAny = true;
            break;
          }
        } catch (e) {
          // Ignore selector errors
        }
      }
    }

    if (!filledAny) {
      throw new Error("Could not find any recognizable form fields");
    }

    console.log("Form detection and auto-fill complete.");

    // 3. Submit the form
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Apply")',
      'button:has-text("Send")',
      'form button:last-of-type',
      'form input[type="button"]',
    ];

    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitBtn = await page.$(selector);
        if (submitBtn) {
          const isVisible = await page.evaluate(
            (el) =>
              el.offsetParent !== null &&
              window.getComputedStyle(el).display !== "none",
            submitBtn,
          );
          if (isVisible) {
            console.log(`Clicking submit button: ${selector}`);
            await Promise.race([
              Promise.all([
                page.waitForNavigation({
                  waitUntil: "networkidle2",
                  timeout: 15000,
                }),
                submitBtn.click(),
              ]),
              // Fallback: some forms submit via AJAX without navigation
              new Promise((resolve) => setTimeout(resolve, 5000)),
            ]);
            submitted = true;
            console.log("Form submitted successfully.");
            break;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!submitted) {
      // Fallback: try submitting the form element directly
      try {
        await page.evaluate(() => {
          const form = document.querySelector("form");
          if (form) form.submit();
        });
        console.log("Form submitted via form.submit() fallback.");
        submitted = true;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (e) {
        console.error("Could not submit form:", e.message);
      }
    }

    // Brief wait for any post-submit processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await browser.close();

    if (submitted) {
      console.log(JSON.stringify({ status: "submitted", fields_filled: true }));
      process.exit(0);
    } else {
      console.log(
        JSON.stringify({
          status: "filled_only",
          fields_filled: true,
          reason: "No submit button found",
        }),
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("Application failed:", error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
