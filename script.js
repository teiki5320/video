/* ============================================================
   VideoForge – script.js
   Utilise @ffmpeg/ffmpeg 0.12 (SharedArrayBuffer requis ou
   fallback single-thread automatique)
   ============================================================ */

const { FFmpeg } = FFmpegWASM;
const { fetchFile, toBlobURL } = FFmpegUtil;

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

// Tabs
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanes  = document.querySelectorAll('.tab-content');

// Montage
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

// Params – title
const titleTextInput   = $('title-text');
const styleBtns        = document.querySelectorAll('.style-btn');
const titleDurationIn  = $('title-duration');
const durationDisplay  = $('duration-display');
const titlePositionSel = $('title-position');
const titlePreviewEl   = $('title-preview');

// Params – sticker
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

// Params – outro
const outroInput       = $('outro-input');
const outroBrowse      = $('outro-browse');
const outroDrop        = $('outro-drop');
const outroPreviewWrap = $('outro-preview-wrap');
const outroPreviewVid  = $('outro-preview');
const outroRemove      = $('outro-remove');

// Save
const saveParamsBtn = $('save-params-btn');
const saveFeedback  = $('save-feedback');

// Summary
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
dropZone.addEventListener('click', e => { if (e.target === dropZone || e.target.id === 'drop-inner') mainVideoInput.click(); });

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
  const url = URL.createObjectURL(file);
  sourcePreview.src = url;
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
  // Copy inline styles from the chosen style button to the preview
  const computed = btn.style;
  titlePreviewEl.style.cssText = computed.cssText;
  titlePreviewEl.style.fontSize = '1.4rem';
  titlePreviewEl.style.padding = '8px 16px';
  titlePreviewEl.style.borderRadius = '6px';
  titlePreviewEl.style.transition = 'all 0.3s';
}

// Init style preview
applyStyleToPreview(document.querySelector('.style-btn.active'));

titleDurationIn.addEventListener('input', () => {
  state.titleDuration = parseFloat(titleDurationIn.value);
  durationDisplay.textContent = state.titleDuration + ' s';
  updateSummary();
});

titlePositionSel.addEventListener('change', () => {
  state.titlePosition = titlePositionSel.value;
});

// ─── STICKER PARAMS ──────────────────────────────────────────
stickerBrowse.addEventListener('click', (e) => { e.stopPropagation(); stickerInput.click(); });
stickerDrop.addEventListener('click', () => stickerInput.click());

stickerInput.addEventListener('change', () => {
  if (stickerInput.files[0]) setSticker(stickerInput.files[0]);
});

function setSticker(file) {
  state.stickerFile = file;
  stickerPreviewImg.src = URL.createObjectURL(file);
  stickerPreviewWrap.hidden = false;
  stickerDrop.hidden = true;
  updateSummary();
  updateProcessBtn();
}

stickerRemove.addEventListener('click', () => {
  state.stickerFile = null;
  stickerInput.value = '';
  stickerPreviewImg.src = '';
  stickerPreviewWrap.hidden = true;
  stickerDrop.hidden = false;
  updateSummary();
  updateProcessBtn();
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
outroBrowse.addEventListener('click', (e) => { e.stopPropagation(); outroInput.click(); });
outroDrop.addEventListener('click', () => outroInput.click());

outroInput.addEventListener('change', () => {
  if (outroInput.files[0]) setOutro(outroInput.files[0]);
});

function setOutro(file) {
  state.outroFile = file;
  outroPreviewVid.src = URL.createObjectURL(file);
  outroPreviewWrap.hidden = false;
  outroDrop.hidden = true;
  updateSummary();
  updateProcessBtn();
}

outroRemove.addEventListener('click', () => {
  state.outroFile = null;
  outroInput.value = '';
  outroPreviewVid.src = '';
  outroPreviewWrap.hidden = true;
  outroDrop.hidden = false;
  updateSummary();
  updateProcessBtn();
});

// ─── SAVE PARAMS ─────────────────────────────────────────────
saveParamsBtn.addEventListener('click', () => {
  // Persist non-file state to localStorage
  const toSave = {
    titleText:       state.titleText,
    titleStyle:      state.titleStyle,
    titleDuration:   state.titleDuration,
    titlePosition:   state.titlePosition,
    stickerPosition: state.stickerPosition,
    stickerSize:     state.stickerSize,
    stickerOpacity:  state.stickerOpacity,
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
    if (p.titleText)     { state.titleText = p.titleText; titleTextInput.value = p.titleText; titlePreviewEl.textContent = p.titleText; }
    if (p.titleStyle) {
      state.titleStyle = p.titleStyle;
      styleBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.style === p.titleStyle);
        if (b.dataset.style === p.titleStyle) applyStyleToPreview(b);
      });
    }
    if (p.titleDuration) { state.titleDuration = p.titleDuration; titleDurationIn.value = p.titleDuration; durationDisplay.textContent = p.titleDuration + ' s'; }
    if (p.titlePosition) { state.titlePosition = p.titlePosition; titlePositionSel.value = p.titlePosition; }
    if (p.stickerPosition) { state.stickerPosition = p.stickerPosition; stickerPositionSel.value = p.stickerPosition; }
    if (p.stickerSize)   { state.stickerSize = p.stickerSize; stickerSizeIn.value = p.stickerSize; stickerSizeDisplay.textContent = p.stickerSize + '%'; }
    if (p.stickerOpacity){ state.stickerOpacity = p.stickerOpacity; stickerOpacityIn.value = p.stickerOpacity; stickerOpacityDisp.textContent = p.stickerOpacity + '%'; }
    updateSummary();
  } catch(e) {}
}
loadSavedParams();

