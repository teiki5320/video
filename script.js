/* ============================================================
   VideoForge – script.js
   Traitement 100% navigateur : Canvas 2D + MediaRecorder API
   Aucune dépendance externe, fonctionne sur iOS et desktop.
   ============================================================ */

// ─── État global ────────────────────────────────────────────
const state = {
  mainVideoFile: null,
  stickerFile: null,
  outroFile: null,
  titleText: '',
  titleStyle: 'bold-white',
  titleDuration: 5,
  titlePosition: 'center',
  fontOverride: '',
  stickerPosition: 'top-right',
  stickerSize: 15,
  stickerOpacity: 90,
  // Slide
  slides: [],
  currentNews: [],
  slideDuration: 4,
  slideOutroTitle: '🔥 ABONNEZ-VOUS !',
  slideOutroSubtitle: "Pour plus d'actus sur l'Afrique",
  slideOutroCta: '',
  slideOutroBg: '#1a1a2e',
  slideOutroAccent: '#6c63ff',
  slideOutroFile: null,
  slideOutroFileType: null,
  hookBgFile: null,    hookBgImageEl: null,
  newsBgFile: null,    newsBgImageEl: null,
};

// ─── Refs DOM ───────────────────────────────────────────────
const $ = id => document.getElementById(id);

const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanes  = document.querySelectorAll('.tab-content');

const dropZone       = $('drop-zone');
const mainVideoInput = $('main-video-input');
const browseBtn      = $('browse-btn');
const previewSection = $('preview-section');
const sourcePreview  = $('source-preview');
const fileInfo       = $('file-info');
const processBtn     = $('process-btn');
const processLabel   = $('process-label');
const progressWrap   = $('progress-wrap');
const progressFill   = $('progress-fill');
const progressText   = $('progress-text');
const logBox         = $('log-box');
const resultSection  = $('result-section');
const resultVideo    = $('result-video');
const downloadBtn    = $('download-btn');

const styleBtns       = document.querySelectorAll('.style-btn');
const fontOverrideSel = $('font-override');

const stickerInput       = $('sticker-input');
const stickerBrowse      = $('sticker-browse');
const stickerDrop        = $('sticker-drop');
const stickerPreviewWrap = $('sticker-preview-wrap');
const stickerPreviewImg  = $('sticker-preview');
const stickerRemove      = $('sticker-remove');
const stickerPositionSel = $('sticker-position');
const stickerSizeIn      = $('sticker-size');
const stickerSizeDisplay = $('sticker-size-display');
const stickerOpacityIn   = $('sticker-opacity');
const stickerOpacityDisp = $('sticker-opacity-display');

const outroInput       = $('outro-input');
const outroBrowse      = $('outro-browse');
const outroDrop        = $('outro-drop');
const outroPreviewWrap = $('outro-preview-wrap');
const outroPreviewVid  = $('outro-preview');
const outroRemove      = $('outro-remove');

const slideOutroMediaInput  = $('slide-outro-media-input');
const slideOutroMediaBrowse = $('slide-outro-media-browse');
const slideOutroDrop        = $('slide-outro-drop');

const hookBgInput  = $('hook-bg-input');
const hookBgBrowse = $('hook-bg-browse');
const hookBgDrop   = $('hook-bg-drop');
const hookBgInner  = $('hook-bg-inner');

const newsBgInput  = $('news-bg-input');
const newsBgBrowse = $('news-bg-browse');
const newsBgDrop   = $('news-bg-drop');
const newsBgInner  = $('news-bg-inner');

const saveParamsBtn = $('save-params-btn');
const saveFeedback  = $('save-feedback');

const sumTitleVal    = $('sum-title-val');
const sumStyleVal    = $('sum-style-val');
const sumDurationVal = $('sum-duration-val');
const sumStickerVal  = $('sum-sticker-val');
const sumOutroVal    = $('sum-outro-val');

// ─── TABS ────────────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ─── MAIN VIDEO UPLOAD ───────────────────────────────────────
browseBtn.addEventListener('click', () => mainVideoInput.click());
dropZone.addEventListener('click', e => {
  if (e.target === dropZone || e.target.id === 'drop-inner') mainVideoInput.click();
});
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('video/')) setMainVideo(f);
});
mainVideoInput.addEventListener('change', () => {
  if (mainVideoInput.files[0]) setMainVideo(mainVideoInput.files[0]);
});

function setMainVideo(file) {
  state.mainVideoFile = file;
  sourcePreview.src = URL.createObjectURL(file);
  previewSection.hidden = false;
  fileInfo.textContent = `${file.name}  •  ${(file.size / 1024 / 1024).toFixed(2)} Mo`;
  updateProcessBtn();
}

// ─── STYLE PARAMS ────────────────────────────────────────────
styleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    styleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.titleStyle = btn.dataset.style;
    updateSummary();
    saveParams();
  });
});

fontOverrideSel.addEventListener('change', () => {
  state.fontOverride = fontOverrideSel.value;
  saveParams();
});

// ─── STICKER PARAMS ──────────────────────────────────────────
stickerBrowse.addEventListener('click', e => { e.stopPropagation(); stickerInput.click(); });
stickerDrop.addEventListener('click', () => stickerInput.click());
stickerInput.addEventListener('change', () => {
  if (stickerInput.files[0]) setSticker(stickerInput.files[0]);
});

function setSticker(file) {
  state.stickerFile = file;
  stickerPreviewImg.src = URL.createObjectURL(file);
  stickerPreviewWrap.hidden = false;
  stickerDrop.hidden = true;
  updateSummary(); updateProcessBtn();
}

stickerRemove.addEventListener('click', () => {
  state.stickerFile = null;
  stickerInput.value = '';
  stickerPreviewImg.src = '';
  stickerPreviewWrap.hidden = true;
  stickerDrop.hidden = false;
  updateSummary(); updateProcessBtn();
});

