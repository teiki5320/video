/* ================================================================
   AfriComics – bd_script.js
   Génération de BD africaines avec Claude API + Pollinations.ai
   ================================================================ */

'use strict';

// ── État global ──────────────────────────────────────────────────
const APP = {
  apiKey: '',
  model:  'claude-sonnet-4-6',
  story:  null,
  currentPage: 0,
  totalImages: 0,
  loadedImages: 0,
};

// Layouts par page (10 pages): correspond aux panel counts 4,5,6,4,5,6,4,5,6,4
const PAGE_LAYOUTS = [
  'layout-4b',   // Page 1  – 4 cases – establishing shot large
  'layout-5b',   // Page 2  – 5 cases – action, grand panel gauche
  'layout-6a',   // Page 3  – 6 cases – séquence rapide 3×2
  'layout-4a',   // Page 4  – 4 cases – moments intimes 2×2
  'layout-5a',   // Page 5  – 5 cases – tension montante
  'layout-6b',   // Page 6  – 6 cases – confrontation
  'layout-4b',   // Page 7  – 4 cases – révélation setup
  'layout-5b',   // Page 8  – 5 cases – TWIST MAJEUR
  'layout-6a',   // Page 9  – 6 cases – climax
  'layout-4b',   // Page 10 – 4 cases – CLIFFHANGER FINAL
];

const PANEL_COUNTS = [4, 5, 6, 4, 5, 6, 4, 5, 6, 4];

// Style prefix pour Pollinations
const IMG_STYLE =
  'vibrant african comic book panel, bold black ink outlines, dramatic lighting, ' +
  'rich saturated colors, sub-saharan africa setting, cinematic composition, ';

// ── Utilitaires ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function showSection(name) {
  ['intro-section', 'generating-section', 'comic-section'].forEach(id => {
    const el = $(id);
    if (el) el.classList.remove('active');
  });
  const target = $(name + '-section');
  if (target) target.classList.add('active');
}

function showError(msg) {
  const el = $('form-error');
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function setProgress(pct, activeStep, msg) {
  const fill = $('gen-fill');
  if (fill) fill.style.width = Math.min(pct, 100) + '%';

  const subtitle = $('gen-subtitle');
  if (subtitle) subtitle.textContent = msg;

  const stepOrder = ['story', 'panels', 'images', 'done'];
  const activeIdx = stepOrder.indexOf(activeStep);
  stepOrder.forEach((s, i) => {
    const el = $('step-' + s);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (i < activeIdx)  el.classList.add('done');
    if (i === activeIdx) el.classList.add('active');
  });
}

function logGen(msg) {
  const log = $('gen-log');
  if (!log) return;
  const item = document.createElement('div');
  item.className = 'gen-log-item';
  item.textContent = msg;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

// ── Appel API Anthropic ──────────────────────────────────────────
async function callClaude(apiKey, model, prompt) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    const errMsg = errBody.error?.message || resp.statusText;
    if (resp.status === 401) throw new Error('Clé API invalide. Vérifiez votre clé Anthropic.');
    if (resp.status === 429) throw new Error('Limite de taux atteinte. Réessayez dans quelques secondes.');
    throw new Error(`Erreur API ${resp.status}: ${errMsg}`);
  }

  const data = await resp.json();
  return data.content[0].text;
}

