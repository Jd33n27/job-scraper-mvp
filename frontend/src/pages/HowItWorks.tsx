import {
  Cpu,
  Sparkles,
  Zap,
  Palette,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="h-full overflow-y-auto w-full flex justify-center py-8 px-4 no-scrollbar">
      <div className="w-full max-w-3xl space-y-10 pb-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
            How <span className="text-cyan-400">Phantom Scraper</span> Works
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            A simple, easy-to-understand breakdown of the technical pipeline, automated components, and psychological design choices.
          </p>
        </div>

        {/* Section 1: Data Pipeline */}
        <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              1. Scraping Engine & Data Gathering
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            The scraper uses a Node.js microservice equipped with <strong>Puppeteer</strong> (a headless browser coordinator). Instead of downloading raw pages like simple bots, it acts like a real user to browse, render dynamic JavaScript, and fetch jobs from sources like Indeed, Glassdoor, and Remotive.
          </p>
          
          <div className="bg-black/25 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Robots.txt & Rate Limiting
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              To be a responsible web citizen, Phantom Scraper checks each site's <code>robots.txt</code> file before starting. It enforces a 1-second delay between requests to avoid overloading job boards.
            </p>
            
            <div className="pt-2 border-t border-white/5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-400">
                  Upwork & Fiverr Scraper Blockers
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sites like Upwork and Fiverr use aggressive scraper blockers (like Cloudflare, Captchas, and strict user-agent checks) and explicitly disallow scraping in their robots.txt files. While scrapers exist for them in the codebase, they are skipped by default to respect robots.txt rules, and running them directly often prompts verification checks that block standard headless browsers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: AI Parsing & Scoring */}
        <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              2. Gemini AI Analysis & Resume Matching
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            When the application starts, it seeds your background profile by extracting key information (like skills, experience levels, and preferred titles) from your resume (stored in <code>cv.txt</code>) using the <strong>Google Gemini API</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-black/25 rounded-xl p-4 border border-white/5 space-y-2">
              <div className="font-semibold text-slate-200">How Matching Works</div>
              <p className="text-slate-400 leading-relaxed">
                When new jobs are crawled, the backend calls Gemini to compare the job description with your parsed profile, scoring the match compatibility from 0% to 100%.
              </p>
            </div>
            <div className="bg-black/25 rounded-xl p-4 border border-white/5 space-y-2">
              <div className="font-semibold text-slate-200">Profile Configuration</div>
              <p className="text-slate-400 leading-relaxed">
                You can view and modify these parsed parameters directly using the **Profile** modal on the top right navigation bar to tune the matching engine.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Auto-Apply Automation */}
        <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              3. Automated Applications & Form Detection
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            When you click "Apply", the system analyzes the target page's layout using structural heuristics:
          </p>

          <div className="relative border-l-2 border-cyan-500/25 pl-4 ml-2 space-y-6">
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              <div className="font-semibold text-xs text-slate-200">Step 1: Detection</div>
              <p className="text-xs text-slate-400 mt-1">
                The backend inspects page markers to identify application fields (e.g. Email field, Name, Cover Letter upload).
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              <div className="font-semibold text-xs text-slate-200">Step 2: Auto-Fill</div>
              <p className="text-xs text-slate-400 mt-1">
                Puppeteer launches in the background, focuses on inputs, and simulates keyboard keypresses to fill in your identity info.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              <div className="font-semibold text-xs text-slate-200">Step 3: Alert & Status</div>
              <p className="text-xs text-slate-400 mt-1">
                Upon submission, details are logged to your <strong>Applications</strong> tab, and a success or review notification is dispatched via Discord webhooks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Design Psychology */}
        <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 hover:border-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Palette className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              4. Design Psychology: Terracotta & Obsidian
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            The visual interface utilizes a custom-designed color scheme intended for cognitive focus and high brand memory:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-2">
            <div className="p-4 bg-[#0f0d0c] border border-white/5 rounded-xl space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#0f0d0c] border border-white/10 mx-auto shadow-inner"></div>
              <div className="text-xs font-semibold text-slate-200 mt-2">Warm Obsidian</div>
              <p className="text-[10px] text-slate-500">
                A dark background variant with slight warm undertones that reduces eye strain and feels calming.
              </p>
            </div>
            <div className="p-4 bg-[#171514] border border-white/5 rounded-xl space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#d95f38] mx-auto"></div>
              <div className="text-xs font-semibold text-slate-200 mt-2">Terracotta Rust</div>
              <p className="text-[10px] text-slate-500">
                The primary call-to-action color. Earthy, intense, and memorable. Avoids typical corporate blue fatigue.
              </p>
            </div>
            <div className="p-4 bg-[#171514] border border-white/5 rounded-xl space-y-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d95f38] to-[#e3a054] mx-auto"></div>
              <div className="text-xs font-semibold text-slate-200 mt-2">Amber Gold Gradient</div>
              <p className="text-[10px] text-slate-500">
                Represents premium opportunities and matches, leaving users with a sense of growth and high value.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic pt-2 leading-relaxed">
            Psychological Impact: In a digital landscape dominated by cold, sterile tech-blue sites, this earthy warm color scheme creates a unique mental bookmark. Users retain memory of the dashboard's intense, grounded personality long after closing the tab.
          </p>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 text-center text-xs text-slate-500">
          Phantom Scraper Architecture &bull; Designed for long-term memory & performance.
        </div>
      </div>
    </div>
  );
}