stickerPositionSel.addEventListener('change', () => { state.stickerPosition = stickerPositionSel.value; saveParams(); });
stickerSizeIn.addEventListener('input', () => {
  state.stickerSize = parseInt(stickerSizeIn.value);
  stickerSizeDisplay.textContent = state.stickerSize + '%';
  saveParams();
});
stickerOpacityIn.addEventListener('input', () => {
  state.stickerOpacity = parseInt(stickerOpacityIn.value);
  stickerOpacityDisp.textContent = state.stickerOpacity + '%';
  saveParams();
});

// ─── OUTRO PARAMS ────────────────────────────────────────────
outroBrowse.addEventListener('click', e => { e.stopPropagation(); outroInput.click(); });
outroDrop.addEventListener('click', () => outroInput.click());
outroInput.addEventListener('change', () => {
  if (outroInput.files[0]) setOutro(outroInput.files[0]);
});

function setOutro(file) {
  state.outroFile = file;
  outroPreviewVid.src = URL.createObjectURL(file);
  outroPreviewWrap.hidden = false;
  outroDrop.hidden = true;
  updateSummary(); updateProcessBtn();
}

outroRemove.addEventListener('click', () => {
  state.outroFile = null;
  outroInput.value = '';
  outroPreviewVid.src = '';
  outroPreviewWrap.hidden = true;
  outroDrop.hidden = false;
  updateSummary(); updateProcessBtn();
});

// ─── SLIDE BG IMAGES ─────────────────────────────────────────
function makeBgHandler(input, drop, inner, stateKey, resetLabel) {
  const browse = inner.querySelector('button');
  if (browse) browse.addEventListener('click', e => { e.stopPropagation(); input.click(); });
  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    if (input.files[0]) setBgFile(input, inner, stateKey, resetLabel);
  });
}

function setBgFile(input, inner, stateKey, resetLabel) {
  const file = input.files[0];
  state[stateKey] = file;

  // Pre-load Image element so mini-previews update immediately
  const imgEl = new Image();
  const imgKey = stateKey.replace('File', 'ImageEl'); // hookBgFile → hookBgImageEl
  imgEl.onload = () => {
    state[imgKey] = imgEl;
    refreshSlidePreviews(stateKey); // update existing mini-previews
  };
  imgEl.src = URL.createObjectURL(file);

  inner.innerHTML = `
    <span>🖼</span>
    <p style="word-break:break-all;font-size:0.78rem">${escHtml(file.name)}</p>
    <button class="link-btn" id="_chg">Changer</button>
    <button class="link-btn" style="color:rgba(255,130,130,0.9)" id="_clr">✕ Supprimer</button>
  `;
  inner.querySelector('#_chg').onclick = () => input.click();
  inner.querySelector('#_clr').onclick = () => {
    state[stateKey] = null; state[imgKey] = null;
    input.value = '';
    inner.innerHTML = `<span>📁</span><p>Image de fond</p>
      <button class="link-btn">Choisir</button>`;
    inner.querySelector('button').onclick = () => input.click();
    refreshSlidePreviews(stateKey);
  };
}

function refreshSlidePreviews(changedKey) {
  if (!state.slides.length) return;
  const type = changedKey === 'hookBgFile' ? 'hook' : 'news';
  const imgEl = changedKey === 'hookBgFile' ? state.hookBgImageEl : state.newsBgImageEl;
  document.querySelectorAll('.slide-card').forEach(card => {
    const idx = parseInt(card.dataset.idx);
    const slide = state.slides[idx];
    if (!slide || slide.type !== type) return;
    const preview = card.querySelector('.slide-mini-preview');
    if (imgEl) {
      slide.bgType = 'image'; slide.bgImageEl = imgEl;
      preview.style.background = `url("${imgEl.src}") center/cover`;
    } else {
      slide.bgType = 'gradient'; slide.bgImageEl = null;
      preview.style.background = ''; // will fall back to palette color
    }
  });
}

makeBgHandler(hookBgInput, hookBgDrop, hookBgInner, 'hookBgFile', 'Image de fond');
makeBgHandler(newsBgInput, newsBgDrop, newsBgInner, 'newsBgFile', 'Image de fond');

// ─── SAVE PARAMS ─────────────────────────────────────────────
function saveParams() {
  const toSave = {
    titleText: state.titleText, titleStyle: state.titleStyle,
    titleDuration: state.titleDuration, titlePosition: state.titlePosition,
    fontOverride: state.fontOverride,
    stickerPosition: state.stickerPosition, stickerSize: state.stickerSize,
    stickerOpacity: state.stickerOpacity,
    slideOutroBg: state.slideOutroBg, slideOutroAccent: state.slideOutroAccent,
  };
  localStorage.setItem('vf_params', JSON.stringify(toSave));
}

saveParamsBtn.addEventListener('click', () => {
  saveParams();
  saveFeedback.textContent = '✓ Sauvegardé !';
  setTimeout(() => { saveFeedback.textContent = ''; }, 2500);
});

function loadSavedParams() {
  const raw = localStorage.getItem('vf_params');
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    if (p.titleStyle)    { state.titleStyle = p.titleStyle; styleBtns.forEach(b => b.classList.toggle('active', b.dataset.style === p.titleStyle)); }
    if (p.fontOverride !== undefined) { state.fontOverride = p.fontOverride; fontOverrideSel.value = p.fontOverride; }
    if (p.stickerPosition){ state.stickerPosition = p.stickerPosition; stickerPositionSel.value = p.stickerPosition; }
    if (p.stickerSize)    { state.stickerSize = p.stickerSize; stickerSizeIn.value = p.stickerSize; stickerSizeDisplay.textContent = p.stickerSize + '%'; }
    if (p.stickerOpacity) { state.stickerOpacity = p.stickerOpacity; stickerOpacityIn.value = p.stickerOpacity; stickerOpacityDisp.textContent = p.stickerOpacity + '%'; }
    if (p.slideOutroBg     !== undefined) { state.slideOutroBg     = p.slideOutroBg; }
    if (p.slideOutroAccent !== undefined) { state.slideOutroAccent = p.slideOutroAccent; }
    updateSummary();
  } catch(e) {}
}
loadSavedParams();

