/* ============================================================
   TA Job Search Hub – App Logic
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ---------- Navigation ----------
function showSection(id) {
  $$('.section').forEach(s => s.classList.remove('active'));
  const target = $(`#section-${id}`);
  if (target) target.classList.add('active');

  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = $(`.nav-item[data-section="${id}"]`);
  if (nav) nav.classList.add('active');

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('.nav-item, [data-section]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const section = el.dataset.section;
    if (section) showSection(section);
  });
});

// ---------- Toast ----------
function toast(msg, duration = 2800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ---------- Sample Sources (from original project spirit) ----------
const SOURCES = [
  { name: 'Remotive', region: 'Remote / Global', type: 'Live API' },
  { name: 'Arbeitnow', region: 'Europe / Global', type: 'Live API' },
  { name: 'Jobicy', region: 'Remote / Global', type: 'Live API' },
  { name: 'The Muse', region: 'Global', type: 'Live API' },
  { name: 'LinkedIn Jobs', region: 'Global', type: 'Global board' },
  { name: 'Indeed', region: 'Global', type: 'Global board' },
  { name: 'Glassdoor', region: 'Global', type: 'Global board' },
  { name: 'Jooble', region: 'Global Aggregator', type: 'Global board' },
  { name: 'Careerjet', region: 'Global Aggregator', type: 'Global board' },
  { name: 'Adzuna', region: 'Global Aggregator', type: 'Global board' },
  { name: 'Naukri', region: 'India', type: 'Global board' },
  { name: 'Shine', region: 'India', type: 'Global board' },
  { name: 'iimjobs', region: 'India', type: 'Global board' },
  { name: 'Reed', region: 'UK', type: 'Global board' },
  { name: 'TotalJobs', region: 'UK', type: 'Global board' },
  { name: 'StepStone', region: 'Europe / Germany', type: 'Global board' },
  { name: 'Bayt', region: 'MENA', type: 'Global board' },
  { name: 'GulfTalent', region: 'MENA', type: 'Global board' },
  { name: 'Seek', region: 'AU / NZ', type: 'Global board' },
  { name: 'JobStreet', region: 'APAC', type: 'Global board' },
  { name: 'Dice', region: 'USA', type: 'Global board' },
  { name: 'Wellfound', region: 'USA / Startup', type: 'Global board' },
  { name: 'We Work Remotely', region: 'Remote', type: 'Global board' },
  { name: 'RemoteOK', region: 'Remote', type: 'Global board' },
  { name: 'USAJobs', region: 'USA', type: 'Global board' },
  { name: 'Xing', region: 'Germany / Europe', type: 'Global board' },
  { name: 'Jobs.ch', region: 'Switzerland', type: 'Global board' },
  { name: 'Pôle Emploi', region: 'France', type: 'Global board' },
];

function renderSources(filter = '', region = '') {
  const body = $('#sourcesBody');
  if (!body) return;
  const filtered = SOURCES.filter(s => {
    const matchText = !filter || s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.region.toLowerCase().includes(filter.toLowerCase());
    const matchRegion = !region || s.region.includes(region) ||
      (region === 'Global / Remote' && (s.region.includes('Global') || s.region.includes('Remote')));
    return matchText && matchRegion;
  });
  body.innerHTML = filtered.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.region}</td>
      <td><span class="tag">${s.type}</span></td>
      <td>
        <button class="btn-ghost" style="padding:4px 10px;font-size:12px" onclick="toast('Opening ${s.name}…')">Open</button>
        <button class="btn-ghost" style="padding:4px 10px;font-size:12px" onclick="toast('X-ray search ready for ${s.name}')">TA X-ray</button>
      </td>
    </tr>
  `).join('');
}

// ---------- Boolean / X-ray Generator ----------
function generateBoolean(query) {
  const baseTitles = '("Head of Talent Acquisition" OR "Director Talent Acquisition" OR "VP Talent Acquisition" OR "Vice President Talent Acquisition" OR "Global Head of TA" OR "Senior Manager Talent Acquisition" OR "TA Leadership")';
  const locations = '(Europe OR "Middle East" OR Singapore OR UAE OR Dubai OR London OR "United Kingdom" OR Germany OR Netherlands OR "Hong Kong" OR Remote OR Hybrid)';
  const seniority = '("full time" OR permanent) (hybrid OR remote OR onsite)';
  const recency = '(job OR jobs OR hiring OR "actively hiring")';
  const sites = '(site:linkedin.com/jobs OR site:indeed.com OR site:glassdoor.com OR site:naukri.com OR site:reed.co.uk OR site:bayt.com)';

  // Simple keyword extraction from natural language
  let loc = locations;
  if (/india|bangalore|bengaluru|hyderabad|pune|gurgaon|mumbai/i.test(query)) {
    loc = '(India OR Bangalore OR Bengaluru OR Hyderabad OR Pune OR Gurgaon OR Mumbai OR "National Capital Region")';
  }
  if (/remote only|fully remote/i.test(query)) {
    loc = '(remote OR "work from home" OR wfh)';
  }

  return `${baseTitles} ${loc} ${seniority} ${recency} ${sites}`;
}

function openGoogleXray(booleanStr) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(booleanStr)}&tbs=qdr:w`;
  window.open(url, '_blank');
}

// ---------- Event Bindings ----------
$('#btnSearchAI')?.addEventListener('click', () => {
  const q = $('#aiQuery').value.trim();
  if (!q) return toast('Please enter a search query');
  toast('AI searching 50,000+ sources…');
  setTimeout(() => {
    toast('Found 327 high-relevance TA leadership roles');
    // In a full version this would update the curated list
  }, 1200);
});

$('#btnSearchAIFull')?.addEventListener('click', () => {
  const q = $('#aiQueryFull').value.trim();
  if (!q) return toast('Please describe the roles you want');
  toast('Running AI search across global sources…');
});

$('#btnGenerateBoolean')?.addEventListener('click', () => {
  const q = $('#aiQueryFull').value.trim() || 'VP Director Talent Acquisition global remote';
  const bool = generateBoolean(q);
  $('#booleanText').value = bool;
  $('#booleanOutput').style.display = 'block';
  toast('Boolean / X-ray generated');
});

$('#btnOpenGoogle')?.addEventListener('click', () => {
  const q = $('#aiQueryFull').value.trim();
  const bool = generateBoolean(q || 'VP Director Talent Acquisition');
  openGoogleXray(bool);
});

$('#btnRunXray')?.addEventListener('click', () => {
  const bool = $('#booleanText').value;
  if (bool) openGoogleXray(bool);
});

$('#btnOptimizeCV')?.addEventListener('click', () => {
  toast('AI is analyzing your CV against this role…');
  setTimeout(() => toast('Suggestions ready – open CV Match for details'), 1500);
});

$('#btnAskAI')?.addEventListener('click', () => {
  toast('AI Assistant: How can I help with your TA search today?');
});

$('#btnAIAssistant')?.addEventListener('click', () => {
  toast('AI Assistant ready – ask about jobs, Boolean, or CV tips');
});

$('#btnAnalyzeJD')?.addEventListener('click', () => {
  const jd = $('#jdInput').value.trim();
  if (!jd) return toast('Paste a Job Description first');
  const result = $('#matchResult');
  result.style.display = 'block';
  result.innerHTML = `
    <div class="match-score-wrap" style="justify-content:center;margin:1rem 0">
      <div class="score-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" class="ring-bg"/>
          <circle cx="60" cy="60" r="52" class="ring-fill" style="stroke-dashoffset: calc(327 - (327 * 87 / 100))"/>
        </svg>
        <div class="score-text">
          <span class="score-num">87%</span>
          <span class="score-label">Great Match</span>
        </div>
      </div>
    </div>
    <p style="text-align:center;color:var(--text-muted)">Strong alignment with your 20+ years global TA leadership experience, TerraPay background, and AI-driven TA transformation focus.</p>
  `;
  toast('Match analysis complete');
});

// Popular search chips
$$('.chip').forEach(chip => {
  if (chip.classList.contains('more')) return;
  chip.addEventListener('click', () => {
    const text = chip.textContent.trim();
    if ($('#aiQuery')) $('#aiQuery').value = `Find ${text} roles globally, remote/hybrid, senior level, posted last 14 days`;
    if ($('#aiQueryFull')) $('#aiQueryFull').value = `Find ${text} roles globally, remote/hybrid, senior level, posted last 14 days`;
    toast(`Loaded: ${text}`);
  });
});

// Source chips toggle
$$('.source-chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

// Apply buttons on job cards
$$('.job-card .btn-primary').forEach(btn => {
  btn.addEventListener('click', () => {
    toast('Application started – profile auto-filled from My CV');
  });
});

$$('.job-card .btn-ghost').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim();
    if (label === 'View JD') toast('Opening job description…');
    if (label === 'CV Match') {
      showSection('cv-match');
      toast('CV Match analysis ready');
    }
  });
});

// Source filter
$('#sourceFilter')?.addEventListener('input', e => {
  renderSources(e.target.value, $('#regionFilter')?.value);
});
$('#regionFilter')?.addEventListener('change', e => {
  renderSources($('#sourceFilter')?.value, e.target.value);
});

// Keyboard shortcut ⌘K / Ctrl+K
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    $('#globalSearch')?.focus();
  }
});

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderSources();
  // Pre-fill some demo applications table if present
  const appsBody = $('#appsTableBody');
  if (appsBody) {
    appsBody.innerHTML = `
      <tr>
        <td><strong>Microsoft</strong></td>
        <td>Director – Talent Acquisition</td>
        <td><span class="status interview">Interview 2</span></td>
        <td>12 Aug 2026</td>
        <td>1 day ago</td>
        <td><button class="btn-ghost" style="padding:4px 10px">View</button></td>
      </tr>
      <tr>
        <td><strong>Amazon</strong></td>
        <td>Head of Talent Acquisition</td>
        <td><span class="status interview">Interview 1</span></td>
        <td>10 Aug 2026</td>
        <td>2 days ago</td>
        <td><button class="btn-ghost" style="padding:4px 10px">View</button></td>
      </tr>
      <tr>
        <td><strong>Google</strong></td>
        <td>VP Talent Acquisition</td>
        <td><span class="status screening">Screening</span></td>
        <td>08 Aug 2026</td>
        <td>3 days ago</td>
        <td><button class="btn-ghost" style="padding:4px 10px">View</button></td>
      </tr>
      <tr>
        <td><strong>Salesforce</strong></td>
        <td>Director TA</td>
        <td><span class="status applied">Applied</span></td>
        <td>05 Aug 2026</td>
        <td>5 days ago</td>
        <td><button class="btn-ghost" style="padding:4px 10px">View</button></td>
      </tr>
      <tr>
        <td><strong>Shopify</strong></td>
        <td>Global TA Lead</td>
        <td><span class="status applied">Applied</span></td>
        <td>04 Aug 2026</td>
        <td>6 days ago</td>
        <td><button class="btn-ghost" style="padding:4px 10px">View</button></td>
      </tr>
    `;
  }

  console.log('%cTA Command Center loaded', 'color:#7c3aed;font-weight:bold');
});
