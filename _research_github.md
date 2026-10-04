# GitHub Research — Scholarship Finder / Management / Study-Abroad

Context: China-focused scholarship + university finder (Next.js + Django REST), AI chat, virtual tours, document checklist, deadline countdown, EN/FR/AR, freemium. Target: international students applying to Chinese universities.
Date: 2026-10-03. Method: web search + direct github.com README reads, 10 repos.

---

## 1. AI-Scholar-Hunt — Asad-Aziz-001
URL: https://github.com/Asad-Aziz-001/AI-Scholar-Hunt
Stack: Python Flask 2.3 + SQLAlchemy + SQLite, Jinja2/HTML/CSS/JS, custom RAG + prompt-engine (no paid LLM), ReportLab + python-docx + Pillow, Flask-Login/Mail.
Standout:
- Eligibility checker scoring profile vs 8+ scholarships at once with % + met/missed criteria breakdown.
- Side-by-side comparison of up to 3 scholarships (funding, degree, nationality, language, deadline, docs, links).
- Document checklist generator + month-by-month timeline visualizer + study-abroad cost estimator (tuition/living/visa/insurance/flight).
- Multi-country CV builder (14 countries, incl. China passport/visa-ready group) exporting PDF + DOCX + ATS checker + SOP/essay assistant + strength analyzer.

## 2. ScholarTrack — Eztosin/ScholarTrack
URL: https://github.com/Eztosin/ScholarTrack
Stack: React 18 + TypeScript + Vite + Tailwind, React Router, Supabase (Postgres + Auth + Edge Functions + RLS + realtime).
Standout:
- Application CRM pipeline (pending/applied/won/rejected) with advanced filter/sort + real-time stats + upcoming-deadlines widget with visual warnings.
- REST API for AI-agent submissions (`POST /applications`) + weekly summary endpoint (`GET /applications/summary`) designed for email digests.
- Demo account + one-click demo-data claiming (lowers onboarding friction, good for freemium conversion).

## 3. Study-Abroad-project — aryanlikebugs
URL: https://github.com/aryanlikebugs/Study-Abroad-project
Stack: MERN (React+Vite+Tailwind, Node/Express, MongoDB) + Python ML (BeautifulSoup/Requests, Pandas/NumPy, Flask API, Folium/Matplotlib/Seaborn), JWT, GitHub Actions CI.
Standout:
- ML recommendation model on degree/course/country/budget exposed via Flask `/recommend` API.
- Web scraper → JSON → manual Mongo import pipeline for university data.
- Heatmap/geospatial visualization of student flows (could map applicant origins → Chinese cities/unis) + wishlist + personalized dashboard.

## 4. SamvaadAI — saichintamani/SamvaadAI
URL: https://github.com/saichintamani/SamvaadAI
Stack: Next.js 14 + React 18 + TypeScript + Tailwind, FastAPI, Docker/compose, vector + graph DB (roadmap).
Standout:
- "Student Twin" — evolving virtual profile (academics/extracurriculars/goals) driving all matches.
- Explainable match scores ("92% due to first-gen + STEM + GPA") + Knowledge-Graph/Educational RAG concept.
- Multi-agent roadmap: Scraper/Opportunity agents + Matching/Prediction agents + Essay/Application agents.

## 5. Scholarship-Agent — muneeb2004-dev/Scholarship-Agent
URL: https://github.com/muneeb2004-dev/Scholarship-Agent
Stack: Flask 3.0 + SQLite + Flask-Caching/Limiter, Bootstrap 5 + Axios, BeautifulSoup/feedparser/Pandas/openpyxl, Docker.
Standout:
- Parallel scrapers for 10+ sources (DAAD, Fulbright, Chevening, Erasmus, Commonwealth, HEC) with clean/dedupe/standardize + caching + SQLite persistence.
- Transparent weighted matcher: country 30% / degree 25% / field 20% / GPA 15% / funding 10% with % display.
- Excel export of results + full REST API + search history + statistics/analytics dashboard.