// ─── SUMMARY & UTILS ─────────────────────────────────────────
function updateSummary() {
  sumTitleVal.textContent    = state.titleText || '—';
  sumStyleVal.textContent    = state.titleStyle;
  sumDurationVal.textContent = state.titleDuration + ' s';
  sumStickerVal.textContent  = state.stickerFile ? state.stickerFile.name : '—';
  sumOutroVal.textContent    = state.outroFile   ? state.outroFile.name   : '—';
}

function updateProcessBtn() {
  processBtn.disabled = !state.mainVideoFile;
}

// ─── PROCESSING (Canvas + MediaRecorder) ─────────────────────

processBtn.addEventListener('click', processVideo);

async function processVideo() {
  if (!state.mainVideoFile) return;

  processBtn.disabled = true;
  processLabel.textContent = '⏳ Traitement…';
  progressWrap.hidden = false;
  logBox.textContent = '';
  resultSection.hidden = true;
  progressFill.style.background = 'linear-gradient(90deg, var(--accent), var(--accent2))';

  try {
    setProgress(5, 'Chargement des polices…');
    await document.fonts.ready;
    log('Polices prêtes');

    // ── Création des éléments vidéo ───────────────────────────
    const mainVid = makeVideoEl();
    mainVid.src = URL.createObjectURL(state.mainVideoFile);
    await waitMeta(mainVid);

    const W = mainVid.videoWidth  || 1280;
    const H = mainVid.videoHeight || 720;
    log(`Vidéo principale : ${W}×${H}, durée ${mainVid.duration.toFixed(1)} s`);

    let outroVid = null;
    if (state.outroFile) {
      outroVid = makeVideoEl();
      outroVid.src = URL.createObjectURL(state.outroFile);
      await waitMeta(outroVid);
      log(`Outro : durée ${outroVid.duration.toFixed(1)} s`);
    }

    // ── Canvas ────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // ── Sticker ───────────────────────────────────────────────
    let stickerImg = null;
    if (state.stickerFile) {
      stickerImg = await loadImg(URL.createObjectURL(state.stickerFile));
      log('Sticker chargé');
    }

    // ── Audio via AudioContext ────────────────────────────────
    let audioTracks = [];
    let mainGain = null, outroGain = null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      await audioCtx.resume();

      const dest  = audioCtx.createMediaStreamDestination();
      mainGain    = audioCtx.createGain();
      const mSrc  = audioCtx.createMediaElementSource(mainVid);
      mSrc.connect(mainGain);
      mainGain.connect(dest);

      if (outroVid) {
        outroGain = audioCtx.createGain();
        outroGain.gain.value = 0; // silencieux au départ
        const oSrc = audioCtx.createMediaElementSource(outroVid);
        oSrc.connect(outroGain);
        outroGain.connect(dest);
      }

      audioTracks = dest.stream.getAudioTracks();
      log('Audio : OK');
    } catch (e) {
      log('Audio non capturé : ' + e.message);
    }

    // ── MediaRecorder ─────────────────────────────────────────
    const mimeType = pickMime();
    log('Format de sortie : ' + (mimeType || 'webm (défaut)'));

    const canvasStream = canvas.captureStream(30);
    const stream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    const recOpts = { videoBitsPerSecond: 6_000_000 };
    if (mimeType) recOpts.mimeType = mimeType;
    const recorder = new MediaRecorder(stream, recOpts);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    // ── Boucle de rendu ───────────────────────────────────────
    let animId   = null;
    let activeVid = null;

    function drawFrame() {
      if (activeVid && activeVid.readyState >= 2) {
        ctx.drawImage(activeVid, 0, 0, W, H);
        if (stickerImg) drawSticker(ctx, stickerImg, W, H);
        const isMain = activeVid === mainVid;
        if (isMain && state.titleText && activeVid.currentTime <= state.titleDuration) {
          drawTitle(ctx, state.titleText, state.titleStyle, state.titlePosition, W, H);
        }
      }
      animId = requestAnimationFrame(drawFrame);
    }
    const stopDraw = () => { cancelAnimationFrame(animId); animId = null; };

    // ── Démarrage ─────────────────────────────────────────────
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    recorder.start(200);
    setProgress(10, 'Lecture de la vidéo principale…');

    // Lecture vidéo principale
    activeVid = mainVid;
    drawFrame();

    mainVid.ontimeupdate = () => {
      const pct = 10 + (mainVid.currentTime / mainVid.duration) * (outroVid ? 55 : 80);
      setProgress(Math.round(pct), `Principale : ${fmt(mainVid.currentTime)} / ${fmt(mainVid.duration)}`);
    };

    await mainVid.play();
    await waitEnd(mainVid);
    stopDraw();
    log('Vidéo principale terminée.');

    // ── Outro ─────────────────────────────────────────────────
    if (outroVid) {
      setProgress(65, 'Ajout de l\'outro…');
      if (mainGain)  mainGain.gain.value  = 0;
      if (outroGain) outroGain.gain.value = 1;

      activeVid = outroVid;
      drawFrame();

      outroVid.ontimeupdate = () => {
        const pct = 65 + (outroVid.currentTime / outroVid.duration) * 25;
        setProgress(Math.round(pct), `Outro : ${fmt(outroVid.currentTime)} / ${fmt(outroVid.duration)}`);
      };

      await outroVid.play();
      await waitEnd(outroVid);
      stopDraw();
      log('Outro terminée.');
    }

    // ── Finalisation ──────────────────────────────────────────
    setProgress(93, 'Finalisation…');
    recorder.stop();
    await waitStop(recorder);

    const ext  = (mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
    log(`Fichier final : ${(blob.size / 1024 / 1024).toFixed(2)} Mo (.${ext})`);

    const url = URL.createObjectURL(blob);
    resultVideo.src = url;
    downloadBtn.href = url;
    downloadBtn.download = 'video_finale.' + ext;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth' });

    setProgress(100, '✓ Terminé !');
    progressFill.style.background = '#2dce6a';

  } catch (err) {
    console.error(err);
    setProgress(0, '❌ Erreur : ' + err.message);
    log('ERREUR : ' + err.message);
  } finally {
    processBtn.disabled = false;
    processLabel.textContent = '⚡ Générer la vidéo';
  }
}

