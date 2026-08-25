# TA Leadership Global Search

Mobile- and desktop-ready **Talent Acquisition leadership** job search app: live APIs, Boolean/X-ray, LinkedIn deep links, country resumes, My Profile auto-fill (Neeraj Kapil), and application emails.

**GitHub:** https://github.com/neerajkapil33/TA-Leadership-Global-Search  
**LinkedIn:** https://www.linkedin.com/in/neeraj-kapil/

## Project structure

```
TA-Leadership-Global-Search/
├── index.html              # App shell (mobile viewport + PWA-ish meta)
├── css/
│   └── styles.css          # Theme + responsive / touch styles
├── js/
│   └── app.js              # All app logic (jobs, profile, resumes, agent)
├── assets/                 # Optional images / icons
├── TA_Jobs_Realtime_App.html  # Optional single-file backup
├── README.md
└── .gitignore
```

## Run on desktop

```bash
# Recommended: local server (better for live API fetch)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:3000` or `http://localhost:8080`.

Or open `index.html` directly in Chrome / Edge / Firefox.

## Run on mobile

1. **GitHub Pages** (after you push):  
   `https://neerajkapil33.github.io/TA-Leadership-Global-Search/`
2. Or use the same local network URL from your phone while `serve` is running.
3. Add to Home Screen (Safari / Chrome) for app-like use.

## Features

- Live jobs: Remotive, Arbeitnow, Jobicy, The Muse (+ CORS proxy fallback)
- LinkedIn: **Remote · Easy Apply · Worldwide** one-click search (LinkedIn blocks in-page scrape)
- 40+ portal Boolean / Google X-ray
- TA Agent pipeline table (deduped curated + Tailor)
- Country resumes (IN / US / UK / DE / SG / UAE) + layouts
- My Profile: full career TerraPay → GenNex — Save once, Load on every apply
- PDF / HTML resume download

## First-time profile setup

1. Open **Country Resumes**
2. **↺ Restore full career (TerraPay→GenNex)** if needed
3. Add phone / email → **Save My Profile**
4. Use **Load into Country Resume form** or **Tailor** when applying

## GitHub Pages

Settings → Pages → Deploy from **main** / **root**.  
Site: `https://neerajkapil33.github.io/TA-Leadership-Global-Search/`

## License

Personal use — Neeraj Kapil.
