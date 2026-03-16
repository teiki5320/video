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
  stickerPosition: 'top-right',
  stickerSize: 15,
  stickerOpacity: 90,
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

const titleTextInput   = $('title-text');
const styleBtns        = document.querySelectorAll('.style-btn');
const titleDurationIn  = $('title-duration');
const durationDisplay  = $('duration-display');
const titlePositionSel = $('title-position');
const titlePreviewEl   = $('title-preview');

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

// ─── TITLE PARAMS ────────────────────────────────────────────
titleTextInput.addEventListener('input', () => {
  state.titleText = titleTextInput.value;
  titlePreviewEl.textContent = titleTextInput.value || 'Aperçu du titre…';
  updateSummary();
});

styleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    styleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.titleStyle = btn.dataset.style;
    applyStyleToPreview(btn);
    updateSummary();
  });
});

function applyStyleToPreview(btn) {
  titlePreviewEl.style.cssText = btn.style.cssText;
  titlePreviewEl.style.fontSize = '1.4rem';
  titlePreviewEl.style.padding = '8px 16px';
  titlePreviewEl.style.borderRadius = '6px';
  titlePreviewEl.style.transition = 'all 0.3s';
}
applyStyleToPreview(document.querySelector('.style-btn.active'));

titleDurationIn.addEventListener('input', () => {
  state.titleDuration = parseFloat(titleDurationIn.value);
  durationDisplay.textContent = state.titleDuration + ' s';
  updateSummary();
});

titlePositionSel.addEventListener('change', () => { state.titlePosition = titlePositionSel.value; });

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

stickerPositionSel.addEventListener('change', () => { state.stickerPosition = stickerPositionSel.value; });
stickerSizeIn.addEventListener('input', () => {
  state.stickerSize = parseInt(stickerSizeIn.value);
  stickerSizeDisplay.textContent = state.stickerSize + '%';
});
stickerOpacityIn.addEventListener('input', () => {
  state.stickerOpacity = parseInt(stickerOpacityIn.value);
  stickerOpacityDisp.textContent = state.stickerOpacity + '%';
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

// ─── SAVE PARAMS ─────────────────────────────────────────────
saveParamsBtn.addEventListener('click', () => {
  const toSave = {
    titleText: state.titleText, titleStyle: state.titleStyle,
    titleDuration: state.titleDuration, titlePosition: state.titlePosition,
    stickerPosition: state.stickerPosition, stickerSize: state.stickerSize,
    stickerOpacity: state.stickerOpacity,
  };
  localStorage.setItem('vf_params', JSON.stringify(toSave));
  saveFeedback.textContent = '✓ Sauvegardé !';
  setTimeout(() => { saveFeedback.textContent = ''; }, 2500);
});

function loadSavedParams() {
  const raw = localStorage.getItem('vf_params');
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    if (p.titleText)      { state.titleText = p.titleText; titleTextInput.value = p.titleText; titlePreviewEl.textContent = p.titleText; }
    if (p.titleStyle)     {
      state.titleStyle = p.titleStyle;
      styleBtns.forEach(b => { b.classList.toggle('active', b.dataset.style === p.titleStyle); if (b.dataset.style === p.titleStyle) applyStyleToPreview(b); });
    }
    if (p.titleDuration)  { state.titleDuration = p.titleDuration; titleDurationIn.value = p.titleDuration; durationDisplay.textContent = p.titleDuration + ' s'; }
    if (p.titlePosition)  { state.titlePosition = p.titlePosition; titlePositionSel.value = p.titlePosition; }
    if (p.stickerPosition){ state.stickerPosition = p.stickerPosition; stickerPositionSel.value = p.stickerPosition; }
    if (p.stickerSize)    { state.stickerSize = p.stickerSize; stickerSizeIn.value = p.stickerSize; stickerSizeDisplay.textContent = p.stickerSize + '%'; }
    if (p.stickerOpacity) { state.stickerOpacity = p.stickerOpacity; stickerOpacityIn.value = p.stickerOpacity; stickerOpacityDisp.textContent = p.stickerOpacity + '%'; }
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
    setProgress(5, 'Préparation…');

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
  'bold-white': { color: '#ffffff', shadow: 'rgba(0,0,0,0.9)', bg: 'rgba(0,0,0,0.55)',   font: 'bold',    family: 'Arial, sans-serif'          },
  'neon-green': { color: '#39ff14', shadow: '#39ff14',          bg: 'rgba(0,0,0,0.7)',   font: 'bold',    family: 'Arial, sans-serif'          },
  'cinema':     { color: '#f5c518', shadow: '#000000',          bg: 'rgba(0,0,0,0.85)',  font: 'bold',    family: 'Georgia, serif'             },
  'minimal':    { color: '#eeeeee', shadow: 'rgba(0,0,0,0.3)',  bg: 'rgba(51,51,51,0.4)',font: '300',     family: 'Arial, sans-serif'          },
  'fire':       { color: '#ff4500', shadow: '#ff6600',          bg: 'rgba(0,0,0,0.8)',   font: 'bold',    family: '"Arial Black", sans-serif'  },
  'ice':        { color: '#00cfff', shadow: '#00cfff',          bg: 'rgba(0,0,26,0.75)', font: 'bold',    family: 'Arial, sans-serif'          },
};

function drawTitle(ctx, text, style, position, W, H) {
  const s = TITLE_STYLES[style] || TITLE_STYLES['bold-white'];
  const fontSize = Math.max(24, Math.round(W / 16));
  ctx.save();
  ctx.font = `${s.font} ${fontSize}px ${s.family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw  = ctx.measureText(text).width;
  const th  = fontSize * 1.4;
  const pad = Math.round(fontSize * 0.55);

  let cy;
  if (position === 'top')    cy = H * 0.10;
  else if (position === 'bottom') cy = H * 0.88;
  else cy = H / 2;

  // Box
  ctx.fillStyle = s.bg;
  ctx.beginPath();
  roundRect(ctx, W / 2 - tw / 2 - pad, cy - th / 2 - pad / 2, tw + pad * 2, th + pad, 14);
  ctx.fill();

  // Glow/shadow
  const isGlow = style === 'neon-green' || style === 'fire' || style === 'ice';
  ctx.shadowColor = s.shadow;
  ctx.shadowBlur  = isGlow ? 22 : 5;
  ctx.shadowOffsetX = isGlow ? 0 : 2;
  ctx.shadowOffsetY = isGlow ? 0 : 2;

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