// ─── Rendu canvas ─────────────────────────────────────────────

const TITLE_STYLES = {
  'bold-white': { color: '#ffffff', shadow: 'rgba(0,0,0,0.9)', bg: 'rgba(0,0,0,0.55)',    font: '700',    family: '"Oswald", Impact, sans-serif',            glow: false },
  'neon-green': { color: '#39ff14', shadow: '#39ff14',          bg: 'rgba(0,0,0,0.7)',    font: '700',    family: '"Bebas Neue", Impact, sans-serif',         glow: true  },
  'cinema':     { color: '#f5c518', shadow: '#000000',          bg: 'rgba(0,0,0,0.85)',   font: '700',    family: 'Georgia, serif',                         glow: false },
  'minimal':    { color: '#eeeeee', shadow: 'rgba(0,0,0,0.3)',  bg: 'rgba(51,51,51,0.4)', font: '300',    family: 'Arial, sans-serif',                      glow: false },
  'fire':       { color: '#ff4500', shadow: '#ff6600',          bg: 'rgba(0,0,0,0.8)',    font: '700',    family: '"Arial Black", sans-serif',              glow: true  },
  'ice':        { color: '#00cfff', shadow: '#00cfff',          bg: 'rgba(0,0,26,0.75)',  font: '700',    family: 'Arial, sans-serif',                      glow: true  },
  'retro':      { color: '#ff8c00', shadow: '#8b4500',          bg: 'rgba(26,13,0,0.85)', font: '700',    family: '"Oswald", Impact, sans-serif',            glow: false },
  'luxury':     { color: '#d4af37', shadow: '#7a5c00',          bg: 'rgba(8,8,8,0.92)',   font: '700',    family: '"Playfair Display", Georgia, serif',      glow: false },
  'sport':      { color: '#ffffff', shadow: '#990000',          bg: 'rgba(190,0,0,0.88)', font: '700',    family: '"Bebas Neue", Impact, sans-serif',        glow: false },
  'horror':     { color: '#cc0000', shadow: '#660000',          bg: 'rgba(5,0,0,0.92)',   font: '700',    family: '"Permanent Marker", cursive',             glow: true  },
  'pastel':     { color: '#ff9de2', shadow: '#8b3a7a',          bg: 'rgba(45,10,42,0.75)',font: '700',    family: '"Pacifico", cursive',                    glow: false },
  'matrix':     { color: '#00ff41', shadow: '#003b00',          bg: 'rgba(0,8,0,0.92)',   font: '600',    family: '"Courier Prime", Courier, monospace',     glow: true  },
  'sunset':     { color: '#ff6b35', shadow: '#c0392b',          bg: 'rgba(20,0,30,0.8)',  font: '800',    family: '"Exo 2", Arial, sans-serif',              glow: false },
  'writer':     { color: '#e8dcc8', shadow: '#5a4a3a',          bg: 'rgba(30,20,8,0.88)', font: 'normal', family: '"Courier Prime", Courier, monospace',     glow: false },
};

