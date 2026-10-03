/**
 * مدير موسوعة البُردة — النسخة المحسّنة
 * التحسينات: Undo/Redo، سجل إصدارات، Toast notifications، Lazy loading، ضغط الصور
 */

// ==================== البيانات الافتراضية ====================
const DEFAULT_DATA = {
  chapters: [
    { id: 0, label: "الفصل الأول", title: "فِي الْغَزَلِ وَشَكْوَىٰ الْغَرَامِ", firstVerse: 1, lastVerse: 12, intro: "مقدمة تُعرّف بموضوع الفصل الأول وتوضح مساره العام قبل الدخول في أبياته." },
    { id: 1, label: "الفصل الثاني", title: "فِي التَّحْذِيرِ مِنْ هَوَىٰ النَّفْسِ", firstVerse: 13, lastVerse: 28, intro: "مقدمة تُعرّف بموضوع الفصل الثاني وما يتصل به من تهذيب النفس والتحذير من هواها." },
    { id: 2, label: "الفصل الثالث", title: "فِي مَدْحِ النَّبِيِّ صَلَّىٰ اللهُ عَلَيْهِ وَآلِهِ وَسَلَّمَ", firstVerse: 29, lastVerse: 58, intro: "مقدمة تُعرّف بموضوع الفصل الثالث ومساره في مدح النبي ﷺ." },
    { id: 3, label: "الفصل الرابع", title: "فِي مَوْلِدِهِ عَلَيْهِ الصَّلَاةُ وَالسَّلَامُ", firstVerse: 59, lastVerse: 71, intro: "مقدمة تُعرّف بموضوع الفصل الرابع وما يرويه من مشاهد مولده ﷺ." },
    { id: 4, label: "الفصل الخامس", title: "فِي مُعْجِزَاتِهِ صَلَّىٰ اللهُ عَلَيْهِ وَآلِهِ وَسَلَّمَ", firstVerse: 72, lastVerse: 87, intro: "مقدمة تُعرّف بموضوع الفصل الخامس ومعجزاته ﷺ." },
    { id: 5, label: "الفصل السادس", title: "فِي شَرَفِ القُرْآنِ", firstVerse: 88, lastVerse: 104, intro: "مقدمة تُعرّف بموضوع الفصل السادس وشرف القرآن." },
    { id: 6, label: "الفصل السابع", title: "فِي إِسْرَائِهِ وَمِعْرَاجِهِ صَلَّىٰ اللهُ عَلَيْهِ وَسَلَّمَ", firstVerse: 105, lastVerse: 117, intro: "مقدمة تُعرّف بموضوع الفصل السابع والإسراء والمعراج." },
    { id: 7, label: "الفصل الثامن", title: "فِي جِهَادِ النَّبِيِّ صَلَّىٰ اللهُ عَلَيْهِ وَسَلَّمَ", firstVerse: 118, lastVerse: 139, intro: "مقدمة تُعرّف بموضوع الفصل الثامن وجهاد النبي ﷺ." },
    { id: 8, label: "الفصل التاسع", title: "فِي التَوَسُّلِ بِالنَّبِيِّ صَلَّىٰ اللهُ عَلَيْهِ وَسَلَّمَ", firstVerse: 140, lastVerse: 151, intro: "مقدمة تُعرّف بموضوع الفصل التاسع والتوسل بالنبي ﷺ." },
    { id: 9, label: "الفصل العاشر", title: "فِي المُنَاجَاةِ", firstVerse: 152, lastVerse: 160, intro: "مقدمة تُعرّف بموضوع الفصل العاشر والمناجاة." }
  ],
  verses: [],
  explanations: [],
  sources: [],
  glossary: [],
  authors: [],
  topics: [],
  articles: [],
  poem: {
    title: "البُردة",
    fullTitle: "الكواكب الدرية في مدح خير البرية ﷺ",
    author: "الإمام البوصيري",
    verseCount: 168,
    aboutTitle: "البوصيري والبُردة",
    intro: "",
    about: "",
    structureNote: "",
    aboutSections: []
  },
  site: {
    name: "موسوعة البُردة",
    description: "موسوعة رقمية تجمع المتن ومعاني الألفاظ وشروح المصادر",
    url: "",
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      themeColor: "#23624f",
      googleVerification: "",
      bingVerification: "",
      defaultAuthor: "",
      index: true,
      follow: true,
      sitemap: true,
      canonical: true
    }
  },
  sourceSections: ["شروح", "دراسات ومقالات", "مخطوطات وطبعات", "إنشاد البُردة", "أعمال على البُردة", "مرئية", "مسموعة"]
};

// ==================== المتغيرات العامة ====================
let DATA = load();
let undoStack = [];
let redoStack = [];
let versionHistory = [];
const MAX_HISTORY = 10;
const MAX_UNDO = 50;