// ── Construction du prompt ───────────────────────────────────────
function buildPrompt({ title, hero, setting, era, genre, theme }) {
  const titlePart = title
    ? `TITRE: "${title}"`
    : 'TITRE: Génère un titre percutant et mémorable (max 5 mots)';

  const heroPart = hero
    ? `PROTAGONISTE: ${hero}`
    : 'PROTAGONISTE: Crée un personnage africain fort, complexe, mémorable avec un nom authentique';

  const themePart = theme
    ? `THÈME CENTRAL: ${theme}`
    : 'THÈME CENTRAL: survie, identité, pouvoir, secrets ancestraux';

  return `Tu es un maître scénariste de bande dessinée africaine, expert des histoires haletantes de l'Afrique subsaharienne.

COMMANDE: Crée une bande dessinée de 10 pages avec ces paramètres:
${titlePart}
${heroPart}
CADRE: ${setting}
ÉPOQUE: ${era}
GENRE: ${genre}
${themePart}

LOIS SCÉNARISTIQUES ABSOLUES (OBLIGATOIRES):
1. CHAQUE page se termine par un SUSPENSE INTENSE qui FORCE à tourner la page (cliffhanger)
2. Page 4: Premier retournement — les enjeux changent radicalement
3. Page 7: Révélation choc sur le passé du protagoniste
4. Page 8: RETOURNEMENT MAJEUR qui change TOUTE la perspective (l'allié est le traître / le héros a été manipulé dès le début / la vraie menace est ailleurs...)
5. Page 10: Cliffhanger BRUTAL, inattendu, qui donne IMPÉRATIVEMENT envie d'un tome 2
6. Dialogues courts, percutants, authentiquement africains
7. Intègre des mots/expressions en langues africaines (swahili, lingala, wolof, yoruba, amharique...) avec leur sens entre parenthèses
8. Noms de lieux, personnages, références culturelles 100% authentiques

NOMBRE DE CASES PAR PAGE (RESPECTE EXACTEMENT): 4,5,6,4,5,6,4,5,6,4

Pour les descriptions d'images (en ANGLAIS uniquement), décris précisément:
- L'angle de vue (extreme close-up / medium shot / wide shot / bird's eye view...)
- L'action principale visible
- Les expressions émotionnelles des personnages
- L'ambiance lumineuse (golden hour / harsh noon / dark night / torchlight...)
- Les détails culturels africains visibles (vêtements, architecture, végétation...)

RETOURNE UNIQUEMENT du JSON valide, sans markdown, sans texte avant/après:
{
  "titre": "string",
  "accroche": "string (1 phrase haletante max 15 mots, donne envie de lire)",
  "pages": [
    {
      "numero": 1,
      "suspense": "string (cliffhanger de fin de page, 1 phrase max 20 mots, en français)",
      "cases": [
        {
          "numero": 1,
          "narration": "string ou null (texte hors-champ, max 20 mots)",
          "dialogues": ["NOM: réplique courte et percutante"],
          "son": "string ou null (onomatopée impactante: BANG!, CRACK!, TCHAK!, BOUM!...)",
          "image": "string EN ANGLAIS (description visuelle détaillée pour IA, 80-120 mots)"
        }
      ]
    }
  ]
}`;
}

// ── Extraction JSON robuste ──────────────────────────────────────
function parseStoryJSON(rawText) {
  // Chercher du JSON dans la réponse
  const patterns = [
    /\{[\s\S]*\}/,   // JSON brut
    /```json\n([\s\S]*?)\n```/, // Code block json
    /```\n([\s\S]*?)\n```/,    // Code block sans lang
  ];

  let jsonStr = null;
  for (const pat of patterns) {
    const m = rawText.match(pat);
    if (m) {
      jsonStr = m[1] || m[0];
      break;
    }
  }

  if (!jsonStr) throw new Error('Impossible d\'extraire le JSON de la réponse Claude.');

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Tentative de nettoyage : retirer les virgules trailing
    const cleaned = jsonStr
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    return JSON.parse(cleaned);
  }
}

// ── Génération de toutes les images ─────────────────────────────
async function generateAllImages(story) {
  const panels = [];
  story.pages.forEach((page, pi) => {
    page.cases.forEach((c, ci) => {
      panels.push({ pi, ci, prompt: c.image || '' });
    });
  });

  APP.totalImages = panels.length;
  APP.loadedImages = 0;

  // Traitement en batchs de 5
  const BATCH = 5;
  for (let i = 0; i < panels.length; i += BATCH) {
    const batch = panels.slice(i, i + BATCH);
    await Promise.allSettled(batch.map(p => loadPanelImage(p.pi, p.ci, p.prompt)));

    const pct = 45 + Math.round((APP.loadedImages / APP.totalImages) * 50);
    setProgress(pct, 'images', `Illustrations: ${APP.loadedImages}/${APP.totalImages}…`);
    logGen(`  ✓ ${APP.loadedImages}/${APP.totalImages} images`);
  }
}