function drawTitle(ctx, text, style, position, W, H) {
  const s = TITLE_STYLES[style] || TITLE_STYLES['bold-white'];
  const family = state.fontOverride || s.family;
  const fontSize = Math.max(24, Math.round(W / 16));
  ctx.save();
  ctx.font = `${s.font} ${fontSize}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw  = ctx.measureText(text).width;
  const th  = fontSize * 1.4;
  const pad = Math.round(fontSize * 0.55);

  let cy;
  if (position === 'top')         cy = H * 0.10;
  else if (position === 'bottom') cy = H * 0.88;
  else                            cy = H / 2;

  // Background box
  ctx.fillStyle = s.bg;
  ctx.beginPath();
  roundRect(ctx, W / 2 - tw / 2 - pad, cy - th / 2 - pad / 2, tw + pad * 2, th + pad, 14);
  ctx.fill();

  // Glow or shadow
  ctx.shadowColor    = s.shadow;
  ctx.shadowBlur     = s.glow ? 22 : 5;
  ctx.shadowOffsetX  = s.glow ? 0  : 2;
  ctx.shadowOffsetY  = s.glow ? 0  : 2;

  ctx.fillStyle = s.color;
  ctx.fillText(text, W / 2, cy);
  ctx.restore();
}

function drawSticker(ctx, img, W, H) {
  const sw  = (state.stickerSize / 100) * W;
  const sh  = sw / (img.naturalWidth / img.naturalHeight);
  const pad = Math.round(W * 0.02);
  const pos = state.stickerPosition;
  const x = pos.includes('right')  ? W - sw - pad : pad;
  const y = pos.includes('bottom') ? H - sh - pad : pad;

  ctx.save();
  ctx.globalAlpha = state.stickerOpacity / 100;
  ctx.drawImage(img, x, y, sw, sh);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

// ─── Helpers ─────────────────────────────────────────────────

function makeVideoEl() {
  const v = document.createElement('video');
  v.playsInline = true;
  v.preload = 'auto';
  return v;
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function waitMeta(video) {
  return new Promise((res, rej) => {
    if (video.readyState >= 1) { res(); return; }
    video.onloadedmetadata = res;
    video.onerror = () => rej(new Error('Impossible de lire la vidéo'));
  });
}

function waitEnd(video) {
  return new Promise(res => { video.onended = res; });
}

function waitStop(recorder) {
  return new Promise(res => { recorder.onstop = res; });
}

function pickMime() {
  const list = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return list.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

function setProgress(pct, msg) {
  progressFill.style.width = Math.min(pct, 100) + '%';
  progressText.textContent = msg;
}

function log(msg) {
  logBox.textContent += msg + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── SLIDE TAB ────────────────────────────────────────────────

const fetchNewsBtn      = $('fetch-news-btn');
const fetchStatus       = $('fetch-status');
const slidesContainer   = $('slides-container');
const slidesFooter      = $('slides-footer');
const regenerateBtn     = $('regenerate-btn');
const copyScriptBtn     = $('copy-script-btn');
const slideGenSection   = $('slide-gen-section');
const slideDurationIn   = $('slide-duration');
const slideDurationDisp = $('slide-duration-display');
const genSlideVideoBtn  = $('gen-slide-video-btn');
const slideProgressWrap = $('slide-progress-wrap');
const slideProgressFill = $('slide-progress-fill');
const slideProgressText = $('slide-progress-text');
const slideResultSection= $('slide-result-section');
const slideResultVideo  = $('slide-result-video');
const slideDownloadBtn  = $('slide-download-btn');

const SLIDE_PALETTES = [
  { bg: 'linear-gradient(145deg,#1a0035,#3d0070)', accent: '#b97aff' },  // hook
  { bg: 'linear-gradient(145deg,#001a3d,#002f70)', accent: '#4d9fff' },  // actu 1
  { bg: 'linear-gradient(145deg,#00200a,#003814)', accent: '#4dff80' },  // actu 2
  { bg: 'linear-gradient(145deg,#1f0d00,#3d1a00)', accent: '#ff8533' },  // actu 3
  { bg: 'linear-gradient(145deg,#001f1a,#003830)', accent: '#33ffcc' },  // actu 4
  { bg: 'linear-gradient(145deg,#1f0007,#3d000e)', accent: '#ff4466' },  // actu 5
];

const HOOK_TEMPLATES = [
  n => ({ title: "🌍 L'AFRIQUE EN CE MOMENT",
          body: `${n[0].title}\n\nDécouvre les 5 actus qui font l'Afrique aujourd'hui. 👇` }),
  n => ({ title: "⚡ CE QUI SE PASSE EN AFRIQUE",
          body: `Tu savais ? ${n[0].title}\n\nSwipe pour tout savoir. 👉` }),
  n => ({ title: "🔥 AFRIQUE : L'ESSENTIEL",
          body: `${n[Math.floor(Math.random() * Math.min(3, n.length))].title}\n\nVoilà ce que tu dois savoir aujourd'hui. 👇` }),
  n => ({ title: "🌐 5 ACTUS À NE PAS MANQUER",
          body: `L'Afrique ne s'arrête pas. Voici ce qui se passe EN CE MOMENT. ⬇️` }),
  n => ({ title: "📢 CE QUE LES MÉDIAS CACHENT",
          body: `${n[0].title}\n\nL'Afrique mérite d'être entendue. Swipe. 👇` }),
  n => ({ title: "🗺 L'AFRIQUE CETTE SEMAINE",
          body: `De ${n[0].title.split(' ').slice(0,4).join(' ')}… à bien plus encore.\n\n5 actus en 60 secondes. ⬇️` }),
];

fetchNewsBtn.addEventListener('click', async () => {
  fetchNewsBtn.disabled = true;
  fetchStatus.hidden = false;
  fetchStatus.style.color = 'var(--text-muted)';
  fetchStatus.textContent = '⏳ Recherche des actualités en cours…';
  slidesContainer.hidden = true;
  slidesFooter.hidden = true;

  try {
    const news = await fetchAfriqueNews();
    state.currentNews = news;
    buildSlides(news);
    renderAllSlides();
    slidesContainer.hidden = false;
    slidesFooter.hidden = false;
    slideGenSection.hidden = false;
    fetchStatus.textContent = `✅ ${news.length} actualités trouvées — modifie les slides ci-dessous.`;
    fetchStatus.style.color = '#2dce6a';
  } catch(e) {
    fetchStatus.textContent = '❌ Impossible de charger les actualités. Vérifie ta connexion et réessaie.';
    fetchStatus.style.color = 'var(--accent2)';
  } finally {
    fetchNewsBtn.disabled = false;
  }
});

async function fetchAfriqueNews() {
  const rssUrl = 'https://www.rfi.fr/fr/afrique/rss';
  const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error('network');
  const data = await res.json();
  if (data.status !== 'ok' || !data.items?.length) throw new Error('rss');
  return data.items.slice(0, 5).map(item => ({
    title: (item.title || '').trim(),
    body: (item.description || item.content || '')
      .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160),
    date: item.pubDate
      ? new Date(item.pubDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '',
  }));
}

function buildSlides(news) {
  state.slides = [];
  const hookBg = state.hookBgImageEl
    ? { bgType: 'image', bgImageEl: state.hookBgImageEl }
    : { bgType: 'gradient', bgImageEl: null };
  const newsBg = state.newsBgImageEl
    ? { bgType: 'image', bgImageEl: state.newsBgImageEl }
    : { bgType: 'gradient', bgImageEl: null };

  // Slide 1 – Hook (no body — title fills the slide)
  state.slides.push({
    type: 'hook', paletteIdx: 0,
    title: "🌍 L'AFRIQUE EN CE MOMENT",
    body: '',
    bgColor: '#1a0035', ...hookBg,
  });

  // Slides 2-6 – Actualités
  news.forEach((item, i) => {
    state.slides.push({
      type: 'news', newsNum: i + 1, paletteIdx: i + 1,
      title: item.title, body: item.body, date: item.date,
      bgColor: '#001a3d', ...newsBg,
    });
  });

  // Slide 7 – Outro
  state.slides.push({
    type: 'outro',
    title: state.slideOutroTitle,
    body: state.slideOutroSubtitle,
    cta: state.slideOutroCta,
    bgType: 'gradient', bgColor: state.slideOutroBg, bgImageEl: null,
  });
}

function renderAllSlides() {
  slidesContainer.innerHTML = '';
  state.slides.forEach((slide, i) => slidesContainer.appendChild(createSlideCard(slide, i)));
}

