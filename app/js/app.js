// =============================================================================
// app.js — Lógica de la UI
// =============================================================================

const EJEMPLO_PDF = 'Customer1 Laptop Technology 3000 1 10;Customer2 Shirt Clothing 50 2 12;Customer1 Mouse Technology 100 1 15;Customer2 Shoes Clothing 200 1 20;Customer3 TV Technology 2500 1 25';

let chartActual = null;
let treemapActual = null;

// ---------- Tabs ----------
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
  });
});

// ---------- Análisis ----------
function analizar() {
  const entrada = document.getElementById('inputCaso').value.trim();
  if (!entrada) { alert('Pegue un caso de entrada o use uno de ejemplo.'); return; }

  const t0 = performance.now();
  const salida = calcularPedidos(entrada);
  const t1 = performance.now();

  document.getElementById('output').textContent = salida;
  renderResumen(entrada, salida, t1 - t0);
  renderTabla(salida);
  renderGrafico(salida);
}

function renderResumen(entrada, salida, ms) {
  const records = Parser.parsearCaso(entrada);
  const nClientes = salida ? salida.split('\n').length : 0;
  const totalGastado = records.reduce((s, r) => s + r.price * r.quantity, 0);
  const cats = new Set(records.map(r => r.category));

  const html = `
    <div class="metric"><div class="label">Records</div><div class="value">${records.length.toLocaleString()}</div></div>
    <div class="metric"><div class="label">Clientes</div><div class="value accent">${nClientes}</div></div>
    <div class="metric"><div class="label">Categorías</div><div class="value">${cats.size}</div></div>
    <div class="metric"><div class="label">Volumen total</div><div class="value good">$${totalGastado.toLocaleString()}</div></div>
    <div class="metric"><div class="label">Tiempo de análisis</div><div class="value">${ms.toFixed(2)} ms</div></div>
  `;
  document.getElementById('metrics').innerHTML = html;
}

function renderTabla(salida) {
  if (!salida) { document.getElementById('rankingTabla').innerHTML = ''; return; }
  const lineas = salida.split('\n');
  const filas = lineas.map((linea, idx) => {
    // formato: "1) Customer1 3100 Technology"
    const m = linea.match(/^(\d+)\) (\S+) (\d+) (.+)$/);
    if (!m) return '';
    const podium = idx < 3 ? `podium-${idx + 1}` : '';
    return `<tr class="${podium}">
      <td class="rank">${m[1]}</td>
      <td>${escapeHtml(m[2])}</td>
      <td>$${(+m[3]).toLocaleString()}</td>
      <td>${escapeHtml(m[4])}</td>
    </tr>`;
  }).join('');
  document.getElementById('rankingTabla').innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Total gastado</th><th>Categoría favorita</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

function renderGrafico(salida) {
  if (!salida || typeof Chart === 'undefined') return;
  const lineas = salida.split('\n').slice(0, 15);
  const labels = [], data = [], cats = [];
  for (const ln of lineas) {
    const m = ln.match(/^\d+\) (\S+) (\d+) (.+)$/);
    if (!m) continue;
    labels.push(m[1]); data.push(+m[2]); cats.push(m[3]);
  }
  const colores = labels.map((_, i) => `hsl(${210 + i * 14}, 70%, 60%)`);
  const ctx = document.getElementById('chartCanvas');
  if (chartActual) chartActual.destroy();
  chartActual = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Total gastado', data, backgroundColor: colores, borderRadius: 6 }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { afterLabel: (ctx) => 'Categoría: ' + cats[ctx.dataIndex] } },
      },
      scales: {
        x: { ticks: { color: '#9aa7bd' }, grid: { color: '#243049' } },
        y: { ticks: { color: '#9aa7bd' }, grid: { color: '#243049' } },
      },
    },
  });
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ---------- Cargar ejemplo / CSV ----------
function cargarEjemplo() {
  document.getElementById('inputCaso').value = EJEMPLO_PDF;
}

function generar() {
  const m = +document.getElementById('paramM').value || 1000;
  const n = +document.getElementById('paramN').value || 20;
  const p = +document.getElementById('paramP').value || 5;
  const seed = +document.getElementById('paramSeed').value || 42;
  const caso = Generador.generarCaso({ m, n, p, seed });
  document.getElementById('inputCaso').value = caso;
  document.getElementById('genInfo').textContent = `Generados ${m.toLocaleString()} records, ${n} clientes, ${p} categorías.`;
}

function cargarCsv(ev) {
  const file = ev.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    // CSV con headers customer,product,category,price,quantity,timestamp
    const lineas = String(reader.result).split(/\r?\n/).filter(Boolean);
    const header = lineas.shift();
    if (!header || !/customer/i.test(header)) {
      alert('CSV inválido. Cabecera esperada: customer,product,category,price,quantity,timestamp');
      return;
    }
    const records = lineas.map(l => l.split(',').map(s => s.trim()).join(' '));
    document.getElementById('inputCaso').value = records.join(';');
  };
  reader.readAsText(file);
}

// ---------- Benchmark ----------
function correrBenchmark() {
  const m = +document.getElementById('benchM').value || 10000;
  const n = +document.getElementById('benchN').value || 200;
  const p = +document.getElementById('benchP').value || 5;
  const r = Benchmark.correr({ m, n, p, seed: 7 });
  const ordenado = [...r.resultados].sort((a, b) => a.ms - b.ms);
  const minMs = ordenado[0].ms;
  const filas = r.resultados.map(t => `
    <tr>
      <td>${escapeHtml(t.algoritmo)}</td>
      <td class="${t.ms === minMs ? 'winner' : ''}">${t.ms} ms</td>
      <td>${t.nota ? `<small style="color:var(--text-dim)">${escapeHtml(t.nota)}</small>` : ''}</td>
    </tr>
  `).join('');
  document.getElementById('benchResultados').innerHTML = `
    <p style="color:var(--text-dim); font-size: 12px;">m=${r.params.m}, n=${r.params.n}, p=${r.params.p} → ${r.nClientes} clientes ordenados.</p>
    <table class="bench-table">
      <thead><tr><th>Algoritmo</th><th>Tiempo</th><th>Nota</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ---------- Tests ----------
function correrTests() {
  const cont = document.getElementById('testResultados');
  cont.innerHTML = '';
  const r = TestRunner.correr((linea) => {
    const div = document.createElement('div');
    div.className = 'test-line ' + (linea.startsWith('FAIL') ? 'fail' : (linea.startsWith('  OK') ? 'ok' : ''));
    div.textContent = linea;
    cont.appendChild(div);
  });
  const resumen = document.createElement('div');
  resumen.className = 'test-line ' + (r.fail === 0 ? 'ok' : 'fail');
  resumen.style.marginTop = '10px';
  resumen.style.fontWeight = '700';
  resumen.textContent = `RESULTADO: ${r.ok}/${r.total} pasaron, ${r.fail} fallaron.`;
  cont.appendChild(resumen);
}

// ---------- Wire-up ----------
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnAnalizar').addEventListener('click', analizar);
  document.getElementById('btnEjemplo').addEventListener('click', cargarEjemplo);
  document.getElementById('btnGenerar').addEventListener('click', generar);
  document.getElementById('inputCsv').addEventListener('change', cargarCsv);
  document.getElementById('btnBench').addEventListener('click', correrBenchmark);
  document.getElementById('btnTests').addEventListener('click', correrTests);

  cargarEjemplo();
  analizar();
});

// ---------- PWA install prompt ----------
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
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('btnInstall').classList.remove('show');
  });
});

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