// ─── SUMMARY ─────────────────────────────────────────────────
function updateSummary() {
  sumTitleVal.textContent    = state.titleText || '—';
  sumStyleVal.textContent    = state.titleStyle || '—';
  sumDurationVal.textContent = state.titleDuration + ' s';
  sumStickerVal.textContent  = state.stickerFile ? state.stickerFile.name : '—';
  sumOutroVal.textContent    = state.outroFile   ? state.outroFile.name   : '—';
}

function updateProcessBtn() {
  processBtn.disabled = !state.mainVideoFile;
}

// ─── FFMPEG PROCESSING ───────────────────────────────────────

let ffmpegInstance = null;

async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  const ff = new FFmpeg();
  ff.on('log', ({ message }) => {
    logBox.textContent += message + '\n';
    logBox.scrollTop = logBox.scrollHeight;
  });
  ff.on('progress', ({ progress }) => {
    const pct = Math.min(Math.round(progress * 100), 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = `Traitement… ${pct}%`;
  });

  setProgress(5, 'Chargement de FFmpeg…');

  // Utilise le core multi-thread si SharedArrayBuffer est disponible, sinon single-thread
  const hasSAB = typeof SharedArrayBuffer !== 'undefined';
  if (hasSAB) {
    const mtURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd';
    await ff.load({
      coreURL:   await toBlobURL(`${mtURL}/ffmpeg-core.js`,        'text/javascript'),
      wasmURL:   await toBlobURL(`${mtURL}/ffmpeg-core.wasm`,      'application/wasm'),
      workerURL: await toBlobURL(`${mtURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
  } else {
    const stURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ff.load({
      coreURL: await toBlobURL(`${stURL}/ffmpeg-core.js`,   'text/javascript'),
      wasmURL: await toBlobURL(`${stURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }
  ffmpegInstance = ff;
  return ff;
}

processBtn.addEventListener('click', processVideo);

async function processVideo() {
  if (!state.mainVideoFile) return;

  // Reset UI
  processBtn.disabled = true;
  processLabel.textContent = '⏳ Traitement…';
  progressWrap.hidden = false;
  logBox.textContent = '';
  resultSection.hidden = true;

  try {
    const ff = await getFFmpeg();

    setProgress(10, 'Chargement de la vidéo principale…');
    await ff.writeFile('input.mp4', await fetchFile(state.mainVideoFile));

    // ── Build filtergraph ──────────────────────────────────────
    // We process in stages:
    // 1. Overlay sticker on input → stickered.mp4
    // 2. Add title text overlay  → titled.mp4
    // 3. Concatenate with outro  → final.mp4

    let currentInput = 'input.mp4';

    // ── Stage 1: Sticker ──────────────────────────────────────
    if (state.stickerFile) {
      setProgress(20, 'Ajout du sticker…');
      await ff.writeFile('sticker.png', await fetchFile(state.stickerFile));

      // Compute overlay position
      const pad = 20;
      const pos = state.stickerPosition;
      let overlayX, overlayY;
      if (pos === 'top-left')     { overlayX = `${pad}`; overlayY = `${pad}`; }
      else if (pos === 'top-right'){ overlayX = `main_w-overlay_w-${pad}`; overlayY = `${pad}`; }
      else if (pos === 'bottom-left'){ overlayX = `${pad}`; overlayY = `main_h-overlay_h-${pad}`; }
      else                         { overlayX = `main_w-overlay_w-${pad}`; overlayY = `main_h-overlay_h-${pad}`; }

      const sizePct = state.stickerSize / 100;

      const fc = `[1:v]scale=iw*${sizePct}:ih*${sizePct}[stk];[0:v][stk]overlay=${overlayX}:${overlayY}:format=auto[v];[v]format=yuv420p[out]`;

      await ff.exec([
        '-i', currentInput,
        '-i', 'sticker.png',
        '-filter_complex', fc,
        '-map', '[out]', '-map', '0:a?',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
        '-c:a', 'copy',
        'stickered.mp4'
      ]);
      currentInput = 'stickered.mp4';
    }

    // ── Stage 2: Title text ───────────────────────────────────
    if (state.titleText) {
      setProgress(40, 'Ajout du titre…');

      const { fontColor, fontSize, boxColor, shadowColor } = styleToFFmpegParams(state.titleStyle);
      const yExpr = titleYExpr(state.titlePosition);
      const dur   = state.titleDuration;

      const drawtext = [
        `drawtext=text='${escapeFfmpegText(state.titleText)}'`,
        `fontcolor=${fontColor}`,
        `fontsize=${fontSize}`,
        `box=1:boxcolor=${boxColor}:boxborderw=14`,
        `shadowcolor=${shadowColor}:shadowx=2:shadowy=2`,
        `x=(w-text_w)/2`,
        `y=${yExpr}`,
        `enable='between(t,0,${dur})'`
      ].join(':');

      await ff.exec([
        '-i', currentInput,
        '-vf', drawtext,
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
        '-c:a', 'copy',
        'titled.mp4'
      ]);
      currentInput = 'titled.mp4';
    }

    // ── Stage 3: Concat outro ─────────────────────────────────
    if (state.outroFile) {
      setProgress(65, 'Ajout de l\'outro…');
      await ff.writeFile('outro.mp4', await fetchFile(state.outroFile));

      // Re-encode both to same params then concat
      await ff.exec(['-i', currentInput, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-ar', '44100', '-ac', '2', 'main_norm.mp4']);
      await ff.exec(['-i', 'outro.mp4',  '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-ar', '44100', '-ac', '2', 'outro_norm.mp4']);

      // Write concat list
      await ff.writeFile('list.txt', 'file main_norm.mp4\nfile outro_norm.mp4\n');

      await ff.exec([
        '-f', 'concat', '-safe', '0',
        '-i', 'list.txt',
        '-c', 'copy',
        'final.mp4'
      ]);
      currentInput = 'final.mp4';
    }

    setProgress(90, 'Finalisation…');

    // If no processing was done at all, just copy input
    if (currentInput === 'input.mp4') {
      await ff.exec(['-i', 'input.mp4', '-c', 'copy', 'final.mp4']);
      currentInput = 'final.mp4';
    }

    const data = await ff.readFile(currentInput);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url  = URL.createObjectURL(blob);

    resultVideo.src = url;
    downloadBtn.href = url;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth' });

    setProgress(100, '✓ Terminé !');
    progressFill.style.background = '#2dce6a';

  } catch (err) {
    console.error(err);
    setProgress(0, '❌ Erreur : ' + err.message);
    logBox.textContent += '\n\nErreur : ' + err.message;
  } finally {
    processBtn.disabled = false;
    processLabel.textContent = '⚡ Générer la vidéo';
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function setProgress(pct, msg) {
  progressFill.style.width = pct + '%';
  progressText.textContent = msg;
}

function escapeFfmpegText(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g,  "\\'")
    .replace(/:/g,  '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function titleYExpr(position) {
  if (position === 'top')    return '(h*0.08)';
  if (position === 'bottom') return '(h*0.85)';
  return '(h-text_h)/2'; // center
}

function styleToFFmpegParams(style) {
  const map = {
    'bold-white': { fontColor: 'white',   fontSize: 64, boxColor: 'black@0.5',   shadowColor: 'black@0.8' },
    'neon-green': { fontColor: '0x39ff14',fontSize: 64, boxColor: 'black@0.7',   shadowColor: '0x39ff14@0.9' },
    'cinema':     { fontColor: '0xf5c518',fontSize: 60, boxColor: 'black@0.85',  shadowColor: 'black@0.9' },
    'minimal':    { fontColor: 'white',   fontSize: 56, boxColor: '0x333333@0.4',shadowColor: 'black@0.3' },
    'fire':       { fontColor: '0xff4500',fontSize: 66, boxColor: 'black@0.8',   shadowColor: '0xff4500@0.8' },
    'ice':        { fontColor: '0x00cfff',fontSize: 64, boxColor: 'black@0.75',  shadowColor: '0x00cfff@0.7' },
  };
  return map[style] || map['bold-white'];
}