function createSlideCard(slide, idx) {
  const isOutro = slide.type === 'outro';
  const palette = isOutro
    ? { bg: slide.bgType === 'color' ? slide.bgColor : state.slideOutroBg, accent: state.slideOutroAccent }
    : SLIDE_PALETTES[slide.paletteIdx] || SLIDE_PALETTES[0];
  const typeLabel = slide.type === 'hook' ? 'HOOK' : isOutro ? 'OUTRO' : `ACTU ${slide.newsNum}`;

  const previewBg = slide.bgType === 'color' ? slide.bgColor
    : slide.bgType === 'image' && slide.bgImageEl ? `url("${slide.bgImageEl.src}") center/cover`
    : palette.bg;

  const card = document.createElement('div');
  card.className = 'slide-card';
  card.dataset.idx = idx;

  const swatchColor = slide.bgColor || '#111122';

  card.innerHTML = `
    <div class="slide-mini-col">
      <div class="slide-mini-preview" style="background:${previewBg}">
        <div class="slide-mini-title">${escHtml(slide.title)}</div>
        ${isOutro && slide.cta ? `<div style="position:absolute;bottom:8px;font-size:0.55rem;font-weight:800;color:${palette.accent};text-align:center;width:100%;padding:0 4px">${escHtml(slide.cta)}</div>` : ''}
      </div>
      <div class="slide-bg-controls">
        <label class="slide-bg-ctrl" title="Couleur de fond">
          <span class="slide-bg-swatch" style="background:${swatchColor}"></span>
          <input type="color" class="slide-bg-color" value="${swatchColor}" hidden>
        </label>
        <label class="slide-bg-ctrl" title="Image de fond">
          🖼<input type="file" accept="image/*" class="slide-bg-img-input" hidden>
        </label>
        <button class="slide-bg-ctrl slide-bg-reset" title="Dégradé par défaut">↺</button>
      </div>
    </div>
    <div class="slide-edit-area">
      <div class="slide-edit-meta">
        <span class="slide-num">Slide ${idx + 1} / ${state.slides.length}</span>
        <span class="slide-type-tag">${typeLabel}</span>
        ${slide.date ? `<span class="slide-date">${escHtml(slide.date)}</span>` : ''}
        ${slide.type === 'hook' ? `<button class="hook-regen-btn">🔄 Nouveau hook</button>` : ''}
      </div>
      <label>Titre</label>
      <div class="slide-field slide-title-field" contenteditable="true" data-field="title" data-idx="${idx}">${escHtml(slide.title)}</div>
      <label>Contenu</label>
      <div class="slide-field slide-body-field" contenteditable="true" data-field="body" data-idx="${idx}">${escHtml(slide.body)}</div>
      ${isOutro ? `<label>Call-to-action</label>
      <div class="slide-field" contenteditable="true" data-field="cta" data-idx="${idx}">${escHtml(slide.cta || '')}</div>` : ''}
    </div>
  `;

  // ── contenteditable sync ──
  card.querySelectorAll('[contenteditable]').forEach(el => {
    el.addEventListener('input', () => {
      const field = el.dataset.field;
      state.slides[parseInt(el.dataset.idx)][field] = el.innerText;
      if (field === 'title') card.querySelector('.slide-mini-title').textContent = el.innerText;
      if (field === 'cta' && isOutro) {
        const ctaEl = card.querySelector('.slide-mini-preview div[style*="bottom"]');
        if (ctaEl) ctaEl.textContent = el.innerText;
      }
    });
  });

  // ── BG controls ──
  const preview  = card.querySelector('.slide-mini-preview');
  const colorIn  = card.querySelector('.slide-bg-color');
  const swatch   = card.querySelector('.slide-bg-swatch');
  const imgInput = card.querySelector('.slide-bg-img-input');

  colorIn.addEventListener('input', e => {
    slide.bgType    = 'color';
    slide.bgColor   = e.target.value;
    slide.bgImageEl = null;
    swatch.style.background   = e.target.value;
    preview.style.background  = e.target.value;
  });

  imgInput.addEventListener('change', () => {
    const f = imgInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        slide.bgType    = 'image';
        slide.bgImageEl = img;
        preview.style.background = `url("${ev.target.result}") center/cover`;
        swatch.style.background  = `url("${ev.target.result}") center/cover`;
        swatch.style.backgroundSize = 'cover';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  });

  card.querySelector('.slide-bg-reset').addEventListener('click', () => {
    slide.bgType    = 'gradient';
    slide.bgImageEl = null;
    const pal = isOutro ? { bg: state.slideOutroBg } : SLIDE_PALETTES[slide.paletteIdx] || SLIDE_PALETTES[0];
    preview.style.background = pal.bg;
    swatch.style.background  = pal.bg;
    colorIn.value = slide.bgColor || '#111122';
  });

  // ── Hook regen ──
  const regenBtn = card.querySelector('.hook-regen-btn');
  if (regenBtn) {
    let lastTplIdx = 0;
    regenBtn.addEventListener('click', () => {
      const n = state.currentNews;
      if (!n.length) return;
      let idx2;
      do { idx2 = Math.floor(Math.random() * HOOK_TEMPLATES.length); } while (idx2 === lastTplIdx && HOOK_TEMPLATES.length > 1);
      lastTplIdx = idx2;
      const { title, body } = HOOK_TEMPLATES[idx2](n);
      slide.title = title;
      slide.body  = body;
      card.querySelector('.slide-mini-title').textContent = title;
      card.querySelector('[data-field="title"]').innerText = title;
      card.querySelector('[data-field="body"]').innerText  = body;
    });
  }

  return card;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

copyScriptBtn.addEventListener('click', () => {
  const script = state.slides.map((s, i) => {
    let t = `=== SLIDE ${i + 1} — ${s.type.toUpperCase()} ===\n`;
    t += `TITRE   : ${s.title}\n`;
    t += `CONTENU : ${s.body}\n`;
    if (s.cta) t += `CTA     : ${s.cta}\n`;
    return t;
  }).join('\n');

  navigator.clipboard.writeText(script).then(() => {
    const orig = copyScriptBtn.textContent;
    copyScriptBtn.textContent = '✅ Copié !';
    setTimeout(() => { copyScriptBtn.textContent = orig; }, 2000);
  }).catch(() => {
    alert('Impossible d\'accéder au presse-papier. Copie manuelle nécessaire.');
  });
});

regenerateBtn.addEventListener('click', () => fetchNewsBtn.click());

// ─── SLIDE OUTRO FILE UPLOAD ──────────────────────────────────
slideOutroMediaBrowse.addEventListener('click', () => slideOutroMediaInput.click());
slideOutroDrop.addEventListener('click', () => slideOutroMediaInput.click());
slideOutroMediaBrowse.addEventListener('click', e => { e.stopPropagation(); slideOutroMediaInput.click(); });
slideOutroMediaInput.addEventListener('change', () => {
  if (slideOutroMediaInput.files[0]) setSlideOutroMedia(slideOutroMediaInput.files[0]);
});

function setSlideOutroMedia(file) {
  const isVideo = file.type.startsWith('video/');
  state.slideOutroFile     = file;
  state.slideOutroFileType = isVideo ? 'video' : 'image';
  const inner = slideOutroDrop.querySelector('.upload-mini-inner');
  inner.innerHTML = `
    <span>${isVideo ? '🎬' : '🖼'}</span>
    <p style="word-break:break-all;font-size:0.78rem">${escHtml(file.name)}</p>
    <button class="link-btn" id="_soChanger">Changer</button>
    <button class="link-btn" style="color:var(--accent2)" id="_soClear">✕ Supprimer</button>
  `;
  inner.querySelector('#_soChanger').onclick = () => slideOutroMediaInput.click();
  inner.querySelector('#_soClear').onclick = () => {
    state.slideOutroFile = null; state.slideOutroFileType = null;
    slideOutroMediaInput.value = '';
    inner.innerHTML = `<span>📁</span><p>Image ou vidéo de fond</p>
      <button class="link-btn" id="slide-outro-media-browse">Choisir</button>`;
    inner.querySelector('#slide-outro-media-browse').onclick = () => slideOutroMediaInput.click();
  };
}

// ─── SLIDE DURATION CONTROL ───────────────────────────────────
slideDurationIn.addEventListener('input', () => {
  state.slideDuration = parseFloat(slideDurationIn.value);
  slideDurationDisp.textContent = state.slideDuration + ' s';
});

// ─── GENERATE SLIDES VIDEO ────────────────────────────────────
genSlideVideoBtn.addEventListener('click', generateSlidesVideo);

// Canvas gradient colors per palette index (matching SLIDE_PALETTES)
const SLIDE_CANVAS_BG = [
  ['#1a0035', '#3d0070'],
  ['#001a3d', '#002f70'],
  ['#00200a', '#003814'],
  ['#1f0d00', '#3d1a00'],
  ['#001f1a', '#003830'],
  ['#1f0007', '#3d000e'],
];

async function generateSlidesVideo() {
  if (!state.slides.length) return;

  genSlideVideoBtn.disabled = true;
  slideProgressWrap.hidden  = false;
  slideResultSection.hidden = true;
  slideProgressFill.style.background = 'linear-gradient(90deg,#8b5cf6,#60c8ff)';

  const W = 720, H = 1280;

  try {
    setSlideProgress(3, 'Chargement des polices…');
    await document.fonts.ready;

    // Sticker
    let stickerImg = null;
    if (state.stickerFile) {
      stickerImg = await loadImg(URL.createObjectURL(state.stickerFile));
    }

    // Slide BG images (reload from file to get fresh blob URL for canvas)
    const hookBgImg = state.hookBgFile ? await loadImg(URL.createObjectURL(state.hookBgFile)) : null;
    const newsBgImg = state.newsBgFile ? await loadImg(URL.createObjectURL(state.newsBgFile)) : null;
    for (const slide of state.slides) {
      if (slide.type === 'hook' && hookBgImg)  { slide.bgType = 'image'; slide.bgImageEl = hookBgImg; }
      if (slide.type === 'news' && newsBgImg)  { slide.bgType = 'image'; slide.bgImageEl = newsBgImg; }
    }

    // Slide outro media
    let outroMediaEl = null;
    if (state.slideOutroFile) {
      if (state.slideOutroFileType === 'video') {
        outroMediaEl = makeVideoEl();
        outroMediaEl.src = URL.createObjectURL(state.slideOutroFile);
        await waitMeta(outroMediaEl);
      } else {
        outroMediaEl = await loadImg(URL.createObjectURL(state.slideOutroFile));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const mimeType = pickMime();
    const stream   = canvas.captureStream(30);
    const recOpts  = { videoBitsPerSecond: 5_000_000 };
    if (mimeType) recOpts.mimeType = mimeType;
    const recorder = new MediaRecorder(stream, recOpts);
    const chunks   = [];
    recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
    recorder.start(200);

    const total = state.slides.length;
    for (let i = 0; i < total; i++) {
      const slide   = state.slides[i];
      const isOutro = slide.type === 'outro';
      setSlideProgress(Math.round(5 + (i / total) * 88), `Slide ${i + 1} / ${total}…`);

      if (isOutro && outroMediaEl) {
        if (state.slideOutroFileType === 'video') {
          await renderVideoSlide(ctx, outroMediaEl, W, H, stickerImg, slide);
        } else {
          // image as background for outro slide
          const imgSlide = { ...slide, bgType: 'image', bgImageEl: outroMediaEl };
          await renderStaticSlide(ctx, imgSlide, W, H, stickerImg, state.slideDuration);
        }
      } else {
        await renderStaticSlide(ctx, slide, W, H, stickerImg, state.slideDuration);
      }
    }

    setSlideProgress(95, 'Finalisation…');
    recorder.stop();
    await waitStop(recorder);

    const ext  = (mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
    const url  = URL.createObjectURL(blob);
    slideResultVideo.src        = url;
    slideDownloadBtn.href       = url;
    slideDownloadBtn.download   = `slides.${ext}`;
    slideResultSection.hidden   = false;
    slideResultSection.scrollIntoView({ behavior: 'smooth' });
    setSlideProgress(100, '✓ Vidéo prête !');
    slideProgressFill.style.background = 'linear-gradient(90deg,#34d399,#6ee7b7)';

  } catch(err) {
    console.error(err);
    setSlideProgress(0, '❌ Erreur : ' + err.message);
  } finally {
    genSlideVideoBtn.disabled = false;
  }
}

function setSlideProgress(pct, msg) {
  slideProgressFill.style.width = Math.min(pct, 100) + '%';
  slideProgressText.textContent = msg;
}

function renderStaticSlide(ctx, slide, W, H, stickerImg, durationSec) {
  return new Promise(resolve => {
    const start  = performance.now();
    const durMs  = durationSec * 1000;
    let animId;
    function frame() {
      drawSlideCanvas(ctx, slide, W, H, stickerImg);
      if (performance.now() - start >= durMs) {
        cancelAnimationFrame(animId);
        resolve();
      } else {
        animId = requestAnimationFrame(frame);
      }
    }
    frame();
  });
}

function renderVideoSlide(ctx, videoEl, W, H, stickerImg, slide) {
  return new Promise(async resolve => {
    let animId;
    function frame() {
      if (videoEl.readyState >= 2) {
        ctx.drawImage(videoEl, 0, 0, W, H);
        if (stickerImg) drawSticker(ctx, stickerImg, W, H);
        drawSlideText(ctx, slide, W, H);
      }
      if (videoEl.ended || videoEl.paused) {
        cancelAnimationFrame(animId);
        resolve();
      } else {
        animId = requestAnimationFrame(frame);
      }
    }
    try { await videoEl.play(); } catch(_) {}
    frame();
    videoEl.onended = () => { cancelAnimationFrame(animId); resolve(); };
  });
}

function drawSlideCanvas(ctx, slide, W, H, stickerImg) {
  const isOutro = slide.type === 'outro';
  // Background
  if (slide.bgType === 'image' && slide.bgImageEl) {
    // cover fill
    const ar = slide.bgImageEl.naturalWidth / slide.bgImageEl.naturalHeight;
    let sw = W, sh = W / ar;
    if (sh < H) { sh = H; sw = H * ar; }
    ctx.drawImage(slide.bgImageEl, (W - sw) / 2, (H - sh) / 2, sw, sh);
  } else if (slide.bgType === 'color') {
    ctx.fillStyle = slide.bgColor;
    ctx.fillRect(0, 0, W, H);
  } else {
    const stops = isOutro
      ? [state.slideOutroBg, state.slideOutroBg]
      : SLIDE_CANVAS_BG[slide.paletteIdx] || SLIDE_CANVAS_BG[0];
    const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, stops[0]);
    grad.addColorStop(1, stops[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Semi-transparent dark overlay for readability
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 0, W, H);

  drawSlideText(ctx, slide, W, H);
  if (stickerImg) drawSticker(ctx, stickerImg, W, H);
}

function drawSlideText(ctx, slide, W, H) {
  const isOutro = slide.type === 'outro';
  const ts = TITLE_STYLES[state.titleStyle] || TITLE_STYLES['bold-white'];
  const fam = state.fontOverride || ts.family;

  const titleSize = Math.round(W * 0.072);
  const titleLineH = titleSize * 1.15;
  const bodySize   = Math.round(W * 0.040);
  const bodyLineH  = bodySize * 1.6;
  const gap        = H * 0.038;

  // Measure first (two-pass for vertical centering)
  ctx.font = `${ts.font} ${titleSize}px ${fam}`;
  const titleLines = wrapText(ctx, slide.title, W * 0.88);
  ctx.font = `400 ${bodySize}px ${fam}`;
  const rawBodyLines = slide.body
    ? wrapText(ctx, slide.body.replace(/\n/g, ' '), W * 0.84).slice(0, 4) : [];

  const titleBlock = titleLines.length * titleLineH;
  const bodyBlock  = rawBodyLines.length > 0 ? gap + rawBodyLines.length * bodyLineH : 0;
  const totalH = titleBlock + bodyBlock;

  // Vertically center, slightly above mid for visual balance
  let titleY = Math.max(H * 0.08, (H * 0.88 - totalH) / 2);

  // ── Title ──
  ctx.save();
  ctx.font = `${ts.font} ${titleSize}px ${fam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = ts.color;
  ctx.shadowColor = ts.shadow; ctx.shadowBlur = ts.glow ? 22 : 6;
  ctx.shadowOffsetX = ts.glow ? 0 : 2; ctx.shadowOffsetY = ts.glow ? 0 : 2;
  titleLines.forEach((line, i) => ctx.fillText(line, W / 2, titleY + i * titleLineH));
  const titleBottom = titleY + titleLines.length * titleLineH;
  ctx.restore();

  // ── Body ──
  if (rawBodyLines.length > 0) {
    ctx.save();
    ctx.font = `400 ${bodySize}px ${fam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 1;
    const bodyY = titleBottom + gap;
    rawBodyLines.forEach((line, i) => ctx.fillText(line, W / 2, bodyY + i * bodyLineH));
    ctx.restore();
  }

  // ── CTA (outro) ──
  if (isOutro && slide.cta) {
    const ctaSize = Math.round(W * 0.058);
    ctx.save();
    ctx.font = `800 ${ctaSize}px ${fam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = palette.accent;
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10;
    ctx.fillText(slide.cta, W / 2, H * 0.92);
    ctx.restore();
  }

  // ── Date (news) ──
  if (slide.date) {
    const dateSize = Math.round(W * 0.033);
    ctx.save();
    ctx.font = `${dateSize}px ${fam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(slide.date, W / 2, H * 0.96);
    ctx.restore();
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
