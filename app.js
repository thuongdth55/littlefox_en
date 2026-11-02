/* Little Fox Stories – PWA học tiếng Anh qua video
   Dữ liệu: Firebase Realtime Database (REST) tại <FIREBASE_URL>/littlefox_en */
(() => {
'use strict';

/* ---------- Tiện ích ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const readLS = (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* đầy bộ nhớ */ } };
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const toList = x => Array.isArray(x) ? x.filter(Boolean) : Object.values(x || {});

const CFG = window.APP_CONFIG || {};
const ROOT = String(CFG.FIREBASE_URL || '').trim().replace(/\/+$/, '');
const BASE = ROOT + '/littlefox_en';
const configOk = ROOT && !ROOT.includes('__FIREBASE_URL__');

/* ---------- Icon (Material) ---------- */
const P = {
  star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  prev: 'M6 6h2v12H6zm3.5 6 8.5 6V6z',
  next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  doc: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  left: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  speak: 'M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z'
};
const REPLAY = 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z';
const I = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const skip = (n, back) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path ${back ? '' : 'transform="translate(24,0) scale(-1,1)"'} d="${REPLAY}"/><text x="12" y="16" font-size="7.5" font-weight="700" text-anchor="middle" fill="currentColor">${n}</text></svg>`;

/* ---------- UI helpers ---------- */
const app = $('#app');
const overlay = $('#overlay');
let navId = 0;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

function closeOverlay() { overlay.className = ''; overlay.innerHTML = ''; overlay.onclick = null; }
function openOverlay(html, mode) {
  overlay.innerHTML = html;
  overlay.className = 'show ' + mode;
  overlay.onclick = e => { if (e.target === overlay) closeOverlay(); };
}

function view({ title, back, star, body, footer = '', pad = false }) {
  app.innerHTML = `
    <header class="hdr">
      ${back ? `<a class="ib" href="${back}" aria-label="Quay lại">${I('left')}</a>` : '<span></span>'}
      <h1>${esc(title)}</h1>
      ${star ? `<a class="ib" href="#/bookmarks" aria-label="Từ đã lưu">${I('star', 'star-off')}</a>` : '<span></span>'}
    </header>
    <main class="${pad ? 'pad' : ''}">${body}</main>${footer}`;
  window.scrollTo(0, 0);
}

function errorView(msg, retry) {
  const body = `<div class="empty">${esc(msg)}<br><button id="retry">Thử lại</button></div>`;
  if ($('main')) $('main').innerHTML = body; else view({ title: 'Little Fox Stories', body });
  $('#retry')?.addEventListener('click', retry || route);
}

/* ---------- Firebase REST ---------- */
async function fb(path = '', q = '', opt) {
  const r = await fetch(`${BASE}${path ? '/' + path : ''}.json${q}`, opt);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

const storyCache = new Map();
async function getStory(key) {
  if (storyCache.has(key)) return storyCache.get(key);
  const d = await fb(encodeURIComponent(key));
  if (!d) throw new Error('Không tìm thấy truyện');
  const s = { key, info: d.info || {}, list: toList(d.list_video) };
  storyCache.set(key, s);
  return s;
}

/* ---------- Âm thanh / TTS ---------- */
function speak(text, lang = 'en-US', rate = .9) {
  if (!('speechSynthesis' in window)) return toast('Trình duyệt không hỗ trợ đọc');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = rate;
  speechSynthesis.speak(u);
}
function playWord(url, word, lang) {
  const a = new Audio(url);
  a.onerror = () => speak(word, lang, .8);
  a.play().catch(() => speak(word, lang, .8));
}

/* ---------- Từ điển & bookmark ---------- */
const POS = { noun: 'Danh từ', verb: 'Động từ', adjective: 'Tính từ', adverb: 'Trạng từ', pronoun: 'Đại từ', preposition: 'Giới từ', conjunction: 'Liên từ', interjection: 'Thán từ', exclamation: 'Thán từ', article: 'Mạo từ', determiner: 'Hạn định từ' };
const wkey = w => w.toLowerCase().replace(/[.$#[\]/]/g, '').trim();

// Thay hàm này nếu bạn muốn dùng nguồn từ điển Anh–Việt khác.
async function lookup(word) {
  const w = word.toLowerCase();
  const ck = 'lf_w_' + w;
  const cached = readLS(ck);
  if (cached) return cached;
  const tts = l => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${l}&q=${encodeURIComponent(w)}`;
  const out = { word: w, audioUk: tts('en-GB'), audioUs: tts('en-US'), meanings: [] };
  const [d, t] = await Promise.allSettled([
    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w)).then(r => r.ok ? r.json() : Promise.reject()),
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(w)}&langpair=en|vi`).then(r => r.json())
  ]);
  if (t.status === 'fulfilled') {
    const vi = t.value?.responseData?.translatedText;
    if (vi && vi.toLowerCase() !== w) out.meanings.push({ partOfSpeech: 'Nghĩa tiếng Việt', definitions: [vi] });
  }
  if (d.status === 'fulfilled' && Array.isArray(d.value)) {
    for (const e of d.value) for (const m of (e.meanings || [])) {
      if (out.meanings.length >= 5) break;
      out.meanings.push({ partOfSpeech: POS[m.partOfSpeech] || m.partOfSpeech, definitions: m.definitions.slice(0, 3).map(x => x.definition) });
    }
  }
  if (out.meanings.length) writeLS(ck, out);
  return out;
}

let BM = null; // { key: {sentence, update_time, wordData} }
async function loadBM(force) {
  if (BM && !force) return BM;
  const local = readLS('lf_bm', {});
  try { BM = (await fb('bookmarks')) || {}; writeLS('lf_bm', BM); }
  catch { BM = local; }
  return BM;
}
async function saveBM(word, sentence, wordData) {
  const k = wkey(word);
  const rec = { sentence, update_time: Math.floor(Date.now() / 1000), wordData };
  BM = BM || {}; BM[k] = rec; writeLS('lf_bm', BM);
  try { await fb('bookmarks/' + encodeURIComponent(k), '', { method: 'PUT', body: JSON.stringify(rec) }); }
  catch { toast('Đã lưu trên máy, chưa đồng bộ được lên Firebase'); }
}
async function removeBM(word) {
  const k = wkey(word);
  if (BM) delete BM[k];
  writeLS('lf_bm', BM || {});
  try { await fb('bookmarks/' + encodeURIComponent(k), '', { method: 'DELETE' }); }
  catch { toast('Đã xóa trên máy, chưa đồng bộ được lên Firebase'); }
}

const meaningsHTML = wd => (wd?.meanings || []).map(m =>
  `<div class="pos">${esc(m.partOfSpeech)}</div><ul>${(m.definitions || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul>`
).join('') || '<div>Chưa có nghĩa cho từ này.</div>';

const hilite = (text, word) => esc(text).replace(new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi'), '<b>$1</b>');

/* ---------- Trang chủ ---------- */
function drawHome(items) {
  const sorted = [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
  $('main').innerHTML = `<div class="list">${sorted.map(s => `
    <a class="card story" href="#/s/${encodeURIComponent(s.key)}">
      <h2>${esc(s.name)}</h2><p>${esc(s.name_vi)}</p>
      <img loading="lazy" src="${esc(s.cover_img)}" alt="">
    </a>`).join('')}</div>`;
}

async function home() {
  const id = ++navId;
  view({ title: 'Little Fox Stories', star: true, body: '<div class="list"><div class="skeleton"></div><div class="skeleton"></div></div>' });
  const cached = readLS('lf_home');
  if (cached) drawHome(cached);
  try {
    const keys = Object.keys(await fb('', '?shallow=true') || {}).filter(k => k !== 'bookmarks');
    const items = await Promise.all(keys.map(k => fb(encodeURIComponent(k) + '/info').then(i => ({ key: k, ...i }))));
    if (id !== navId) return;
    writeLS('lf_home', items);
    drawHome(items);
  } catch (e) {
    if (id === navId && !cached) errorView('Không tải được danh sách truyện. Kiểm tra mạng hoặc quyền đọc của Firebase.', home);
  }
}

/* ---------- Danh sách tập ---------- */
async function story(key) {
  const id = ++navId;
  view({ title: '', back: '#/', body: '<div class="grid"><div class="skeleton"></div><div class="skeleton"></div></div>' });
  try {
    const s = await getStory(key);
    if (id !== navId) return;
    view({
      title: s.info.name || key, back: '#/',
      body: `<div class="grid">${s.list.map((v, i) => `
        <a class="card ep" href="#/s/${encodeURIComponent(key)}/${i}">
          <h3>${i + 1}. ${esc(v.name)}</h3>
          <img loading="lazy" src="${esc(v.cover_image)}" alt="">
        </a>`).join('')}</div>`
    });
  } catch (e) { if (id === navId) errorView('Không tải được truyện này.', () => story(key)); }
}

/* ---------- Trình phát ---------- */
let hlsInst = null;
function loadScript(src) {
  return new Promise((res, rej) => {
    if ($(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('script'));
    document.head.appendChild(s);
  });
}

function stopMedia() {
  $('video')?.pause();
  if (hlsInst) { hlsInst.destroy(); hlsInst = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

async function player(key, idx) {
  const id = ++navId;
  view({ title: '', back: `#/s/${encodeURIComponent(key)}`, body: '<div class="skeleton"></div>' });
  let s;
  try { s = await getStory(key); } catch { return errorView('Không tải được tập này.', () => player(key, idx)); }
  if (id !== navId) return;
  const v = s.list[idx];
  if (!v) return (location.hash = `#/s/${encodeURIComponent(key)}`);
  const k = encodeURIComponent(key);
  const prevHref = idx > 0 ? `#/s/${k}/${idx - 1}` : '';
  const nextHref = idx < s.list.length - 1 ? `#/s/${k}/${idx + 1}` : '';
  const showTr = readLS('lf_tr', false);

  view({
    title: `${idx + 1}. ${v.name}`, back: `#/s/${k}`, pad: true,
    body: `
    <div class="stick" style="margin:-14px -14px 0">
      <div class="player" id="pl">
        <video id="vid" playsinline preload="metadata" poster="${esc(v.cover_image)}"></video>
        <div class="ctrls">
          <div class="row">
            <button id="bPrev" aria-label="Tập trước" ${prevHref ? '' : 'disabled'}>${I('prev')}</button>
            <button id="bBack" aria-label="Lùi 5 giây">${skip(5, true)}</button>
            <button id="bPlay" class="big" aria-label="Phát">${I('play')}</button>
            <button id="bFwd" aria-label="Tiến 15 giây">${skip(15, false)}</button>
            <button id="bNext" aria-label="Tập sau" ${nextHref ? '' : 'disabled'}>${I('next')}</button>
          </div>
          <div class="seek"><input class="sk" id="seek" type="range" min="0" max="1000" value="0" aria-label="Tua"></div>
          <div class="bot">
            <span id="cur">00:00</span><span>·</span><span class="d" id="dur">00:00</span>
            <span class="gap"></span>
            <span class="badge" id="spd"></span>
            <button id="bGear" aria-label="Cài đặt tốc độ">${I('gear')}</button>
          </div>
        </div>
      </div>
      <div class="tools">
        <button id="bTr">${I('doc')}<span id="trLbl">${showTr ? 'Hide transcript' : 'Show transcript'}</span></button>
        <button id="bShare">${I('share')}Share</button>
      </div>
    </div>
    <div id="trs" ${showTr ? '' : 'hidden'}></div>`,
    footer: `
    <nav class="nav">
      <a class="arr ${prevHref ? '' : 'dis'}" href="${prevHref || '#'}" aria-label="Tập trước">${I('left')}</a>
      <a class="pill" href="#/s/${k}" aria-label="Danh sách tập">${I('menu')}</a>
      <a class="arr r ${nextHref ? '' : 'dis'}" href="${nextHref || '#'}" aria-label="Tập sau">${I('left')}</a>
    </nav>`
  });

  /* video */
  const vid = $('#vid'), pl = $('#pl'), seek = $('#seek');
  let idleT, dragging = false, triedHls = false;
  const setPlayIcon = playing => { $('#bPlay').innerHTML = I(playing ? 'pause' : 'play'); };
  const wake = () => {
    pl.classList.remove('idle'); clearTimeout(idleT);
    if (!vid.paused) idleT = setTimeout(() => pl.classList.add('idle'), 3000);
  };
  const setSeekFill = () => seek.style.setProperty('--p', (seek.value / 10) + '%');

  vid.src = v.video_url;
  vid.addEventListener('error', async () => {
    if (triedHls) return toast('Không phát được video này');
    triedHls = true;
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js');
      if (window.Hls && Hls.isSupported()) {
        hlsInst = new Hls(); hlsInst.loadSource(v.video_url); hlsInst.attachMedia(vid);
      } else toast('Không phát được video này');
    } catch { toast('Không phát được video này'); }
  });
  vid.addEventListener('loadedmetadata', () => { $('#dur').textContent = fmt(vid.duration); });
  vid.addEventListener('timeupdate', () => {
    $('#cur').textContent = fmt(vid.currentTime);
    if (!dragging && vid.duration) { seek.value = (vid.currentTime / vid.duration) * 1000; setSeekFill(); }
  });
  vid.addEventListener('play', () => { setPlayIcon(true); wake(); });
  vid.addEventListener('pause', () => { setPlayIcon(false); wake(); });
  vid.addEventListener('ended', () => { setPlayIcon(false); pl.classList.remove('idle'); });

  const togglePlay = () => { vid.paused ? vid.play().catch(() => toast('Không phát được video này')) : vid.pause(); };
  $('#bPlay').onclick = togglePlay;
  $('#bBack').onclick = () => { vid.currentTime = Math.max(0, vid.currentTime - 5); wake(); };
  $('#bFwd').onclick = () => { vid.currentTime = Math.min(vid.duration || 1e9, vid.currentTime + 15); wake(); };
  $('#bPrev').onclick = () => prevHref && (location.hash = prevHref);
  $('#bNext').onclick = () => nextHref && (location.hash = nextHref);
  seek.oninput = () => { dragging = true; setSeekFill(); $('#cur').textContent = fmt((seek.value / 1000) * (vid.duration || 0)); };
  seek.onchange = () => { if (vid.duration) vid.currentTime = (seek.value / 1000) * vid.duration; dragging = false; wake(); };
  pl.addEventListener('click', e => { if (e.target.closest('button,input')) return; pl.classList.contains('idle') ? wake() : (vid.paused ? wake() : pl.classList.add('idle')); });

  const rate = readLS('lf_rate', 1);
  vid.playbackRate = rate;
  const showRate = () => { $('#spd').textContent = vid.playbackRate !== 1 ? vid.playbackRate + '×' : ''; };
  showRate();
  $('#bGear').onclick = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    openOverlay(`<div class="sheet"><div class="hd"><h3>Tốc độ phát</h3></div>${rates.map(r =>
      `<button class="opt ${r === vid.playbackRate ? 'cur' : ''}" data-r="${r}"><span>${r === 1 ? 'Bình thường' : r + '×'}</span>${r === vid.playbackRate ? '✓' : ''}</button>`).join('')}</div>`, 'sheetmode');
    $$('.opt[data-r]', overlay).forEach(b => b.onclick = () => {
      vid.playbackRate = +b.dataset.r; writeLS('lf_rate', vid.playbackRate); showRate(); closeOverlay();
    });
  };

  /* chia sẻ: Mở / Share (QR) */
  $('#bShare').onclick = () => {
    openOverlay(`<div class="dialog"><h3>Link video</h3>
      <button class="opt" id="dOpen">Mở</button><button class="opt" id="dShare">Share</button></div>`, 'dlg');
    $('#dOpen').onclick = () => { window.open(v.video_url, '_blank', 'noopener'); closeOverlay(); };
    $('#dShare').onclick = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
        const qr = qrcode(0, 'M'); qr.addData(v.video_url); qr.make();
        openOverlay(`<div class="dialog"><h3>Quét QR để mở video</h3>
          <div class="qr">${qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true })}</div>
          <div class="acts"><button id="qCopy">Sao chép link</button>${navigator.share ? '<button id="qSys">Chia sẻ…</button>' : ''}<button id="qClose">Đóng</button></div></div>`, 'dlg');
        $('#qCopy').onclick = () => navigator.clipboard?.writeText(v.video_url).then(() => toast('Đã sao chép link'), () => toast('Không sao chép được'));
        $('#qSys')?.addEventListener('click', () => navigator.share({ title: v.name, url: v.video_url }).catch(() => {}));
        $('#qClose').onclick = closeOverlay;
      } catch { toast('Không tạo được mã QR (cần mạng lần đầu)'); }
    };
  };

  /* transcript */
  const trs = $('#trs');
  let acc = readLS('lf_acc', 'us');
  const items = toList(v.content);
  const ipaOf = c => (acc === 'us' ? c.ipa_us : c.ipa_uk) || c.ipa_us || c.ipa_uk || '';
  const wordify = t => esc(t).replace(/[A-Za-z]+(?:(?:&#39;|’)[A-Za-z]+)*/g, m => `<span class="w" data-w="${m.replace(/&#39;/g, "'")}">${m}</span>`);

  trs.innerHTML = items.map((c, i) => `
    <article class="line" data-i="${i}">
      <button class="sp" aria-label="Đọc câu">${I('speak')}</button>
      <div class="tx">
        <div class="en">${wordify(c.en)}</div>
        ${ipaOf(c) ? `<div class="ipa"><span class="flag" role="button" aria-label="Đổi giọng Anh-Mỹ / Anh-Anh">${acc === 'us' ? '🇺🇸' : '🇬🇧'}</span>/${esc(ipaOf(c))}/</div>` : ''}
        ${(c.vi || c.explain) ? `<div class="more">${esc(c.vi)}${c.explain ? `<em>${esc(c.explain)}</em>` : ''}</div>` : ''}
      </div>
    </article>`).join('') || '<div class="empty">Tập này chưa có transcript.</div>';

  trs.onclick = e => {
    const line = e.target.closest('.line'); if (!line) return;
    const c = items[+line.dataset.i];
    if (e.target.closest('.sp')) {
      const b = e.target.closest('.sp'); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 1500);
      return speak(c.en, acc === 'us' ? 'en-US' : 'en-GB');
    }
    if (e.target.closest('.flag')) {
      acc = acc === 'us' ? 'uk' : 'us'; writeLS('lf_acc', acc);
      $$('.line', trs).forEach(l => {
        const it = items[+l.dataset.i], ip = $('.ipa', l);
        if (ip) ip.innerHTML = `<span class="flag" role="button">${acc === 'us' ? '🇺🇸' : '🇬🇧'}</span>/${esc(ipaOf(it))}/`;
      });
      return;
    }
    const w = e.target.closest('.w');
    if (w) return wordSheet(w.dataset.w, c, idx);
    line.classList.toggle('open');
  };

  $('#bTr').onclick = () => {
    const hide = !trs.hidden; trs.hidden = hide; writeLS('lf_tr', !hide);
    $('#trLbl').textContent = hide ? 'Show transcript' : 'Hide transcript';
  };
}

/* Bottom sheet tra từ + lưu bookmark */
async function wordSheet(word, sentence, epIdx) {
  const k = wkey(word);
  await loadBM();
  openOverlay(`<div class="sheet">
    <div class="hd"><h3>${esc(word)}</h3><button id="wStar" aria-label="Lưu từ">${I('star', BM[k] ? '' : 'star-off')}</button></div>
    <div class="aud"><button id="wUs">${I('vol')}US</button><button id="wUk">${I('vol')}UK</button></div>
    <p class="ctx">${hilite(sentence.en, word)}</p>
    <div class="mean" id="wMean">Đang tra từ…</div></div>`, 'sheetmode');

  let wd = BM[k]?.wordData || null;
  const play = (acc) => {
    const l = acc === 'us' ? 'en-US' : 'en-GB';
    const url = wd ? (acc === 'us' ? wd.audioUs : wd.audioUk) : '';
    url ? playWord(url, word, l) : speak(word, l, .8);
  };
  $('#wUs').onclick = () => play('us');
  $('#wUk').onclick = () => play('uk');

  try { wd = wd || await lookup(word); } catch { /* bỏ qua */ }
  if (!overlay.classList.contains('show')) return;
  $('#wMean').innerHTML = meaningsHTML(wd);
  play('us');

  $('#wStar').onclick = async () => {
    const btn = $('#wStar');
    if (BM[k]) {
      await removeBM(word); btn.innerHTML = I('star', 'star-off'); toast('Đã bỏ lưu');
    } else {
      const wordData = wd || await lookup(word).catch(() => ({ word: k, meanings: [] }));
      await saveBM(word, { ...sentence, id: epIdx }, wordData);
      btn.innerHTML = I('star'); toast('Đã lưu từ');
    }
  };
}

/* ---------- Từ đã lưu ---------- */
async function bookmarks() {
  const id = ++navId;
  view({ title: 'Từ đã lưu', back: '#/', body: '<div class="skeleton"></div>' });
  await loadBM(true);
  if (id !== navId) return;
  const draw = () => {
    const entries = Object.entries(BM || {}).sort((a, b) => (b[1].update_time || 0) - (a[1].update_time || 0));
    $('main').innerHTML = entries.length
      ? `<div class="list">${entries.map(([k, r]) => `
        <article class="card bm" data-k="${esc(k)}">
          <div class="top"><h3>${esc(r.wordData?.word || k)}</h3>
            <button data-a="us" aria-label="Phát âm Mỹ">${I('vol')}</button>
            <button class="del" data-a="del" aria-label="Xóa">${I('trash')}</button></div>
          <p class="s-en">${hilite(r.sentence?.en || '', r.wordData?.word || k)}</p>
          <p class="s-vi">${esc(r.sentence?.vi || '')}</p>
          <div class="mean">${meaningsHTML(r.wordData)}</div>
        </article>`).join('')}</div>`
      : '<div class="empty">Chưa có từ nào được lưu.<br>Chạm vào một từ trong transcript để lưu.</div>';
  };
  draw();
  $('main').onclick = async e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    const k = b.closest('.bm').dataset.k, r = BM[k];
    if (b.dataset.a === 'us') return r.wordData?.audioUs ? playWord(r.wordData.audioUs, k, 'en-US') : speak(k);
    if (confirm(`Xóa từ "${k}"?`)) { await removeBM(k); draw(); }
  };
}

/* ---------- Router ---------- */
function route() {
  closeOverlay(); stopMedia();
  if (!configOk) {
    return view({ title: 'Little Fox Stories', body: '<div class="empty">Chưa cấu hình <b>FIREBASE_URL</b>.<br>Thêm secret FIREBASE_URL trong GitHub rồi deploy lại.</div>' });
  }
  const raw = location.hash.replace(/^#\/?/, '').split('/');
  if (raw[0] === 'bookmarks') bookmarks();
  else if (raw[0] === 's' && raw[1] && raw[2] !== undefined && !isNaN(+raw[2])) player(decodeURIComponent(raw[1]), +raw[2]);
  else if (raw[0] === 's' && raw[1]) story(decodeURIComponent(raw[1]));
  else home();
}
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });
route();

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
