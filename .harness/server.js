import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORTS = process.env.PORT ? [Number(process.env.PORT)] : [8384, 8081];
const WEBHOOK_EVENTS = [];

// Safely get all Deno Edge Functions
function getEdgeFunctions() {
  try {
    const funcsDir = path.join(ROOT_DIR, 'base44', 'functions');
    if (!fs.existsSync(funcsDir)) return [];
    return fs.readdirSync(funcsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (e) {
    return [];
  }
}

// Categorize functions for American Living SK
function getCategorizedFunctions() {
  const all = getEdgeFunctions();
  const categories = {
    '3D Configurator & Models': [],
    'Quotes, Pricing & Catalog': [],
    'Customer Portal & Leads': [],
    'Integrations & Automation': []
  };

  all.forEach(fn => {
    const lower = fn.toLowerCase();
    if (lower.includes('3d') || lower.includes('model') || lower.includes('viewer') || lower.includes('barn')) {
      categories['3D Configurator & Models'].push(fn);
    } else if (lower.includes('quote') || lower.includes('price') || lower.includes('house') || lower.includes('catalog')) {
      categories['Quotes, Pricing & Catalog'].push(fn);
    } else if (lower.includes('lead') || lower.includes('client') || lower.includes('user') || lower.includes('contact') || lower.includes('auth')) {
      categories['Customer Portal & Leads'].push(fn);
    } else {
      categories['Integrations & Automation'].push(fn);
    }
  });

  return categories;
}

// Get recent git commits
function getRecentCommits(count = 10) {
  try {
    const raw = execSync(`git log -n ${count} --pretty=format:"%h|%an|%ae|%s|%cd" --date=relative`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8'
    });
    return raw.split('\n').filter(Boolean).map(line => {
      const [hash, author, email, message, date] = line.split('|');
      const isBase44 = message.toLowerCase().includes('base44') || author.toLowerCase().includes('base44');
      return { hash, author, email, message, date, isBase44 };
    });
  } catch (e) {
    return [];
  }
}

// Read harness pipeline yaml
function getHarnessConfig() {
  try {
    const filePath = path.join(ROOT_DIR, '.harness', 'pipeline.yaml');
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {}
  return 'pipeline: null';
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>American Living SK - Harness & Process Visualizer</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --bg-dark: #070a12;
      --card-bg: rgba(15, 23, 42, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-blue: #0088ff;
      --accent-cyan: #00f2fe;
      --accent-purple: #8b5cf6;
      --accent-pink: #ec4899;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --warning: #f59e0b;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    body {
      background: var(--bg-dark);
      background-image: 
        radial-gradient(at 0% 0%, rgba(0, 136, 255, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      color: white;
      box-shadow: 0 4px 25px rgba(0, 136, 255, 0.4);
    }

    .brand-title h1 {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(to right, #ffffff, var(--accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-title p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
      padding: 0.6rem 1.2rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .pulse {
      width: 8px;
      height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 1.6s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .card h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .commit-item {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .commit-hash {
      font-family: monospace;
      color: var(--accent-cyan);
      font-size: 0.8rem;
    }
    .commit-msg {
      font-size: 0.9rem;
      margin: 0.25rem 0;
    }
    .commit-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon"><i class="fa-solid fa-house-chimney"></i></div>
      <div class="brand-title">
        <h1>American Living SK — Harness Visualizer</h1>
        <p>3D Konfigurátor, Zákaznícky portál & Base44 Edge Engine</p>
      </div>
    </div>
    <div>
      <div class="status-badge">
        <span class="pulse"></span> Harness & MEA Loop Active
      </div>
    </div>
  </header>

  <main>
    <div class="grid">
      <div class="card">
        <h2><i class="fa-solid fa-code-branch text-blue-400"></i> Posledné Commity & Sync</h2>
        <div id="commits-list">__COMMITS_PLACEHOLDER__</div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-cubes text-purple-400"></i> Funkcie & Služby</h2>
        <div id="functions-list">__FUNCTIONS_PLACEHOLDER__</div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-shield-halved text-emerald-400"></i> LongHorizon MEA Protokol</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
          • <strong>Manažér:</strong> Izolácia a plánovanie úloh.<br>
          • <strong>Vykonávateľ:</strong> Fresh-context subagenti bez Context Rotu.<br>
          • <strong>Audítor:</strong> Nezávislé Playwright / HTTP overenie pred odovzdaním.<br>
          • <strong>Commit Disciplína:</strong> Single push na konci úlohy.
        </p>
      </div>
    </div>
  </main>
</body>
</html>`;

function renderDashboard() {
  const commits = getRecentCommits(8);
  const commitsHtml = commits.map(c => `
    <div class="commit-item">
      <span class="commit-hash">${c.hash}</span>
      <div class="commit-msg">${c.message}</div>
      <div class="commit-meta">${c.author} • ${c.date}</div>
    </div>
  `).join('') || '<p style="color: var(--text-muted)">Žiadne commity.</p>';

  const cats = getCategorizedFunctions();
  const funcsHtml = Object.entries(cats).map(([cat, fns]) => `
    <div style="margin-bottom: 0.75rem;">
      <strong style="font-size: 0.85rem; color: var(--accent-cyan);">${cat} (${fns.length})</strong>
      <div style="font-size: 0.8rem; color: var(--text-muted);">${fns.slice(0, 5).join(', ') || 'Žiadne dedikované funkcie'}</div>
    </div>
  `).join('');

  return HTML_TEMPLATE
    .replace('__COMMITS_PLACEHOLDER__', commitsHtml)
    .replace('__FUNCTIONS_PLACEHOLDER__', funcsHtml);
}

function startServer(portIndex = 0) {
  if (portIndex >= PORTS.length) {
    console.error('[Harness] Všetky porty sú obsadené.');
    return;
  }

  const port = PORTS[portIndex];
  const server = http.createServer((req, res) => {
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'active', time: new Date().toISOString() }));
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboard());
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Harness] Port ${port} je obsadený, skúšam ďalší...`);
      startServer(portIndex + 1);
    } else {
      console.error('[Harness] Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`[Harness] American Living SK Dashboard beží na http://localhost:${port}`);
  });
}

startServer();
