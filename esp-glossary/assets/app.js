(function () {
  // [code, 短名, 全名, 顏色變數]
  var DEPTS = [
    ['商設', '商設', '商業設計（視覺傳達）', 'bd'],
    ['工設', '工設', '工業設計（電腦輔助產品設計）', 'id'],
    ['科藝', '創科・科藝', '創科系（科技藝術、互動設計）', 'ta'],
    ['造形', '創科・造形', '創科系（造形原理）', 'fm'],
    ['數媒', '數媒', '數位多媒體設計系', 'dm']
  ];
  var LABEL = {}, VAR = {};
  DEPTS.forEach(function (d) { LABEL[d[0]] = d[1]; VAR[d[0]] = d[3]; });
  var terms = (window.TERMS || []).slice();
  terms.forEach(function (t, i) { t.no = ('00' + (i + 1)).slice(-3); });
  var state = { q: '', dept: '' };
  var countBy = {}; terms.forEach(function (t) { t.depts.forEach(function (d) { countBy[d] = (countBy[d] || 0) + 1; }); });

  function letterOf(t) { var c = t.en.charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '0–9'; }
  // 每個字母固定一個顏色：A 青綠、B 靛藍、C 葉綠、D 芥末、E 深藍、F 湖水……依序循環
  function lc(L) { return 'L' + (L === '0–9' ? 5 : (L.charCodeAt(0) - 65) % 6); }
  function cvar(code) { return 'var(--c-' + VAR[code] + ')'; }
  function civar(code) { return 'var(--c-' + VAR[code] + '-ink)'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hi(s, q) {
    var safe = esc(s); if (!q) return safe;
    var re = new RegExp('(' + esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  }

  // 系別按鈕
  var chips = document.getElementById('chips');
  function setDept(code) {
    state.dept = code;
    Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.dataset.code === code ? 'true' : 'false'); });
    render();
  }
  [['', '全部']].concat(DEPTS).forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.code = d[0];
    if (d[0]) { b.style.setProperty('--c', cvar(d[0])); b.style.setProperty('--ci', civar(d[0])); }
    b.innerHTML = esc(d[1]) + '<span class="n">' + (d[0] ? countBy[d[0]] : terms.length) + '</span>';
    b.setAttribute('aria-pressed', d[0] === '' ? 'true' : 'false');
    b.addEventListener('click', function () { setDept(d[0]); });
    chips.appendChild(b);
  });

  // [03] 系別清單
  var dl = document.getElementById('deptList');
  dl.innerHTML = DEPTS.map(function (d, i) {
    return '<li style="--c:' + cvar(d[0]) + ';--ci:' + civar(d[0]) + '"><span class="no">0' + (i + 1) + '</span>' +
      '<span><strong>' + esc(d[1]) + '</strong><span class="full">' + esc(d[2]) + '</span></span>' +
      '<button type="button" data-code="' + d[0] + '">只看這系 →</button></li>';
  }).join('');
  dl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    setDept(b.dataset.code);
    document.getElementById('glossary').scrollIntoView();
  });

  var input = document.getElementById('q');
  input.addEventListener('input', function () { state.q = input.value.trim(); render(); });

  function focusSearch() { document.getElementById('glossary').scrollIntoView(); setTimeout(function () { input.focus(); }, 50); }
  document.getElementById('openSearch').addEventListener('click', focusSearch);
  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); focusSearch(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); focusSearch(); }
    else if (e.altKey && e.code === 'KeyG') { e.preventDefault(); document.body.classList.toggle('show-grid'); }
    else if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; state.q = ''; render(); input.blur(); }
  });

  function match(t) {
    if (state.dept && t.depts.indexOf(state.dept) < 0) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    return [t.en, t.abbr || '', t.zh, t.ex].some(function (f) { return f.toLowerCase().indexOf(q) >= 0; });
  }

  function render() {
    var list = document.getElementById('list');
    var shown = terms.filter(match);
    var groups = {}, order = [];
    shown.forEach(function (t) { var L = letterOf(t); if (!groups[L]) { groups[L] = []; order.push(L); } groups[L].push(t); });
    var html = '';
    order.forEach(function (L) {
      html += '<div class="' + lc(L) + '"><h3 class="section-letter" id="sec-' + (L === '0–9' ? 'num' : L) + '"><span class="blob' + (L === '0–9' ? ' num' : '') + '">' + L + '</span></h3>';
      groups[L].forEach(function (t) {
        var d0 = state.dept || t.depts[0];
        html += '<article class="entry" style="--d:' + cvar(d0) + '"><p class="idx mono">' + t.no + '</p>' +
          '<div class="main"><div class="hw"><h4 class="en">' + hi(t.en, state.q) + '</h4>' +
          (t.abbr ? '<span class="abbr">' + hi(t.abbr, state.q) + '</span>' : '') + '</div>' +
          '<p class="zh"><span class="br">[</span>' + hi(t.zh, state.q) + '<span class="br">]</span></p><p class="ex">' + hi(t.ex, state.q) + '</p></div>' +
          '<aside class="margin"><span class="lbl mono">系別</span>' +
          '<div class="tags">' + t.depts.map(function (d) { return '<span class="tag t-' + d + '">' + LABEL[d] + '</span>'; }).join('') + '</div>' +
          '<a href="' + esc(t.link) + '" target="_blank" rel="noopener">樂詞網查詢 ↗</a>' +
          (t.note ? '<p class="note-c">' + esc(t.note) + '</p>' : '') + '</aside></article>';
      });
      html += '</div>';
    });
    list.innerHTML = html;
    document.getElementById('count').textContent = (state.q || state.dept) ? '→ 符合 ' + shown.length + ' / ' + terms.length : '→ 共 ' + terms.length;
    document.getElementById('empty').hidden = shown.length > 0;
    var all = ['0–9'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    document.getElementById('letters').innerHTML = all.map(function (L) {
      var id = L === '0–9' ? 'num' : L;
      return groups[L] ? '<a class="' + lc(L) + '" href="#sec-' + id + '">' + L + '</a>' : '<span aria-hidden="true">' + L + '</span>';
    }).join('');
  }

  var tot = document.getElementById('total'); if (tot) tot.textContent = terms.length;
  render();
})();
