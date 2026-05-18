// =============================================================================
// app.js — Clientela · Lógica de UI del modo desarrollador
// =============================================================================

const EJEMPLO_PDF = 'Customer1 Laptop Technology 3000 1 10;Customer2 Shirt Clothing 50 2 12;Customer1 Mouse Technology 100 1 15;Customer2 Shoes Clothing 200 1 20;Customer3 TV Technology 2500 1 25';

const icon = window.Icons ? window.Icons.icon : ((n, s) => '');

let chartActual = null;
let catChartActual = null;

// ============================================================================
// Formato
// ============================================================================
const NF_NUM = new Intl.NumberFormat('es-CO');
const NF_MONEY = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function fmtNum(n) { return NF_NUM.format(Math.round(+n || 0)); }
function fmtMoney(n) { return NF_MONEY.format(Math.round(+n || 0)); }

// ============================================================================
// Tema (light/dark) con SVG sun/moon
// ============================================================================
function temaInicial() {
  const guardado = localStorage.getItem('tema');
  if (guardado) return guardado;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem('tema', tema);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.innerHTML = tema === 'dark' ? icon('sun', 18) : icon('moon', 18);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = tema === 'dark' ? '#0F1117' : '#F8FAFC';

  if (chartActual || catChartActual) {
    const out = document.getElementById('output').textContent;
    const entrada = document.getElementById('inputCaso').value;
    if (out) { renderGrafico(out); renderGraficoCategorias(entrada); }
  }
}

// ============================================================================
// Toast
// ============================================================================
let toastTimer = null;
function toast(mensaje, tipo) {
  const t = document.getElementById('toast');
  const ico = tipo === 'success' ? icon('check-circle', 16) : tipo === 'error' ? icon('x-circle', 16) : icon('info', 16);
  t.innerHTML = ico + '<span>' + escapeHtml(mensaje) + '</span>';
  t.className = 'toast ' + (tipo || '') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ============================================================================
// Tabs
// ============================================================================
function inicializarTabs() {
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
    });
  });
}