async function loadPanelImage(pi, ci, prompt) {
  const selector = `#page-${pi + 1} .panel:nth-child(${ci + 1})`;
  const panelEl = document.querySelector(selector);
  if (!panelEl) { APP.loadedImages++; return; }

  const fullPrompt = IMG_STYLE + (prompt || 'african village scene, dramatic lighting');
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=384&nologo=true&model=flux&seed=${seed}`;

  return new Promise(resolve => {
    const img = panelEl.querySelector('.panel-img');
    const placeholder = panelEl.querySelector('.panel-placeholder');

    const onDone = () => { APP.loadedImages++; resolve(); };

    // Timeout 40s
    const timer = setTimeout(() => { onDone(); }, 40000);

    const image = new Image();
    image.onload = () => {
      clearTimeout(timer);
      if (img) {
        img.src = image.src;
        img.style.opacity = '1';
      }
      if (placeholder) placeholder.classList.add('hidden');
      onDone();
    };
    image.onerror = () => {
      clearTimeout(timer);
      // Garder le placeholder en cas d'erreur
      onDone();
    };
    image.src = url;
  });
}

// ── Rendu Comic ─────────────────────────────────────────────────
function renderComic(story) {
  const viewer = $('comic-viewer');
  viewer.innerHTML = '';

  // S'assurer qu'on a bien 10 pages (rembourrage si nécessaire)
  const pages = story.pages.slice(0, 10);

  pages.forEach((page, index) => {
    const pageEl = createPageElement(page, index);
    viewer.appendChild(pageEl);
  });

  // Dots de navigation
  const dotsWrap = $('page-dots');
  dotsWrap.innerHTML = '';
  pages.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'page-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('data-page', i);
    dot.setAttribute('aria-label', `Page ${i + 1}`);
    dot.addEventListener('click', () => goToPage(i));
    dotsWrap.appendChild(dot);
  });

  APP.currentPage = 0;
  showPage(0);
}

function createPageElement(page, index) {
  const layout = PAGE_LAYOUTS[index] || 'layout-4a';
  const panelCount = PANEL_COUNTS[index] || 4;
  const cases = (page.cases || []).slice(0, panelCount);

  const div = document.createElement('div');
  div.id = `page-${index + 1}`;
  div.className = 'comic-page';

  // En-tête de page
  const header = document.createElement('div');
  header.className = 'page-header-strip';
  header.innerHTML = `
    <span class="page-num-label">PAGE ${page.numero || index + 1}</span>
    <span class="page-logo">AFRICcomics</span>
  `;
  div.appendChild(header);

  // Grille de cases
  const grid = document.createElement('div');
  grid.className = `panels-grid ${layout}`;
  cases.forEach((c, ci) => {
    grid.innerHTML += createPanelHTML(c, ci, index);
  });
  div.appendChild(grid);

  // Footer suspense
  const footer = document.createElement('div');
  footer.className = 'page-suspense';
  const isLast = index === 9;
  footer.innerHTML = `
    <span class="suspense-icon">${isLast ? '💀' : '⚡'}</span>
    <span class="suspense-text">${page.suspense || ''}</span>
    <span class="page-continuation">${isLast ? 'FIN ?' : 'À suivre…'}</span>
  `;
  div.appendChild(footer);

  return div;
}

// Couleurs de fond pour les placeholders (par index)
const PANEL_BG_COLORS = [
  '#1a2a1a', '#1a1a2a', '#2a1a1a',
  '#1a2a2a', '#2a2a1a', '#2a1a2a',
];

function createPanelHTML(c, ci, pi) {
  const bg = PANEL_BG_COLORS[ci % PANEL_BG_COLORS.length];

  // Dialogues
  const dialoguesHTML = (c.dialogues || []).map(d => {
    const colonIdx = d.indexOf(':');
    const text = colonIdx > -1 ? d.substring(colonIdx + 1).trim() : d.trim();
    if (!text) return '';
    // Tronquer si trop long
    const display = text.length > 80 ? text.substring(0, 80) + '…' : text;
    return `<div class="speech-bubble">${escapeHTML(display)}</div>`;
  }).join('');

  // Narration
  const narrationHTML = c.narration
    ? `<div class="caption-box">${escapeHTML(c.narration)}</div>`
    : '';

  // Son
  const soundHTML = c.son
    ? `<div class="sound-fx">${escapeHTML(c.son)}</div>`
    : '';

  return `
    <div class="panel" style="--panel-bg: ${bg}">
      <div class="panel-image-wrap">
        <img class="panel-img" src="" alt="case ${ci + 1}" />
        <div class="panel-placeholder"></div>
      </div>
      <div class="panel-overlay">
        ${narrationHTML}
        <div class="panel-dialogues">${dialoguesHTML}</div>
        ${soundHTML}
      </div>
    </div>
  `;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Navigation ───────────────────────────────────────────────────
function showPage(index) {
  const pages = document.querySelectorAll('.comic-page');
  const dots  = document.querySelectorAll('.page-dot');

  pages.forEach((p, i) => p.classList.toggle('active', i === index));
  dots.forEach((d, i)  => d.classList.toggle('active', i === index));

  const total = pages.length;
  $('page-indicator').textContent = `${index + 1} / ${total}`;
  $('prev-btn').disabled = index === 0;
  $('next-btn').disabled = index === total - 1;

  APP.currentPage = index;

  // Scroll vers le viewer
  const viewer = $('comic-viewer');
  if (viewer) viewer.scrollTop = 0;
}

function goToPage(index) {
  const total = document.querySelectorAll('.comic-page').length;
  if (index < 0 || index >= total) return;
  showPage(index);
}

// ── Orchestration principale ─────────────────────────────────────
async function generateBD() {
  const apiKey  = $('api-key').value.trim();
  const title   = $('story-title').value.trim();
  const hero    = $('story-hero').value.trim();
  const setting = $('story-setting').value;
  const era     = $('story-era').value;
  const genre   = $('story-genre').value;
  const theme   = $('story-theme').value.trim();

  if (!apiKey) {
    showError('Veuillez entrer votre clé API Anthropic (sk-ant-…)');
    return;
  }
  if (!apiKey.startsWith('sk-')) {
    showError('Format de clé invalide. La clé doit commencer par "sk-"');
    return;
  }

  APP.apiKey = apiKey;
  APP.model  = document.querySelector('.model-btn.active')?.dataset.model || 'claude-sonnet-4-6';

  // Passer en mode génération
  showSection('generating');
  $('gen-log').innerHTML = '';
  setProgress(0, 'story', 'Connexion à Claude…');

  try {
    // ── Étape 1: Générer l'histoire ──────────────────────────────
    logGen('🎭 Connexion à Claude API…');
    setProgress(5, 'story', 'Claude compose votre histoire africaine…');

    const prompt = buildPrompt({ title, hero, setting, era, genre, theme });
    const rawText = await callClaude(apiKey, APP.model, prompt);
    logGen('✓ Réponse reçue de Claude');

    setProgress(20, 'story', 'Analyse de l\'histoire…');
    const story = parseStoryJSON(rawText);
    APP.story = story;

    logGen(`✓ Histoire: "${story.titre}" (${story.pages?.length || 0} pages)`);
    logGen(`  Accroche: ${story.accroche}`);

    if (!story.pages || story.pages.length < 5) {
      throw new Error('Histoire incomplète (moins de 5 pages). Réessayez.');
    }

    // ── Étape 2: Construire la structure ─────────────────────────
    setProgress(30, 'panels', 'Construction de la BD…');
    logGen('🎨 Construction des cases…');

    // Afficher le titre
    $('comic-title').textContent = story.titre || 'BD Africaine';
    $('comic-accroche').textContent = story.accroche || '';

    // Rendre le comic (structure HTML sans images)
    renderComic(story);

    // Compter les images à générer
    const totalPanels = story.pages.reduce((s, p) => s + (p.cases?.length || 0), 0);
    logGen(`  → ${totalPanels} cases à illustrer`);

    // ── Étape 3: Générer les images ───────────────────────────────
    setProgress(45, 'images', `Génération des illustrations (0/${totalPanels})…`);
    logGen('🖼️  Génération des illustrations (Pollinations FLUX)…');

    await generateAllImages(story);
    logGen(`✓ ${APP.loadedImages} illustrations chargées`);

    // ── Étape 4: Finalisation ─────────────────────────────────────
    setProgress(100, 'done', 'Votre BD est prête !');
    logGen('🎉 BD prête ! Bonne lecture !');

    await sleep(900);
    showSection('comic');

  } catch (err) {
    console.error('[AfriComics]', err);
    setProgress(0, 'story', '❌ Erreur : ' + err.message);
    logGen('❌ ERREUR: ' + err.message);
    await sleep(3500);
    showSection('intro');
  }
}

// ── Initialisation ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Bouton générer
  $('generate-btn').addEventListener('click', generateBD);

  // Appui sur Entrée dans les champs
  ['api-key', 'story-title', 'story-hero', 'story-theme'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') generateBD(); });
  });

  // Sélecteur de modèle
  document.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP.model = btn.dataset.model;
    });
  });

  // Navigation comic
  $('prev-btn').addEventListener('click', () => goToPage(APP.currentPage - 1));
  $('next-btn').addEventListener('click', () => goToPage(APP.currentPage + 1));
  $('back-btn').addEventListener('click', () => showSection('intro'));

  // Navigation clavier
  document.addEventListener('keydown', e => {
    if (!$('comic-section').classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToPage(APP.currentPage + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPage(APP.currentPage - 1);
    }
  });

  // Swipe tactile (mobile)
  let touchStartX = 0;
  const viewer = $('comic-viewer');
  if (viewer) {
    viewer.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    viewer.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) goToPage(APP.currentPage + 1);
        else        goToPage(APP.currentPage - 1);
      }
    }, { passive: true });
  }
});
