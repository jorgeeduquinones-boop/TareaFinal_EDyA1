// =============================================================================
// app.js — Lógica de la UI
// =============================================================================

const EJEMPLO_PDF = 'Customer1 Laptop Technology 3000 1 10;Customer2 Shirt Clothing 50 2 12;Customer1 Mouse Technology 100 1 15;Customer2 Shoes Clothing 200 1 20;Customer3 TV Technology 2500 1 25';

let chartActual = null;
let catChartActual = null;

// ============================================================================
// Tema (light/dark)
// ============================================================================
function temaInicial() {
  const guardado = localStorage.getItem('tema');
  if (guardado) return guardado;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem('tema', tema);
  document.getElementById('btnTheme').textContent = tema === 'dark' ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]').content = tema === 'dark' ? '#0a0d14' : '#f8fafc';
  // Re-renderizar gráficos para que tomen los nuevos colores.
  if (chartActual || catChartActual) {
    const out = document.getElementById('output').textContent;
    if (out) { renderGrafico(out); renderGraficoCategorias(out); }
  }
}

// ============================================================================
// Toast
// ============================================================================
let toastTimer = null;
function toast(mensaje, tipo) {
  const t = document.getElementById('toast');
  t.textContent = mensaje;
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
  if (!entrada) { toast('Pega un caso o usa el ejemplo del PDF', 'error'); return; }

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
    // Cambiar al tab de análisis.
    document.querySelector('.tabs button[data-panel="analisis"]').click();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

function renderResumen(entrada, salida, ms) {
  const records = Parser.parsearCaso(entrada);
  const nClientes = salida ? salida.split('\n').length : 0;
  const totalGastado = records.reduce((s, r) => s + r.price * r.quantity, 0);
  const cats = new Set(records.map(r => r.category));
  const ticketMedio = records.length ? totalGastado / records.length : 0;

  document.getElementById('metrics').innerHTML = `
    <div class="metric">
      <div class="icon-bg">📦</div>
      <div class="label">Records</div>
      <div class="value">${records.length.toLocaleString()}</div>
      <div class="sublabel">transacciones procesadas</div>
    </div>
    <div class="metric">
      <div class="icon-bg">👥</div>
      <div class="label">Clientes</div>
      <div class="value gradient">${nClientes}</div>
      <div class="sublabel">en el ranking final</div>
    </div>
    <div class="metric">
      <div class="icon-bg">🏷️</div>
      <div class="label">Categorías</div>
      <div class="value">${cats.size}</div>
      <div class="sublabel">distintas</div>
    </div>
    <div class="metric">
      <div class="icon-bg">💰</div>
      <div class="label">Volumen total</div>
      <div class="value good">$${totalGastado.toLocaleString()}</div>
      <div class="sublabel">suma de price × quantity</div>
    </div>
    <div class="metric">
      <div class="icon-bg">🎫</div>
      <div class="label">Ticket medio</div>
      <div class="value">$${ticketMedio.toFixed(0)}</div>
      <div class="sublabel">por transacción</div>
    </div>
    <div class="metric">
      <div class="icon-bg">⚡</div>
      <div class="label">Tiempo</div>
      <div class="value">${ms.toFixed(2)} <span style="font-size:14px; color:var(--text-muted);">ms</span></div>
      <div class="sublabel">de análisis end-to-end</div>
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
    const podium = idx < 3 ? `podium-${idx + 1}` : '';
    const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
    return `<tr class="${podium}">
      <td class="rank ${rankClass}">${medal} ${m[1]}</td>
      <td><strong>${escapeHtml(m[2])}</strong></td>
      <td>$${(+m[3]).toLocaleString()}</td>
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
// Gráficos
// ============================================================================
function coloresAccent(n) {
  const tema = document.documentElement.dataset.theme;
  const baseHue = tema === 'dark' ? 240 : 245;
  const sat = tema === 'dark' ? 70 : 65;
  const light = tema === 'dark' ? 65 : 60;
  return Array.from({length: n}, (_, i) => `hsl(${baseHue + i * 18}, ${sat}%, ${light}%)`);
}

function getChartColors() {
  const tema = document.documentElement.dataset.theme;
  return {
    text: tema === 'dark' ? '#94a3b8' : '#475569',
    grid: tema === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
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
    data: { labels, datasets: [{ label: 'Total gastado', data, backgroundColor: coloresAccent(labels.length), borderRadius: 8, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.4)', borderWidth: 1,
          padding: 12, cornerRadius: 8, titleFont: {weight:'700'},
          callbacks: {
            label: (ctx) => '  $' + ctx.parsed.y.toLocaleString(),
            afterLabel: (ctx) => '  Categoría: ' + cats[ctx.dataIndex],
          },
        },
      },
      scales: {
        x: { ticks: { color: colors.text, font: {weight:'600'} }, grid: { display: false } },
        y: { ticks: { color: colors.text, callback: v => '$' + v.toLocaleString() }, grid: { color: colors.grid } },
      },
    },
  });
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
    data: { labels, datasets: [{ data, backgroundColor: coloresAccent(labels.length), borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { position: 'right', labels: { color: colors.text, font:{weight:'600'}, padding: 12, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)', padding: 12, cornerRadius: 8,
          callbacks: { label: (ctx) => '  $' + ctx.parsed.toLocaleString() },
        },
      },
    },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ============================================================================
// Helpers de datos
// ============================================================================
function cargarEjemplo() {
  document.getElementById('inputCaso').value = EJEMPLO_PDF;
  toast('Ejemplo del PDF cargado', 'success');
}

function limpiar() {
  document.getElementById('inputCaso').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('rankingTabla').innerHTML = '';
  document.getElementById('metrics').innerHTML = '';
  if (chartActual) { chartActual.destroy(); chartActual = null; }
  if (catChartActual) { catChartActual.destroy(); catChartActual = null; }
  toast('Limpio', 'success');
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
    `<span class="chip good">✓</span> Generados <strong>${m.toLocaleString()}</strong> records, <strong>${n}</strong> clientes, <strong>${p}</strong> categorías en ${(t1-t0).toFixed(1)} ms.`;
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
    toast(`${lineas.length} records cargados desde CSV`, 'success');
    analizar();
  };
  reader.readAsText(file);
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
  cont.innerHTML = '<div class="empty"><span class="spinner"></span><h3 style="margin-top:12px;">Corriendo benchmark...</h3></div>';

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
              <span class="name">${winner ? '🏆 ' : ''}${escapeHtml(t.algoritmo)}</span>
              ${t.nota ? `<span class="nota">${escapeHtml(t.nota)}</span>` : ''}
            </div>
            <span class="ms ${winner ? 'winner' : ''}">${t.ms} ms</span>
            <div class="track"><div class="fill" style="width:${pct}%"></div></div>
          </div>
        `;
      }).join('');
      cont.innerHTML = `
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
          <span class="chip">m = ${r.params.m.toLocaleString()}</span>
          <span class="chip">n = ${r.params.n}</span>
          <span class="chip">p = ${r.params.p}</span>
          <span class="chip accent">→ ${r.nClientes} clientes ordenados</span>
        </div>
        <div class="bench-bars">${barras}</div>
      `;
    } catch (e) {
      cont.innerHTML = `<div class="empty"><h3>Error</h3><p>${escapeHtml(e.message)}</p></div>`;
    }
  }, 50);
}

// ============================================================================
// Tests
// ============================================================================
function correrTests() {
  const cont = document.getElementById('testResultados');
  cont.innerHTML = '';
  const lineas = [];
  TestRunner.correr((linea) => lineas.push(linea));
  let okCount = 0, failCount = 0;
  for (const linea of lineas) {
    if (linea.startsWith('  OK')) okCount++;
    else if (linea.startsWith('FAIL')) failCount++;
    else continue;
    const div = document.createElement('div');
    const isFail = linea.startsWith('FAIL');
    div.className = 'test-line ' + (isFail ? 'fail' : 'ok');
    div.innerHTML = `<span class="badge-test">${isFail ? 'FAIL' : 'OK'}</span><span>${escapeHtml(linea.replace(/^(  OK|FAIL)\s+/, ''))}</span>`;
    cont.appendChild(div);
  }
  const total = okCount + failCount;
  const sumario = document.createElement('div');
  sumario.className = 'test-summary ' + (failCount === 0 ? 'ok' : 'fail');
  sumario.innerHTML = failCount === 0
    ? `✅ ${okCount}/${total} tests pasaron`
    : `❌ ${failCount}/${total} tests fallaron`;
  cont.appendChild(sumario);
  toast(failCount === 0 ? 'Todos los tests pasaron' : `${failCount} tests fallaron`, failCount === 0 ? 'success' : 'error');
}

// ============================================================================
// Wire-up
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  aplicarTema(temaInicial());
  inicializarTabs();
  inicializarDropzone();

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

  // Atajos de teclado
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