// ============================================================================
// Análisis
// ============================================================================
function analizar() {
  const entrada = document.getElementById('inputCaso').value.trim();
  if (!entrada) { toast('Pega un caso o usa el ejemplo del enunciado', 'error'); return; }

  try {
    const t0 = performance.now();
    const salida = calcularPedidos(entrada);
    const t1 = performance.now();

    document.getElementById('output').textContent = salida;
    renderResumen(entrada, salida, t1 - t0);
    renderTabla(salida);
    renderGrafico(salida);
    renderGraficoCategorias(entrada);
    toast('Análisis completado en ' + (t1 - t0).toFixed(2) + ' ms', 'success');
    document.querySelector('.tabs button[data-panel="analisis"]').click();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ----------------------------------------------------------------------------
// KPIs re-jerarquizados: 1 hero (Volumen total) + 3 normales + 2 small
// ----------------------------------------------------------------------------
function renderResumen(entrada, salida, ms) {
  const records = Parser.parsearCaso(entrada);
  const nClientes = salida ? salida.split('\n').length : 0;
  const totalGastado = records.reduce((s, r) => s + r.price * r.quantity, 0);
  const cats = new Set(records.map(r => r.category));
  const ticketMedio = records.length ? totalGastado / records.length : 0;

  document.getElementById('metrics').innerHTML = `
    <div class="metric hero">
      <div class="label">${icon('dollar-sign', 14)} Volumen total</div>
      <div class="value tnum">${fmtMoney(totalGastado)}</div>
      <div class="sublabel">${fmtNum(records.length)} transacciones · suma de price × quantity</div>
    </div>
    <div class="metric normal">
      <div class="label">${icon('users', 14)} Clientes</div>
      <div class="value tnum">${fmtNum(nClientes)}</div>
      <div class="sublabel">en el ranking final</div>
    </div>
    <div class="metric normal">
      <div class="label">${icon('tag', 14)} Categorías</div>
      <div class="value tnum">${fmtNum(cats.size)}</div>
      <div class="sublabel">distintas en el caso</div>
    </div>
    <div class="metric normal">
      <div class="label">${icon('credit-card', 14)} Ticket medio</div>
      <div class="value tnum">${fmtMoney(ticketMedio)}</div>
      <div class="sublabel">por transacción</div>
    </div>
    <div class="metric small">
      <div class="label">${icon('package', 14)} Records</div>
      <div class="value tnum">${fmtNum(records.length)}</div>
      <div class="sublabel">procesados</div>
    </div>
    <div class="metric small">
      <div class="label">${icon('timer', 14)} Tiempo</div>
      <div class="value tnum">${ms.toFixed(2)} <span style="font-size:14px; color:var(--text-muted); font-weight:500;">ms</span></div>
      <div class="sublabel">end-to-end</div>
    </div>
  `;
}

function renderTabla(salida) {
  if (!salida) {
    document.getElementById('rankingTabla').innerHTML = '';
    return;
  }
  const lineas = salida.split('\n');
  const filas = lineas.map((linea, idx) => {
    const m = linea.match(/^(\d+)\) (\S+) (\d+) (.+)$/);
    if (!m) return '';
    const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
    return `<tr>
      <td><span class="rank-badge ${rankClass} tnum">${m[1]}</span></td>
      <td><strong>${escapeHtml(m[2])}</strong></td>
      <td class="tnum">${fmtMoney(+m[3])}</td>
      <td><span class="chip accent">${escapeHtml(m[4])}</span></td>
    </tr>`;
  }).join('');
  document.getElementById('rankingTabla').innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Total gastado</th><th>Categoría favorita</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ============================================================================
// Gráficos (sin gradientes; usan el color de marca sólido)
// ============================================================================
function paletaSolida(n) {
  // Variaciones de tono del color de marca (#2563EB) en HSL.
  // Hue base ≈ 220, sat 80%, lightness variable.
  return Array.from({ length: n }, (_, i) => {
    const lightness = 50 + (i % 5) * 7;
    return `hsl(220, 80%, ${lightness}%)`;
  });
}

function getChartColors() {
  const tema = document.documentElement.dataset.theme;
  return {
    text: tema === 'dark' ? '#94a3b8' : '#475569',
    grid: tema === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
    bg: tema === 'dark' ? '#1F232D' : '#FFFFFF',
  };
}

function renderGrafico(salida) {
  if (!salida || typeof Chart === 'undefined') return;
  const lineas = salida.split('\n').slice(0, 12);
  const labels = [], data = [], cats = [];
  for (const ln of lineas) {
    const m = ln.match(/^\d+\) (\S+) (\d+) (.+)$/);
    if (!m) continue;
    labels.push(m[1]); data.push(+m[2]); cats.push(m[3]);
  }
  const colors = getChartColors();
  const ctx = document.getElementById('chartCanvas');
  if (chartActual) chartActual.destroy();
  chartActual = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Total gastado', data, backgroundColor: '#2563EB', borderRadius: 6, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.bg, borderColor: 'rgba(37,99,235,0.4)', borderWidth: 1,
          titleColor: '#0F172A', bodyColor: '#0F172A',
          padding: 12, cornerRadius: 8, titleFont: { weight: '700' },
          callbacks: {
            label: (ctx) => '  ' + fmtMoney(ctx.parsed.y),
            afterLabel: (ctx) => '  Categoría: ' + cats[ctx.dataIndex],
          },
        },
      },
      scales: {
        x: { ticks: { color: colors.text, font: { weight: '600' } }, grid: { display: false } },
        y: { ticks: { color: colors.text, callback: v => fmtMoney(v) }, grid: { color: colors.grid } },
      },
    },
  });

  // Insight automático
  const total = data.reduce((s, v) => s + v, 0);
  if (data.length > 0) {
    const top1Pct = ((data[0] / total) * 100).toFixed(1);
    const top3 = data.slice(0, 3).reduce((s, v) => s + v, 0);
    const top3Pct = ((top3 / total) * 100).toFixed(0);
    const ins = document.getElementById('insightTop');
    ins.hidden = false;
    ins.innerHTML = `${icon('sparkles', 16)}<span><strong>${escapeHtml(labels[0])}</strong> representa el <strong>${top1Pct}%</strong> del gasto entre los visibles. Los 3 primeros suman el <strong>${top3Pct}%</strong>.</span>`;
  }
}