// ==================== أدوات مساعدة ====================
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function norm(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[ً-ٰٟۖ-ۭ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[‎‏]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function ar(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function byId(arr, id) {
  return (DATA[arr] || []).find(x => String(x.id) === String(id));
}

function chapters() { return DATA.chapters || []; }
function sources() { return DATA.sources || []; }
function verseOptions(sel) {
  return (DATA.verses || []).map(v => `<option value="${v.id}" ${v.id === sel ? 'selected' : ''}>${ar(v.id)} — ${esc(v.first)}</option>`).join('');
}
function sourceOptions(sel) {
  return sources().map(s => `<option value="${esc(s.id)}" ${s.id === sel ? 'selected' : ''}>${esc(s.title)}</option>`).join('');
}

// ==================== نظام الإشعارات (Toast) ====================
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ==================== نظام Undo/Redo ====================
function saveState() {
  undoStack.push(clone(DATA));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(clone(DATA));
  DATA = undoStack.pop();
  save();
  renderAll();
  updateUndoButtons();
  toast('تم التراجع', 'info');
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(clone(DATA));
  DATA = redoStack.pop();
  save();
  renderAll();
  updateUndoButtons();
  toast('تم الإعادة', 'info');
}

function updateUndoButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

// ==================== سجل الإصدارات ====================
function saveVersion() {
  versionHistory.push({
    timestamp: new Date().toISOString(),
    data: clone(DATA)
  });
  if (versionHistory.length > MAX_HISTORY) versionHistory.shift();
  updateVersionList();
}

function updateVersionList() {
  const list = document.getElementById('versionList');
  if (!list) return;
  list.innerHTML = versionHistory.map((v, i) => `
    <div class="version-item" data-index="${i}">
      <span>${new Date(v.timestamp).toLocaleString('ar')}</span>
      <button onclick="restoreVersion(${i})">استعادة</button>
    </div>
  `).join('');
}

function restoreVersion(index) {
  if (!confirm('هل تريد استعادة هذه النسخة؟ سيتم استبدال البيانات الحالية.')) return;
  saveState();
  DATA = clone(versionHistory[index].data);
  save();
  renderAll();
  toast('تم استعادة النسخة', 'success');
}

// ==================== التخزين المحلي ====================
function load() {
  try {
    const saved = localStorage.getItem('burdah_data');
    if (saved) return ensureSchema(JSON.parse(saved));
  } catch (e) {
    console.error('خطأ في تحميل البيانات:', e);
  }
  return clone(DEFAULT_DATA);
}

function save() {
  try {
    localStorage.setItem('burdah_data', JSON.stringify(DATA));
    document.getElementById('saveState').textContent = 'محفوظ محليًا — ' + new Date().toLocaleTimeString('ar');
  } catch (e) {
    toast('خطأ في الحفظ: ' + e.message, 'error');
  }
}

function ensureSchema(data) {
  const merged = clone(DEFAULT_DATA);
  if (data && typeof data === 'object') {
    Object.keys(merged).forEach(key => {
      if (data[key] !== undefined) merged[key] = data[key];
    });
  }
  return merged;
}

// ==================== Markdown ====================
function md(s) {
  let x = esc(s || '');
  x = x.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/(?:^|\n)([-*])\s+(.+)(?=\n|$)/g, '\n<li>$2</li>')
    .replace(/(?:<li>.*<\/li>)(?:\n<li>.*<\/li>)*/gs, m => '<ul>' + m + '</ul>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return '<p>' + x + '</p>';
}

function mdPreviewHtml(s) {
  return md(s);
}

// ==================== محرر Markdown ====================
function mdEditor(id, value, onChange) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="md-toolbar">
      <button type="button" onclick="mdInsert('${id}', '**', '**')" title="غامق">B</button>
      <button type="button" onclick="mdInsert('${id}', '*', '*')" title="مائل">I</button>
      <button type="button" onclick="mdInsert('${id}', '# ', '')" title="عنوان">H</button>
      <button type="button" onclick="mdInsert('${id}', '> ', '')" title="اقتباس">Q</button>
      <button type="button" onclick="mdInsert('${id}', '- ', '')" title="قائمة">•</button>
    </div>
    <textarea placeholder="اكتب هنا...">${esc(value)}</textarea>
    <div class="md-preview">${md(value)}</div>
  `;
  const textarea = el.querySelector('textarea');
  const preview = el.querySelector('.md-preview');
  textarea.addEventListener('input', () => {
    preview.innerHTML = md(textarea.value);
    if (onChange) onChange(textarea.value);
  });
}

function mdInsert(id, before, after) {
  const el = document.getElementById(id);
  if (!el) return;
  const textarea = el.querySelector('textarea');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  const newText = text.substring(0, start) + before + selected + after + text.substring(end);
  textarea.value = newText;
  textarea.dispatchEvent(new Event('input'));
  textarea.focus();
  textarea.setSelectionRange(start + before.length, end + before.length);
}

// ==================== النوافذ المنبثقة ====================
function openModal(title, body) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

// ==================== المعاينة ====================
function refreshPreview() {
  const frame = document.getElementById('previewFrame');
  if (!frame) return;
  try {
    frame.srcdoc = buildSite({ page: 'home' });
  } catch (err) {
    frame.srcdoc = '<p style="padding:20px;font-family:Tahoma">تعذرت المعاينة. التفاصيل: ' + esc(err?.message || err) + '</p>';
  }
}

// ==================== التسجيل في Supabase ====================
function onlineMessage(text, isError = false) {
  const el = document.getElementById('onlineStatus');
  if (el) {
    el.textContent = text;
    el.style.color = isError ? '#9a3030' : '';
  }
}

function openOnlineLogin() {
  if (!window.burdaOnline) {
    toast('لم يتم إعداد Supabase بعد. تأكد من وجود supabase/config.js.', 'error');
    return;
  }
  openModal('تسجيل الدخول إلى Supabase', `
    <div class="field">
      <label>البريد الإلكتروني</label>
      <input id="online-email" type="email" autocomplete="username">
    </div>
    <div class="field">
      <label>كلمة المرور</label>
      <input id="online-password" type="password" autocomplete="current-password">
    </div>
    <button class="btn primary" onclick="onlineLogin()">دخول</button>
  `);
}

async function onlineLogin() {
  try {
    onlineMessage('جارٍ تسجيل الدخول...');
    const session = await window.burdaOnline.signIn(
      document.getElementById('online-email').value,
      document.getElementById('online-password').value
    );
    closeModal();
    onlineMessage('تم تسجيل الدخول Online');
    toast('تم تسجيل الدخول بنجاح.', 'success');
  } catch (err) {
    onlineMessage('تعذر تسجيل الدخول', true);
    toast(err?.message || 'تعذر تسجيل الدخول إلى Supabase.', 'error');
  }
}

async function onlineLoad() {
  if (!window.burdaOnline) {
    toast('لم يتم إعداد Supabase بعد.', 'error');
    return;
  }
  if (!window.BURDA_SUPABASE_SESSION) {
    openOnlineLogin();
    return;
  }
  if (!confirm('سيتم استبدال البيانات المحلية بالنسخة الموجودة في Supabase. هل تريد المتابعة？')) return;
  try {
    onlineMessage('جارٍ تحميل البيانات...');
    const remote = await window.burdaOnline.loadProject();
    if (!remote) {
      toast('لا توجد نسخة محفوظة في Supabase لهذا المشروع.', 'info');
      onlineMessage('لا توجد بيانات Online');
      return;
    }
    saveState();
    DATA = ensureSchema(remote);
    save();
    renderAll();
    onlineMessage('تم التحميل من Supabase');
    toast('تم تحميل البيانات من Supabase.', 'success');
  } catch (err) {
    onlineMessage('تعذر تحميل البيانات', true);
    toast(err?.message || 'تعذر تحميل البيانات من Supabase.', 'error');
  }
}

async function onlineSave() {
  if (!window.burdaOnline) {
    toast('لم يتم إعداد Supabase بعد.', 'error');
    return;
  }
  if (!window.BURDA_SUPABASE_SESSION) {
    openOnlineLogin();
    return;
  }
  try {
    onlineMessage('جارٍ الحفظ...');
    await window.burdaOnline.saveProject(DATA);
    onlineMessage('تم الحفظ في Supabase');
    toast('تم حفظ البيانات في Supabase.', 'success');
  } catch (err) {
    onlineMessage('تعذر الحفظ Online', true);
    toast(err?.message || 'تعذر حفظ البيانات في Supabase.', 'error');
  }
}

// ==================== التنقل ====================
const titles = {
  dashboard: 'لوحة التحكم',
  poem: 'بيانات القصيدة',
  chapters: 'الفصول',
  verses: 'الأبيات',
  explanations: 'الشروح',
  sources: 'المصادر',
  dictionary: 'المعجم',
  authors: 'المؤلفون',
  settings: 'إعدادات الموقع',
  preview: 'المعاينة',
  export: 'التصدير / النسخ الاحتياطي'
};

function show(v) {
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.getElementById('title').textContent = titles[v];
  document.querySelectorAll('.nav button').forEach(x => x.classList.toggle('active', x.dataset.view === v));
  if (v === 'preview') refreshPreview();
  renderAll();
}

// ==================== العرض ====================
function renderAll() {
  renderStats();
  renderPoem();
  renderChapters();
  renderVerses();
  renderExplanations();
  renderSources();
  renderDictionary();
  renderAuthors();
  renderSettings();
  updateUndoButtons();
  updateVersionList();
}

function renderStats() {
  const a = [
    ['verses', 'الأبيات', DATA.verses?.length || 0],
    ['chapters', 'الفصول', DATA.chapters?.length || 0],
    ['sources', 'المصادر', DATA.sources?.length || 0],
    ['glossary', 'الألفاظ', DATA.glossary?.length || 0]
  ];
  document.getElementById('stats').innerHTML = a.map(x =>
    `<div class="card"><strong>${x[2]}</strong><span>${x[1]}</span></div>`
  ).join('');
  document.getElementById('versionInfo').textContent = `${DATA.poem?.title || 'البُردة'} — ${DATA.poem?.author || ''}`;
  document.getElementById('storageInfo').textContent = `حجم البيانات الحالي تقريبًا: ${Math.round(JSON.stringify(DATA).length / 1024)} KB`;
}

function renderPoem() {
  const p = DATA.poem || {};
  for (const k of ['title', 'fullTitle', 'author', 'verseCount', 'aboutTitle']) {
    const el = document.getElementById('poem-' + k);
    if (el) el.value = p[k] ?? '';
  }
  mdEditor('md-poem-intro', p.intro || '', v => DATA.poem.intro = v);
  mdEditor('md-poem-about', p.about || '', v => DATA.poem.about = v);
  mdEditor('md-poem-structureNote', p.structureNote || '', v => DATA.poem.structureNote = v);
  renderAboutSectionsManager();
}

function savePoem() {
  saveState();
  DATA.poem = {
    ...(DATA.poem || {}),
    title: document.getElementById('poem-title').value,
    fullTitle: document.getElementById('poem-fullTitle').value,
    author: document.getElementById('poem-author').value,
    verseCount: +document.getElementById('poem-verseCount').value || 0,
    aboutTitle: document.getElementById('poem-aboutTitle').value,
    intro: document.querySelector('#md-poem-intro textarea')?.value || DATA.poem.intro || '',
    about: document.querySelector('#md-poem-about textarea')?.value || DATA.poem.about || '',
    structureNote: document.querySelector('#md-poem-structureNote textarea')?.value || DATA.poem.structureNote || ''
  };
  DATA.poem.aboutSections = collectAboutSections();
  save();
  toast('تم حفظ بيانات القصيدة', 'success');
}

function collectAboutSections() {
  return [...document.querySelectorAll('#aboutSectionsManager .about-manager-item')].map(el => ({
    id: el.dataset.id,
    title: el.querySelector('.as-title').value,
    eyebrow: el.querySelector('.as-eyebrow').value,
    content: el.querySelector('textarea').value
  }));
}

function renderAboutSectionsManager() {
  const wrap = document.getElementById('aboutSectionsManager');
  if (!wrap) return;
  const arr = DATA.poem?.aboutSections || [];
  wrap.innerHTML = arr.map((x, i) => `
    <div class="about-manager-item panel" data-id="${esc(x.id || uid('about'))}" style="margin-bottom:8px;padding:12px">
      <div class="two">
        <div class="field">
          <label>الوسم الصغير</label>
          <input class="as-eyebrow" value="${esc(x.eyebrow || '')}">
        </div>
        <div class="field">
          <label>العنوان الداخلي</label>
          <input class="as-title" value="${esc(x.title || '')}">
        </div>
      </div>
      <div class="field">
        <label>المحتوى — Markdown</label>
        <div class="md-editor">
          <textarea>${esc(x.content || '')}</textarea>
          <div class="md-preview">${mdPreviewHtml(x.content || '')}</div>
        </div>
      </div>
      <button class="btn danger" onclick="this.closest('.about-manager-item').remove()">حذف القسم</button>
    </div>
  `).join('');
}

function addAboutSection() {
  const wrap = document.getElementById('aboutSectionsManager');
  const id = uid('about');
  const el = document.createElement('div');
  el.className = 'about-manager-item panel';
  el.dataset.id = id;
  el.style.cssText = 'margin-bottom:8px;padding:12px';
  el.innerHTML = `
    <div class="two">
      <div class="field">
        <label>الوسم الصغير</label>
        <input class="as-eyebrow" value="">
      </div>
      <div class="field">
        <label>العنوان الداخلي</label>
        <input class="as-title" value="">
      </div>
    </div>
    <div class="field">
      <label>المحتوى — Markdown</label>
      <div class="md-editor">
        <textarea></textarea>
        <div class="md-preview"></div>
      </div>
    </div>
    <button class="btn danger" onclick="this.closest('.about-manager-item').remove()">حذف القسم</button>
  `;
  wrap.appendChild(el);
}

// ==================== الفصول ====================
function renderChapters() {
  document.getElementById('chaptersTable').innerHTML = chapters().map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(c.label)}</td>
      <td>${esc(c.title)}</td>
      <td>${esc(c.description || '')}</td>
      <td>
        <div class="row-actions">
          <button class="btn" onclick="editChapter(${i})">تعديل</button>
          <button class="btn danger" onclick="deleteItem('chapters',${i})">حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function newChapter() { editChapter(null); }

function editChapter(i) {
  const c = i === null ? { id: uid('chapter'), label: 'فصل جديد', title: '', description: '' } : chapters()[i];
  openModal(i === null ? 'إضافة فصل' : 'تعديل الفصل', `
    <div class="two">
      <div class="field">
        <label>الترتيب</label>
        <input id="f-num" value="${i === null ? chapters().length : c.id}">
      </div>
      <div class="field">
        <label>الاسم المختصر</label>
        <input id="f-label" value="${esc(c.label)}">
      </div>
    </div>
    <div class="field">
      <label>العنوان</label>
      <input id="f-title" value="${esc(c.title)}">
    </div>
    <div class="field">
      <label>الوصف — Markdown</label>
      <div id="md-c-desc"></div>
    </div>
    <button class="btn primary" onclick="saveChapter(${i === null ? 'null' : i})">حفظ</button>
  `);
  mdEditor('md-c-desc', c.description || '');
}

function saveChapter(i) {
  saveState();
  const c = {
    id: +document.getElementById('f-num').value,
    label: document.getElementById('f-label').value,
    title: document.getElementById('f-title').value,
    description: document.querySelector('#md-c-desc textarea')?.value || ''
  };
  if (i === null) DATA.chapters.push(c);
  else DATA.chapters[i] = c;
  closeModal();
  save();
  renderChapters();
  toast('تم حفظ الفصل', 'success');
}

// ==================== الأبيات ====================
function renderVerses() {
  const q = (document.getElementById('verseFilter')?.value || '').trim().toLowerCase();
  document.getElementById('versesTable').innerHTML = DATA.verses
    .filter(v => !q || `${v.first} ${v.second}`.toLowerCase().includes(q))
    .map((v, i) => `
      <tr>
        <td>${v.id}</td>
        <td>${esc(chapters()[v.chapter]?.label || v.chapter)}</td>
        <td>${esc(v.first)}</td>
        <td>${esc(v.second)}</td>
        <td><button class="btn" onclick="editVerse(${i})">تعديل</button></td>
      </tr>
    `).join('');
}

function newVerse() { editVerse(null); }

function editVerse(i) {
  const v = i === null ? {
    id: (DATA.verses.at(-1)?.id || 0) + 1,
    chapter: 0, first: '', second: '', text: '', glossary: [], overallMeaning: ''
  } : DATA.verses[i];
  openModal(i === null ? 'إضافة بيت' : 'تعديل البيت', `
    <div class="two">
      <div class="field">
        <label>رقم البيت</label>
        <input id="v-id" type="number" value="${v.id}">
      </div>
      <div class="field">
        <label>الفصل</label>
        <select id="v-ch">${chapters().map((c, j) => `<option value="${j}" ${j === v.chapter ? 'selected' : ''}>${esc(c.label)} — ${esc(c.title)}</option>`).join('')}</select>
      </div>
    </div>
    <div class="field">
      <label>الشطر الأول</label>
      <textarea id="v-first">${esc(v.first)}</textarea>
    </div>
    <div class="field">
      <label>الشطر الثاني</label>
      <textarea id="v-second">${esc(v.second)}</textarea>
    </div>
    <div class="field">
      <label>المعنى الإجمالي</label>
      <textarea id="v-meaning">${esc(v.overallMeaning || '')}</textarea>
    </div>
    <div class="field">
      <label>معاني الألفاظ — كل سطر: اللفظ | المعنى</label>
      <textarea id="v-gloss">${(v.glossary || []).map(g => `${(g.words || []).join('،')} | ${g.meaning || ''}`).join('\n')}</textarea>
    </div>
    <button class="btn primary" onclick="saveVerse(${i === null ? 'null' : i})">حفظ</button>
  `);
}

function saveVerse(i) {
  saveState();
  const g = document.getElementById('v-gloss').value.split('\n').map(x => x.trim()).filter(Boolean).map(x => {
    const p = x.split('|');
    return { words: p[0].split(/[،,]/).map(s => s.trim()).filter(Boolean), meaning: (p.slice(1).join('|') || '').trim() };
  });
  const v = {
    id: +document.getElementById('v-id').value,
    chapter: +document.getElementById('v-ch').value,
    first: document.getElementById('v-first').value,
    second: document.getElementById('v-second').value,
    text: document.getElementById('v-first').value + ' ' + document.getElementById('v-second').value,
    glossary: g,
    overallMeaning: document.getElementById('v-meaning').value
  };
  if (i === null) DATA.verses.push(v);
  else DATA.verses[i] = v;
  closeModal();
  save();
  renderVerses();
  toast('تم حفظ البيت', 'success');
}

// ==================== الشروح ====================
function renderExplanations() {
  const tbody = document.getElementById('explanationsTable');
  const q = norm(document.getElementById('explanationFilter')?.value || '');
  let lastChapter = null;
  const rows = [];
  (DATA.verses || []).forEach(v => {
    const chapter = byId('chapters', v.chapter);
    const exps = (DATA.explanations || []).filter(e => String(e.verseId) === String(v.id));
    const hay = norm([v.id, v.first, v.second, chapter?.label, chapter?.title, ...exps.map(e => byId('sources', e.sourceId)?.title || e.sourceId || '')].join(' '));
    if (q && !hay.includes(q)) return;
    if (chapter && chapter.id !== lastChapter) {
      rows.push('<tr class="chapter-row"><td colspan="3">' + esc(chapter.label || 'الفصل') + ' — ' + esc(chapter.title || '') + '</td></tr>');
      lastChapter = chapter.id;
    }
    let controls = '';
    if (exps.length) {
      const options = exps.map(e => {
        const src = byId('sources', e.sourceId);
        const preview = e.text ? (' — ' + e.text.slice(0, 55) + (e.text.length > 55 ? '…' : '')) : '';
        return '<option value="' + esc(e.id) + '">' + esc(src?.title || e.sourceId) + esc(preview) + '</option>';
      }).join('');
      controls = '<select class="explain-picker" id="exp-picker-' + v.id + '">' + options + '</select>' +
        '<button class="btn" onclick="editExplanationById(document.getElementById(\'exp-picker-' + v.id + '\').value)">تعديل المختار</button>';
    } else {
      controls = '<span class="no-explanation">لم يُضف شرح لهذا البيت بعد.</span>';
    }
    controls += '<button class="btn primary" onclick="addExplanationForVerse(' + v.id + ')">+ إضافة شرح</button>';
    const firstButton = exps.length ? '<button class="btn" onclick="editExplanationById(\'' + esc(exps[0].id) + '\')">فتح أول شرح</button>' : '';
    rows.push('<tr><td><div class="verse-linked"><strong>البيت ' + ar(v.id) + '</strong><div>' + esc(v.first || '') + '</div><div>' + esc(v.second || '') + '</div><small>' + (exps.length ? ar(exps.length) + ' شرح مرتبط' : 'لا توجد شروح مرتبطة بعد') + '</small></div></td><td><div class="explain-cell">' + controls + '</div></td><td><div class="explain-actions">' + firstButton + '</div></td></tr>');
  });
  tbody.innerHTML = rows.join('') || '<tr><td colspan="3" class="no-explanation">لا توجد نتائج.</td></tr>';
}

function newExplanation() { addExplanationForVerse(1); }

function addExplanationForVerse(verseId) {
  const e = { id: uid('exp'), verseId: Number(verseId), sourceId: sources()[0]?.id || '', text: '' };
  editExplanationObject(e, null);
}

function editExplanationById(id) {
  const i = (DATA.explanations || []).findIndex(e => String(e.id) === String(id));
  if (i >= 0) editExplanation(i);
}

function editExplanation(i) {
  const e = i === null ? { id: uid('exp'), verseId: 1, sourceId: sources()[0]?.id || '', text: '' } : DATA.explanations[i];
  editExplanationObject(e, i);
}

function editExplanationObject(e, i) {
  const title = i === null ? 'إضافة شرح' : 'تعديل الشرح';
  const deleteButton = i !== null ? '<button class="btn danger" onclick="deleteExplanation(' + i + ')">حذف الشرح</button>' : '';
  const body = '<div class="two"><div class="field"><label>البيت المرتبط</label><select id="e-v">' + verseOptions(e.verseId) + '</select></div><div class="field"><label>المصدر</label><select id="e-s">' + sourceOptions(e.sourceId) + '</select></div></div><div class="field"><label>نص الشرح — Markdown</label><div id="md-e-text"></div></div><div class="actions"><button class="btn primary" onclick="saveExplanation(' + (i === null ? 'null' : i) + ')">حفظ الشرح</button>' + deleteButton + '<button class="btn" onclick="closeModal()">إلغاء</button></div>';
  openModal(title, body);
  mdEditor('md-e-text', e.text || '');
}

function saveExplanation(i) {
  saveState();
  const e = {
    id: i === null ? uid('exp') : DATA.explanations[i].id,
    verseId: +document.getElementById('e-v').value,
    sourceId: document.getElementById('e-s').value,
    text: document.querySelector('#md-e-text textarea')?.value || ''
  };
  if (i === null) DATA.explanations.push(e);
  else DATA.explanations[i] = e;
  closeModal();
  save();
  renderExplanations();
  toast('تم حفظ الشرح', 'success');
}

function deleteExplanation(i) {
  if (!confirm('حذف هذا الشرح؟')) return;
  saveState();
  DATA.explanations.splice(i, 1);
  closeModal();
  save();
  renderExplanations();
  toast('تم حذف الشرح', 'success');
}

// ==================== المصادر ====================
function renderSources() {
  document.getElementById('sourcesTable').innerHTML = sources().map((s, i) => {
    const a = authorById(s.authorId, s.author);
    return `<tr>
      <td><strong>${esc(s.title)}</strong><div class="hint">${esc(s.slug || '')}</div></td>
      <td class="source-cover-cell">${s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy">` : '—'}</td>
      <td>${a ? `<button class="author-mini" onclick="showAuthor(${JSON.stringify(a.id)})">${esc(a.name)}</button>` : esc(s.author || '')}</td>
      <td><span class="chip">${esc(s.type)}</span><span class="chip">${esc(s.section)}</span></td>
      <td>
        <button class="btn" onclick="editSource(${i})">تعديل</button>
        <button class="btn danger" onclick="deleteItem('sources',${i})">حذف</button>
      </td>
    </tr>`;
  }).join('');
}

function authorById(id, name) {
  if (id) return (DATA.authors || []).find(a => String(a.id) === String(id)) || null;
  return (DATA.authors || []).find(a => norm(a.name) === norm(name || '')) || null;
}

function showAuthor(id) {
  toast('صفحة المؤلف في الموقع العام ستستخدم هذا المؤلف: ' + (authorById(id)?.name || ''), 'info');
}

function newSource() { editSource(null); }

function editSource(i) {
  const s = i === null ? {
    id: uid('src'), title: '', type: 'مقروءة', section: 'شروح', topic: '', description: '',
    author: '', authorId: '', url: '#', cover: '', slug: '', format: 'pdf', bio: ''
  } : sources()[i];
  const sections = DATA.sourceSections || ['شروح', 'دراسات ومقالات', 'مخطوطات وطبعات', 'إنشاد البُردة', 'أعمال على البُردة', 'مرئية', 'مسموعة'];
  openModal(i === null ? 'إضافة مصدر' : 'تعديل المصدر', `
    <div class="two">
      <div class="field">
        <label>العنوان</label>
        <input id="s-title" value="${esc(s.title)}">
      </div>
      <div class="field">
        <label>النوع</label>
        <select id="s-type">${['مقروءة', 'مرئية', 'مسموعة'].map(x => `<option ${x === s.type ? 'selected' : ''}>${x}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>القسم</label>
        <select id="s-section">${sections.map(x => `<option ${x === s.section ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>المؤلف</label>
        <select id="s-authorId">
          <option value="">بدون ربط</option>
          ${(DATA.authors || []).map(a => `<option value="${esc(a.id)}" ${a.id === s.authorId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field">
      <label>الوصف — Markdown</label>
      <div id="md-s-desc"></div>
    </div>
    <div class="field">
      <label>المحتوى — Markdown</label>
      <div id="md-s-bio"></div>
    </div>
    <div class="field">
      <label>رابط المصدر</label>
      <input id="s-url" value="${esc(s.url || '#')}">
    </div>
    <div class="field">
      <label>صورة الغلاف</label>
      <input id="s-coverFile" type="file" accept="image/*">
      <div class="image-preview" id="s-cover-preview">${s.cover ? `<img src="${esc(s.cover)}" alt=""><span>الصورة الحالية</span>` : ''}</div>
    </div>
    <button class="btn primary" onclick="saveSource(${i === null ? 'null' : i})">حفظ</button>
  `);
  mdEditor('md-s-desc', s.description || '');
  mdEditor('md-s-bio', s.bio || '');
  document.getElementById('s-coverFile').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const p = document.getElementById('s-cover-preview');
      p.innerHTML = `<img src="${esc(r.result)}" alt=""><span>${esc(f.name)}</span>`;
      p.dataset.data = r.result;
    };
    r.readAsDataURL(f);
  };
}

function saveSource(i) {
  saveState();
  const s = {
    id: i === null ? uid('src') : sources()[i].id,
    title: document.getElementById('s-title').value,
    type: document.getElementById('s-type').value,
    section: document.getElementById('s-section').value,
    authorId: document.getElementById('s-authorId').value,
    description: document.querySelector('#md-s-desc textarea')?.value || '',
    bio: document.querySelector('#md-s-bio textarea')?.value || '',
    url: document.getElementById('s-url').value,
    cover: document.getElementById('s-cover-preview').dataset.data || sources()[i]?.cover || ''
  };
  if (i === null) DATA.sources.push(s);
  else DATA.sources[i] = s;
  closeModal();
  save();
  renderSources();
  toast('تم حفظ المصدر', 'success');
}

// ==================== المؤلفون ====================
function renderAuthors() {
  const rows = DATA.authors || [];
  document.getElementById('authorsTable').innerHTML = rows.map((a, i) => {
    const count = (DATA.sources || []).filter(s => String(s.authorId) === String(a.id) || (s.author && !s.authorId && norm(s.author) === norm(a.name))).length;
    return `<tr>
      <td><strong>${esc(a.name)}</strong></td>
      <td>${esc((a.bio || '').slice(0, 140))}${(a.bio || '').length > 140 ? '…' : ''}</td>
      <td>${ar(count)}</td>
      <td>
        <button class="btn" onclick="editAuthor(${i})">تعديل</button>
        <button class="btn danger" onclick="deleteItem('authors',${i})">حذف</button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="muted">لا يوجد مؤلفون بعد.</td></tr>';
}

function newAuthor() { editAuthor(null); }

function editAuthor(i) {
  const a = i === null ? { id: uid('author'), name: '', subtitle: '', birth: '', death: '', bio: '', image: '' } : DATA.authors[i];
  openModal(i === null ? 'إضافة مؤلف' : 'تعديل المؤلف', `
    <div class="two">
      <div class="field">
        <label>اسم المؤلف</label>
        <input id="au-name" value="${esc(a.name)}">
      </div>
      <div class="field">
        <label>وصف مختصر</label>
        <input id="au-subtitle" value="${esc(a.subtitle || '')}">
      </div>
      <div class="field">
        <label>الميلاد</label>
        <input id="au-birth" value="${esc(a.birth || '')}">
      </div>
      <div class="field">
        <label>الوفاة</label>
        <input id="au-death" value="${esc(a.death || '')}">
      </div>
    </div>
    <div class="field">
      <label>التعريف — Markdown</label>
      <div id="md-au-bio"></div>
    </div>
    <div class="field">
      <label>صورة المؤلف</label>
      <input id="au-imageFile" type="file" accept="image/*">
      <div class="image-preview" id="au-image-preview">${a.image ? `<img src="${esc(a.image)}" alt=""><span>الصورة الحالية</span>` : ''}</div>
    </div>
    <button class="btn primary" onclick="saveAuthor(${i === null ? 'null' : i})">حفظ</button>
  `);
  mdEditor('md-au-bio', a.bio || '');
  document.getElementById('au-imageFile').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const p = document.getElementById('au-image-preview');
      p.innerHTML = `<img src="${esc(r.result)}" alt=""><span>${esc(f.name)}</span>`;
      p.dataset.data = r.result;
    };
    r.readAsDataURL(f);
  };
}

function saveAuthor(i) {
  saveState();
  const a = {
    id: i === null ? uid('author') : DATA.authors[i].id,
    name: document.getElementById('au-name').value,
    subtitle: document.getElementById('au-subtitle').value,
    birth: document.getElementById('au-birth').value,
    death: document.getElementById('au-death').value,
    bio: document.querySelector('#md-au-bio textarea')?.value || '',
    image: document.getElementById('au-image-preview').dataset.data || DATA.authors[i]?.image || ''
  };
  if (i === null) DATA.authors.push(a);
  else DATA.authors[i] = a;
  closeModal();
  save();
  renderAuthors();
  toast('تم حفظ المؤلف', 'success');
}

// ==================== المعجم ====================
function renderDictionary() {
  const rows = [];
  (DATA.glossary || []).forEach((g, i) => rows.push({ i, word: g.term, meaning: g.meaning, verses: g.verseIds || [] }));
  document.getElementById('dictionaryTable').innerHTML = rows.map(x => `
    <tr>
      <td>${esc(x.word)}</td>
      <td>${esc(x.meaning)}</td>
      <td>${x.verses.join(', ')}</td>
      <td>
        <button class="btn" onclick="editTerm(${x.i})">تعديل</button>
        <button class="btn danger" onclick="deleteItem('glossary',${x.i})">حذف</button>
      </td>
    </tr>
  `).join('');
}

function newTerm() { editTerm(null); }

function editTerm(i) {
  const g = i === null ? { id: uid('term'), term: '', normalized: '', meaning: '', verseIds: [] } : DATA.glossary[i];
  openModal(i === null ? 'إضافة لفظ' : 'تعديل اللفظ', `
    <div class="two">
      <div class="field">
        <label>اللفظ</label>
        <input id="g-term" value="${esc(g.term)}">
      </div>
      <div class="field">
        <label>الصيغة المعيارية</label>
        <input id="g-norm" value="${esc(g.normalized || g.term)}">
      </div>
    </div>
    <div class="field">
      <label>المعنى — Markdown</label>
      <div id="md-g-meaning"></div>
    </div>
    <div class="field">
      <label>أرقام الأبيات — مفصولة بفاصلة</label>
      <input id="g-verses" value="${(g.verseIds || []).join(', ')}">
    </div>
    <button class="btn primary" onclick="saveTerm(${i === null ? 'null' : i})">حفظ</button>
  `);
  mdEditor('md-g-meaning', g.meaning || '');
}

function saveTerm(i) {
  saveState();
  const g = {
    id: i === null ? uid('term') : DATA.glossary[i].id,
    term: document.getElementById('g-term').value,
    normalized: document.getElementById('g-norm').value,
    meaning: document.querySelector('#md-g-meaning textarea')?.value || '',
    verseIds: document.getElementById('g-verses').value.split(',').map(x => +x.trim()).filter(Boolean)
  };
  if (i === null) DATA.glossary.push(g);
  else DATA.glossary[i] = g;
  closeModal();
  save();
  renderDictionary();
  toast('تم حفظ اللفظ', 'success');
}

// ==================== مواضيع ومقالات ====================
function renderExtra() {
  document.getElementById('topicsTable').innerHTML = (DATA.topics || []).map((x, i) => `
    <div class="card" style="margin-bottom:7px">
      <strong style="font-size:14px">${esc(x.title)}</strong>
      <span>${esc(x.description || '')}</span>
      <button class="btn" onclick="editTopic(${i})">تعديل</button>
    </div>
  `).join('');
  document.getElementById('articlesTable').innerHTML = (DATA.articles || []).map((x, i) => `
    <div class="card" style="margin-bottom:7px">
      <strong style="font-size:14px">${esc(x.title)}</strong>
      <span>${esc(x.excerpt || '')}</span>
      <button class="btn" onclick="editArticle(${i})">تعديل</button>
    </div>
  `).join('');
}

function newTopic() { editTopic(null); }

function editTopic(i) {
  const x = i === null ? { id: uid('topic'), title: '', description: '' } : DATA.topics[i];
  openModal('موضوع', `
    <div class="field">
      <label>العنوان</label>
      <input id="t-title" value="${esc(x.title)}">
    </div>
    <div class="field">
      <label>الوصف</label>
      <textarea id="t-desc">${esc(x.description || '')}</textarea>
    </div>
    <button class="btn primary" onclick="saveTopic(${i === null ? 'null' : i})">حفظ</button>
  `);
}

function saveTopic(i) {
  saveState();
  const x = {
    id: i === null ? uid('topic') : DATA.topics[i].id,
    title: document.getElementById('t-title').value,
    description: document.getElementById('t-desc').value
  };
  if (i === null) DATA.topics.push(x);
  else DATA.topics[i] = x;
  closeModal();
  save();
  renderExtra();
  toast('تم حفظ الموضوع', 'success');
}

function newArticle() { editArticle(null); }

function editArticle(i) {
  const x = i === null ? { id: uid('article'), title: '', type: 'دراسة ومقال', excerpt: '', status: 'مسودة' } : DATA.articles[i];
  openModal('مقال', `
    <div class="field">
      <label>العنوان</label>
      <input id="a-title" value="${esc(x.title)}">
    </div>
    <div class="field">
      <label>النوع</label>
      <input id="a-type" value="${esc(x.type || '')}">
    </div>
    <div class="field">
      <label>المختصر</label>
      <textarea id="a-excerpt">${esc(x.excerpt || '')}</textarea>
    </div>
    <button class="btn primary" onclick="saveArticle(${i === null ? 'null' : i})">حفظ</button>
  `);
}

function saveArticle(i) {
  saveState();
  const x = {
    id: i === null ? uid('article') : DATA.articles[i].id,
    title: document.getElementById('a-title').value,
    type: document.getElementById('a-type').value,
    excerpt: document.getElementById('a-excerpt').value
  };
  if (i === null) DATA.articles.push(x);
  else DATA.articles[i] = x;
  closeModal();
  save();
  renderExtra();
  toast('تم حفظ المقال', 'success');
}

// ==================== حذف العناصر ====================
function deleteItem(arr, i) {
  if (confirm('حذف هذا العنصر؟')) {
    saveState();
    DATA[arr].splice(i, 1);
    save();
    renderAll();
    toast('تم حذف العنصر', 'success');
  }
}

// ==================== الإعدادات ====================
function renderSettings() {
  const s = DATA.site || {}, seo = s.seo || {};
  document.getElementById('siteName').value = s.name || 'موسوعة البُردة';
  mdEditor('md-siteDescription', s.description || '', v => {});
  document.querySelector('#md-siteDescription textarea').value = s.description || '';
  document.getElementById('siteUrl').value = s.url || '';
  for (const [id, val] of [
    ['seoTitle', seo.title || ''],
    ['seoDescription', seo.description || s.description || ''],
    ['seoKeywords', seo.keywords || ''],
    ['seoOgImage', seo.ogImage || ''],
    ['seoThemeColor', seo.themeColor || '#23624f'],
    ['seoGoogleVerification', seo.googleVerification || ''],
    ['seoBingVerification', seo.bingVerification || ''],
    ['seoDefaultAuthor', seo.defaultAuthor || s.name || '']
  ]) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  document.getElementById('seoIndex').checked = seo.index !== false;
  document.getElementById('seoFollow').checked = seo.follow !== false;
  document.getElementById('seoSitemap').checked = seo.sitemap !== false;
  document.getElementById('seoCanonical').checked = seo.canonical !== false;
}

function saveSettings() {
  saveState();
  const s = { ...(DATA.site || {}) };
  s.name = document.getElementById('siteName').value;
  s.description = document.querySelector('#md-siteDescription textarea')?.value || '';
  s.url = document.getElementById('siteUrl').value;
  s.seo = {
    title: document.getElementById('seoTitle').value,
    description: document.getElementById('seoDescription').value,
    keywords: document.getElementById('seoKeywords').value,
    ogImage: document.getElementById('seoOgImage').value,
    themeColor: document.getElementById('seoThemeColor').value,
    googleVerification: document.getElementById('seoGoogleVerification').value,
    bingVerification: document.getElementById('seoBingVerification').value,
    defaultAuthor: document.getElementById('seoDefaultAuthor').value,
    index: document.getElementById('seoIndex').checked,
    follow: document.getElementById('seoFollow').checked,
    sitemap: document.getElementById('seoSitemap').checked,
    canonical: document.getElementById('seoCanonical').checked
  };
  DATA.site = s;
  save();
  toast('تم حفظ إعدادات الموقع وSEO', 'success');
}

// ==================== بناء الموقع ====================
function template() {
  return new TextDecoder().decode(Uint8Array.from(atob(TEMPLATE_B64), c => c.charCodeAt(0)));
}

function getPublicCss() {
  try {
    const sheet = document.getElementById('publicSiteCss')?.sheet;
    if (sheet?.cssRules?.length) return [...sheet.cssRules].map(r => r.cssText).join('');
  } catch (e) {}
  const h = template();
  return (h.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
}

function buildSite(route) {
  let h = template();
  h = h.replace(/<style>[\s\S]*?<\/style>/, `<style>${getPublicCss()}</style>`);
  h = h.replace(/const BURDA_DATA=.*?;\nconst state=/s, 'const BURDA_DATA=' + JSON.stringify(DATA) + ';\nconst state=');
  h = h.replace('<title>البُردة — موسوعة الإمام البوصيري</title>', `<title>${esc((route && route.title) || DATA.site?.seo?.title || DATA.site?.name || 'البُردة — موسوعة الإمام البوصيري')}</title>`);
  return h;
}

function staticCssAndJs() {
  const h = buildSite();
  const css = (h.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  let js = (h.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
  js = js.replace(/const BURDA_DATA=.*?;\nconst state=/s, 'const BURDA_DATA=window.BURDA_DATA;\nconst state=');
  return { h, css, js };
}

function safeSlug(s) {
  return norm(s).replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]+/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function mimeExt(data) {
  const m = String(data || '').match(/^data:([^;]+);base64,/);
  if (!m) return 'bin';
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' })[m[1]] || 'bin';
}

// ==================== ضغط الصور ====================
function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ==================== بناء HTML ثابت ====================
async function buildStaticHtml(route) {
  const { css, js } = staticCssAndJs();
  const data = clone(DATA);
  const files = {};
  const assetMap = new Map();
  const depth = String(route?.path || '').split('/').filter(Boolean).length;
  const assetBase = depth ? '../'.repeat(depth) : '';

  // ضغط الصور
  const walk = async (obj, path = []) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) await walk(obj[i], path.concat(i));
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && v.startsWith('data:image/')) {
        const compressed = await compressImage(v);
        const id = (obj.id || path.join('-') || 'asset');
        const p = `assets/images/${safeSlug(String(id))}.${mimeExt(compressed)}`;
        files[p] = compressed;
        assetMap.set(v, assetBase + p);
        obj[k] = assetBase + p;
      } else if (typeof v === 'object') {
        await walk(v, path.concat(k));
      }
    }
  };

  await walk(data);

  // استبدال الصور المضغوطة
  let dataStr = JSON.stringify(data);
  for (const [original, compressed] of assetMap) {
    dataStr = dataStr.split(original).join(compressed);
  }

  // بناء HTML
  let h = template();
  h = h.replace(/<style>[\s\S]*?<\/style>/, `<style>${css}</style>`);
  h = h.replace(/const BURDA_DATA=.*?;\nconst state=/s, 'const BURDA_DATA=' + dataStr + ';\nconst state=');
  h = h.replace('<title>البُردة — موسوعة الإمام البوصيري</title>', `<title>${esc((route && route.title) || DATA.site?.seo?.title || DATA.site?.name || 'البُردة — موسوعة الإمام البوصيري')}</title>`);

  // إضافة Schema.org
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": DATA.site?.name || 'موسوعة البُردة',
    "description": DATA.site?.description || '',
    "url": DATA.site?.url || ''
  };
  h = h.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`);

  return { html: h, files, css, js };
}

// ==================== التصدير ====================
async function exportStatic() {
  toast('جارٍ التصدير...', 'info');
  try {
    const { html, files } = await buildStaticHtml({ path: '' });

    // إنشاء ZIP
    const JSZip = window.JSZip;
    if (!JSZip) {
      toast('يرجى تحميل مكتبة JSZip أولاً', 'error');
      return;
    }

    const zip = new JSZip();
    zip.file('index.html', html);

    for (const [path, content] of Object.entries(files)) {
      const base64 = content.split(',')[1];
      zip.file(path, base64, { base64: true });
    }

    // إضافة ملفات إضافية
    zip.file('robots.txt', 'User-agent: *\nAllow: /\nSitemap: sitemap.xml');
    zip.file('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>' + (DATA.site?.url || '') + '</loc></url>\n</urlset>');

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'burdah-static-site.zip';
    a.click();
    URL.revokeObjectURL(url);

    toast('تم التصدير بنجاح', 'success');
  } catch (err) {
    toast('خطأ في التصدير: ' + err.message, 'error');
  }
}

// ==================== تهيئة ====================
document.querySelectorAll('.nav button').forEach(b => b.onclick = () => show(b.dataset.view));
document.getElementById('saveBtn').onclick = () => { saveState(); save(); toast('تم الحفظ', 'success'); };
document.getElementById('importBtn').onclick = () => document.getElementById('fileInput').click();
document.getElementById('fileInput').onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      saveState();
      DATA = ensureSchema(JSON.parse(r.result));
      save();
      renderAll();
      toast('تم استيراد البيانات بنجاح', 'success');
    } catch (err) {
      toast('ملف JSON غير صالح', 'error');
    }
  };
  r.readAsText(f, 'utf-8');
};
document.getElementById('resetBtn').onclick = () => {
  if (confirm('استعادة البيانات المحفوظة حاليًا من LocalStorage؟')) {
    DATA = load();
    renderAll();
    toast('تم استعادة البيانات', 'success');
  }
};

// أزرار Undo/Redo
document.getElementById('undoBtn').onclick = undo;
document.getElementById('redoBtn').onclick = redo;

// اختصارات لوحة المفاتيح
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
  if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveState(); save(); toast('تم الحفظ', 'success'); }
});

// حفظ الإصدار عند التحميل
saveVersion();

// بدء التطبيق
const initialView = location.hash.slice(1);
show(titles[initialView] ? initialView : 'dashboard');
renderAll();