## 6. Scholarship-Assistant PRO — bhavatharani23508-ai/Scholarship-Assistant
URL: https://github.com/bhavatharani23508-ai/Scholarship-Assistant
Stack: Python + Streamlit, FAISS + Sentence-Transformers (all-MiniLM-L6-v2) + OpenAI GPT, PyPDF, NumPy/Pandas.
Standout:
- Upload scholarship PDF → auto-extract type/amount/deadline/eligibility/requirements summary.
- RAG chatbot over uploaded PDFs (ask "deadline? docs? income limit?") with chat history + suggested questions + export.
- Profile-based match score (income/CGPA/category/course) + one-click eligibility/summary/AI-analysis report export.

## 7. scholarship-chatbot — drhammed/scholarship-chatbot
URL: https://github.com/drhammed/scholarship-chatbot
Stack: Python + Streamlit + LangChain, Groq / Ollama Cloud LLMs, Tavily live web search, ConversationBufferWindowMemory.
Standout:
- 3-agent pipeline: Profile Agent (citizenship/level/field/GPA/needs via chat) → Research Agent (multi-query live search) → Response Agent (filtered plan).
- Citizenship-aware matching + every recommendation includes source URLs for verification.
- Model-switcher (Groq/Ollama) + context-aware follow-ups — cheap pattern to add live-search fallback to existing AI chat.

## 8. Scholarship-Tracker — Rounak2408/Scholarship-Tracker
URL: https://github.com/Rounak2408/Scholarship-Tracker
Stack: Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui, Firebase Auth/Firestore/Storage, OpenAI API, SendGrid.
Standout:
- Rule-based smart matching on marks/income/state/category/gender/class — directly portable to CSC rules (nationality/age/GPA/HSK/language).
- Multilingual AI chatbot answering with direct portal links.
- Dashboard stats + dark mode + responsive tracker (Applied/Under Review/Accepted/Rejected) — closest stack match to our Next.js frontend.

## 9. scholarship-finder-app — nwesha/scholarship-finder-app
URL: https://github.com/nwesha/scholarship-finder-app
Stack: React + Axios + React Router, Node/Express + MongoDB/Mongoose + JWT, Cheerio/Axios scrapers.
Standout:
- Scraper-first seeding (`scrapers/index.js` populates DB before server start) — simple cron-able pattern for CSC/provincial/uni pages.
- JWT auth + saved applications + personalized matching backend.
- Claims sentiment analysis on scholarships (review/opinion signal — useful for Chinese-uni reviews).

## 10. ScholarshipFinderBot — barninzuniversity/ScholarshipFinderBot
URL: https://github.com/barninzuniversity/ScholarshipFinderBot
Stack: n8n workflow + OpenAI GPT-4o-mini + Gmail API, OpportunityDesk RSS + WeMakeScholars CSS scraping.
Standout:
- Daily 9AM auto-scrape → merge → GPT-4o-mini rank → HTML email digest with priority ranking (~$5/mo for 100 users).
- No-code webhook form (major/CV/study-level/country/GPA/grad-year) + instant analysis response.
- Explicit matching weights (primary: field/level/geography/GPA; secondary: deadline/amount) — copyable scoring spec.

---

## TOP 10 feature ideas most worth copying (ranked by student value)

1. Eligibility checker with % + why/why-not breakdown — stops wasted CSC applications, the #1 student pain.
2. Per-scholarship auto document checklist (CSC Type A/B, JW201/202, HSK, medical) — turns confusion into tick-off progress.
3. PDF RAG Q&A on official prospectus/CSC rules — answers "am I eligible?" from the real source.
4. Side-by-side comparison view (up to 3: funding, city cost, HSK, deadline, docs) — makes final choice fast.
5. Personalized application timeline (research → docs → HSK → recommendations → essay → submit) — prevents missed deadlines.
6. Daily scraper + refresh pipeline for CSC/provincial/uni scholarships — freshness is trust.
7. China city cost estimator (tuition gap + living/visa/insurance/flight per city) — Beijing vs Chengdu changes decisions.
8. Tracker pipeline + deadline email/push + weekly summary — retention + freemium-to-paid trigger.
9. SOP/essay assistant + strength analyzer + China-format CV export (PDF/DOCX) — raises admit odds, justifies premium.
10. Weekly personalized email digest of top matches — brings students back without opening the app.