function renderGraficoCategorias(entrada) {
  if (typeof Chart === 'undefined') return;
  const records = Parser.parsearCaso(entrada);
  const porCat = new Map();
  for (const r of records) {
    porCat.set(r.category, (porCat.get(r.category) || 0) + r.price * r.quantity);
  }
  const ordenadas = [...porCat.entries()].sort((a, b) => b[1] - a[1]);
  const labels = ordenadas.map(e => e[0]);
  const data = ordenadas.map(e => e[1]);
  const colors = getChartColors();
  const ctx = document.getElementById('catChart');
  if (catChartActual) catChartActual.destroy();
  catChartActual = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: paletaSolida(labels.length), borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { position: 'right', labels: { color: colors.text, font: { weight: '600' }, padding: 12, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          backgroundColor: colors.bg,
          titleColor: '#0F172A', bodyColor: '#0F172A',
          padding: 12, cornerRadius: 8,
          callbacks: { label: (ctx) => '  ' + fmtMoney(ctx.parsed) },
        },
      },
    },
  });

  // Insight automático
  if (data.length > 0) {
    const total = data.reduce((s, v) => s + v, 0);
    const top = data[0];
    const topPct = ((top / total) * 100).toFixed(1);
    const ins = document.getElementById('insightCats');
    ins.hidden = false;
    let extra = '';
    if (+topPct >= 60) extra = ' Tienes alta dependencia de una sola categoría — considera diversificar.';
    else if (+topPct < 25) extra = ' La distribución es equilibrada entre categorías.';
    ins.innerHTML = `${icon('sparkles', 16)}<span><strong>${escapeHtml(labels[0])}</strong> genera el <strong>${topPct}%</strong> de los ingresos (${fmtMoney(top)} de ${fmtMoney(total)}).${extra}</span>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ============================================================================
// Carga / limpieza
// ============================================================================
function cargarEjemplo() {
  document.getElementById('inputCaso').value = EJEMPLO_PDF;
  toast('Ejemplo del enunciado cargado', 'success');
}

function limpiar() {
  document.getElementById('inputCaso').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('rankingTabla').innerHTML = '';
  document.getElementById('metrics').innerHTML = '';
  const insT = document.getElementById('insightTop'); if (insT) insT.hidden = true;
  const insC = document.getElementById('insightCats'); if (insC) insC.hidden = true;
  if (chartActual) { chartActual.destroy(); chartActual = null; }
  if (catChartActual) { catChartActual.destroy(); catChartActual = null; }
  toast('Listo', 'success');
}

function generar() {
  const m = +document.getElementById('paramM').value || 1000;
  const n = +document.getElementById('paramN').value || 20;
  const p = +document.getElementById('paramP').value || 5;
  const seed = +document.getElementById('paramSeed').value || 42;
  const t0 = performance.now();
  const caso = Generador.generarCaso({ m, n, p, seed });
  const t1 = performance.now();
  document.getElementById('inputCaso').value = caso;
  document.getElementById('genInfo').innerHTML =
    `<span class="chip good">${icon('check-circle', 12)} OK</span> Generados <strong class="tnum">${fmtNum(m)}</strong> records, <strong class="tnum">${fmtNum(n)}</strong> clientes, <strong class="tnum">${fmtNum(p)}</strong> categorías en ${(t1 - t0).toFixed(1)} ms.`;
  analizar();
}

function leerCsv(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lineas = String(reader.result).split(/\r?\n/).filter(Boolean);
    const header = lineas.shift();
    if (!header || !/customer/i.test(header)) {
      toast('CSV inválido. Cabecera esperada: customer,product,category,price,quantity,timestamp', 'error');
      return;
    }
    const records = lineas.map(l => l.split(',').map(s => s.trim()).join(' '));
    document.getElementById('inputCaso').value = records.join(';');
    toast(`${fmtNum(lineas.length)} records cargados desde CSV`, 'success');
    analizar();
  };
  reader.readAsText(file);
}

// ============================================================================
// Casos del profesor: archivos en data_2026_1/ con formato extendido
// 'Cat1,...,CatN--records'. Se cargan vía fetch desde el repo root.
// ============================================================================
const CASOS_PROFESOR = [
  { id: 'caso0', label: 'Caso 0',  hint: '20 clientes · 7 categorías · 182 records',  file: 'Caso0_20c_10c_5p.txt' },
  { id: 'caso1', label: 'Caso 1',  hint: '50 clientes · 20 categorías · 1 000 records', file: 'Caso1_50c_20c_10p.txt' },
  { id: 'caso2', label: 'Caso 2',  hint: '100 clientes · 30 categorías · 5 000 records', file: 'Caso2_100c_30c_40p.txt' },
];

function renderCasosProfesor() {
  const cont = document.getElementById('casosProfe');
  if (!cont) return;
  cont.innerHTML = CASOS_PROFESOR.map(c => `
    <button class="prof-case" data-id="${c.id}">
      <span class="prof-case-title">${c.label}</span>
      <span class="prof-case-hint">${c.hint}</span>
    </button>
  `).join('');
  cont.querySelectorAll('.prof-case').forEach(btn => {
    btn.addEventListener('click', () => cargarCasoProfesor(btn.dataset.id));
  });
}

async function cargarCasoProfesor(id) {
  const c = CASOS_PROFESOR.find(x => x.id === id);
  if (!c) return;
  const info = document.getElementById('profInfo');
  info.innerHTML = `<span class="chip">Cargando ${c.label}…</span>`;
  // Buscamos primero relativo (../data_2026_1/...) y caemos a /data_2026_1/...
  // como respaldo si el host sirve desde la raíz del repo.
  const rutas = [`../data_2026_1/${c.file}`, `/data_2026_1/${c.file}`, `data_2026_1/${c.file}`];
  let texto = null;
  for (const r of rutas) {
    try {
      const res = await fetch(r, { cache: 'no-store' });
      if (res.ok) { texto = await res.text(); break; }
    } catch (_) { /* siguiente */ }
  }
  if (!texto) {
    info.innerHTML = `<span class="chip bad">${icon('alert-triangle', 12)} No pude cargar ${c.file}. Sirve el repo desde la raíz (no sólo /app).</span>`;
    return;
  }
  document.getElementById('inputCaso').value = texto;
  const norm = Parser.normalizarCaso(texto);
  const records = Parser.parsearCaso(texto);
  const clientes = new Set(records.map(r => r.customer));
  info.innerHTML =
    `<span class="chip good">${icon('check-circle', 12)} ${c.label} cargado.</span> ` +
    `<strong class="tnum">${fmtNum(records.length)}</strong> records · ` +
    `<strong class="tnum">${fmtNum(clientes.size)}</strong> clientes · ` +
    `<strong class="tnum">${norm.categorias ? norm.categorias.length : 0}</strong> categorías declaradas.`;
  analizar();
}

function inicializarDropzone() {
  const dz = document.getElementById('dropzone');
  if (!dz) return;
  dz.addEventListener('click', () => document.getElementById('inputCsv').click());
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('over');
    if (e.dataTransfer.files[0]) leerCsv(e.dataTransfer.files[0]);
  });
}

// ============================================================================
// Exportar / Copiar
// ============================================================================
function exportarCsv() {
  const out = document.getElementById('output').textContent;
  if (!out) { toast('Primero analiza un caso', 'error'); return; }
  const lineas = out.split('\n');
  const csv = ['posicion,customer,totalSpent,favoriteCategory'];
  for (const ln of lineas) {
    const m = ln.match(/^(\d+)\) (\S+) (\d+) (.+)$/);
    if (m) csv.push(`${m[1]},${m[2]},${m[3]},${m[4]}`);
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ranking_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast('Ranking exportado como CSV', 'success');
}

async function copiarOutput() {
  const out = document.getElementById('output').textContent;
  if (!out) { toast('Nada que copiar', 'error'); return; }
  try {
    await navigator.clipboard.writeText(out);
    toast('Salida copiada al portapapeles', 'success');
  } catch {
    toast('No pude copiar al portapapeles', 'error');
  }
}

// ============================================================================
// Benchmark
// ============================================================================
function correrBenchmark() {
  const m = +document.getElementById('benchM').value || 10000;
  const n = +document.getElementById('benchN').value || 200;
  const p = +document.getElementById('benchP').value || 5;
  const cont = document.getElementById('benchResultados');
  cont.innerHTML = `<div class="empty"><span class="spinner"></span><h3 style="margin-top:12px;">Corriendo benchmark…</h3><p>Midiendo ${fmtNum(m)} records · ${fmtNum(n)} clientes · ${fmtNum(p)} categorías</p></div>`;

  setTimeout(() => {
    try {
      const r = Benchmark.correr({ m, n, p, seed: 7 });
      const ordenado = [...r.resultados].sort((a, b) => a.ms - b.ms);
      const minMs = ordenado[0].ms;
      const maxMs = ordenado[ordenado.length - 1].ms;
      const barras = r.resultados.map(t => {
        const pct = maxMs > 0 ? (t.ms / maxMs) * 100 : 0;
        const winner = t.ms === minMs;
        return `
          <div class="bench-bar">
            <div>
              <span class="name">${winner ? icon('trophy', 14) + ' ' : ''}${escapeHtml(t.algoritmo)}</span>
              ${t.nota ? `<span class="nota">${escapeHtml(t.nota)}</span>` : ''}
            </div>
            <span class="ms tnum ${winner ? 'winner' : ''}">${t.ms} ms</span>
            <div class="track"><div class="fill" style="width:${pct}%"></div></div>
          </div>
        `;
      }).join('');
      cont.innerHTML = `
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
          <span class="chip">m = <strong class="tnum">${fmtNum(r.params.m)}</strong></span>
          <span class="chip">n = <strong class="tnum">${fmtNum(r.params.n)}</strong></span>
          <span class="chip">p = <strong class="tnum">${fmtNum(r.params.p)}</strong></span>
          <span class="chip accent">→ <strong class="tnum">${fmtNum(r.nClientes)}</strong> clientes ordenados</span>
        </div>
        <div class="bench-bars">${barras}</div>
      `;
    } catch (e) {
      cont.innerHTML = `<div class="empty"><h3>Error</h3><p>${escapeHtml(e.message)}</p></div>`;
    }
  }, 50);
}

// ============================================================================
// Pruebas — pre-listadas con estado individual
// ============================================================================
function renderTestList(estados) {
  const cont = document.getElementById('testList');
  if (!cont || !window.TestRunner) return;
  const tests = window.TestRunner.tests;
  const html = tests.map((t, i) => {
    const e = estados[i] || { status: 'pending', ms: null, err: null };
    const ico = e.status === 'ok' ? icon('check-circle', 16)
              : e.status === 'fail' ? icon('x-circle', 16)
              : icon('circle', 16);
    const labelStatus = e.status === 'ok' ? 'Pasó' : e.status === 'fail' ? 'Falló' : 'Pendiente';
    const tiempo = e.ms != null ? `<span class="test-time">${e.ms.toFixed(2)} ms</span>` : `<span class="test-time">${labelStatus}</span>`;
    return `<div class="test-line ${e.status}">
      ${ico}
      <span class="test-name">${escapeHtml(t.nombre)}${e.err ? '<br><small style="color:var(--text-dim);">' + escapeHtml(e.err) + '</small>' : ''}</span>
      ${tiempo}
    </div>`;
  }).join('');
  cont.innerHTML = html;
}

function actualizarSummary(estados) {
  const tests = window.TestRunner ? window.TestRunner.tests : [];
  const sum = document.getElementById('testSummary');
  const total = tests.length;
  const ok = estados.filter(e => e && e.status === 'ok').length;
  const fail = estados.filter(e => e && e.status === 'fail').length;
  const pend = total - ok - fail;
  if (pend === total) sum.textContent = `${total} pruebas pendientes`;
  else if (fail > 0) {
    sum.textContent = `${fail}/${total} fallaron`;
    sum.className = 'chip';
    sum.style.background = 'rgba(239, 68, 68, 0.10)';
    sum.style.color = 'var(--bad)';
    sum.style.borderColor = 'rgba(239, 68, 68, 0.30)';
  } else {
    sum.textContent = `${ok}/${total} pruebas pasaron`;
    sum.className = 'chip good';
  }
}

function correrTests() {
  if (!window.TestRunner) return;
  const tests = window.TestRunner.tests;
  const estados = tests.map(() => ({ status: 'pending', ms: null, err: null }));
  let totalMs = 0;

  for (let i = 0; i < tests.length; i++) {
    const t0 = performance.now();
    try {
      tests[i].fn();
      const ms = performance.now() - t0;
      estados[i] = { status: 'ok', ms, err: null };
      totalMs += ms;
    } catch (e) {
      const ms = performance.now() - t0;
      estados[i] = { status: 'fail', ms, err: e.message };
      totalMs += ms;
    }
  }

  renderTestList(estados);
  actualizarSummary(estados);

  const ok = estados.filter(e => e.status === 'ok').length;
  const fail = estados.filter(e => e.status === 'fail').length;
  const cont = document.getElementById('testResultados');
  cont.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'test-summary ' + (fail === 0 ? 'ok' : 'fail');
  div.innerHTML = fail === 0
    ? `${icon('check-circle', 18)} ${ok}/${tests.length} pruebas pasaron en ${totalMs.toFixed(2)} ms`
    : `${icon('x-circle', 18)} ${fail}/${tests.length} pruebas fallaron · ${ok} pasaron`;
  cont.appendChild(div);

  toast(fail === 0 ? 'Todas las pruebas pasaron' : `${fail} pruebas fallaron`, fail === 0 ? 'success' : 'error');
}

function inicializarTests() {
  if (!window.TestRunner) return;
  const tests = window.TestRunner.tests;
  const estados = tests.map(() => ({ status: 'pending', ms: null, err: null }));
  renderTestList(estados);
  actualizarSummary(estados);
}

// ============================================================================
// Wire-up
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  aplicarTema(temaInicial());
  inicializarTabs();
  inicializarDropzone();
  inicializarTests();
  renderCasosProfesor();

  document.getElementById('btnTheme').addEventListener('click', () => {
    aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('btnAnalizar').addEventListener('click', analizar);
  document.getElementById('btnEjemplo').addEventListener('click', cargarEjemplo);
  document.getElementById('btnLimpiar').addEventListener('click', limpiar);
  document.getElementById('btnGenerar').addEventListener('click', generar);
  document.getElementById('inputCsv').addEventListener('change', ev => leerCsv(ev.target.files[0]));
  document.getElementById('btnBench').addEventListener('click', correrBenchmark);
  document.getElementById('btnTests').addEventListener('click', correrTests);
  document.getElementById('exportCsv').addEventListener('click', exportarCsv);
  document.getElementById('copyOutput').addEventListener('click', copiarOutput);

  // Atajos
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); analizar(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') { e.preventDefault(); limpiar(); }
  });

  // Carga inicial
  cargarEjemplo();
  analizar();
});

// ============================================================================
// PWA install + service worker
// ============================================================================
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('btnInstall').classList.add('show');
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnInstall').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') toast('App instalada', 'success');
    deferredPrompt = null;
    document.getElementById('btnInstall').classList.remove('show');
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
