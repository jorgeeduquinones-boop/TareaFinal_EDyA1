// =============================================================================
// inicio.js — Clientela · página orientada al usuario final
// =============================================================================
// Reusa calcularPedidos + Parser + Generador. Traduce los resultados a
// lenguaje cotidiano: insights accionables, recomendaciones, big numbers.
// =============================================================================

const icon = window.Icons ? window.Icons.icon : ((n, s) => '');

let casoActual = '';
let topChartUser = null;
let catChartUser = null;

// ---------- Formato ----------
const NF_NUM = new Intl.NumberFormat('es-CO');
const NF_MONEY = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
function fmtNum(n) { return NF_NUM.format(Math.round(+n || 0)); }
function fmtMoney(n) { return NF_MONEY.format(Math.round(+n || 0)); }

// ---------- Tema ----------
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
  if (casoActual) renderResultados(casoActual);
}

// ---------- Toast ----------
let toastTimer = null;
function toast(msg, tipo) {
  const t = document.getElementById('toast');
  const ico = tipo === 'success' ? icon('check-circle', 16) : tipo === 'error' ? icon('x-circle', 16) : icon('info', 16);
  t.innerHTML = ico + '<span>' + escapeHtml(msg) + '</span>';
  t.className = 'toast ' + (tipo || '') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ---------- Navegación entre pasos ----------
function irAPaso(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Carga de datos ----------
function usarDemo() {
  casoActual = Generador.generarCaso({ m: 5000, n: 25, p: 6, seed: 42 });
  renderResultados(casoActual);
  irAPaso('results');
  toast('Cargadas 5.000 ventas de la "Tienda Demo"', 'success');
}

function leerCsv(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lineas = String(reader.result).split(/\r?\n/).filter(Boolean);
    const header = lineas.shift();
    if (!header || !/customer/i.test(header)) {
      toast('Tu CSV necesita la cabecera: customer,product,category,price,quantity,timestamp', 'error');
      return;
    }
    casoActual = lineas.map(l => l.split(',').map(s => s.trim()).join(' ')).join(';');
    renderResultados(casoActual);
    irAPaso('results');
    toast(`Cargadas ${fmtNum(lineas.length)} ventas desde tu CSV`, 'success');
  };
  reader.readAsText(file);
}

function usarPasted() {
  const txt = document.getElementById('pasteInput').value.trim();
  if (!txt) { toast('Pega algo primero', 'error'); return; }
  try {
    const records = Parser.parsearCaso(txt);
    if (records.length === 0) {
      toast('No se reconoció el formato. Revisa que cada record tenga 6 campos.', 'error');
      return;
    }
    casoActual = txt;
    renderResultados(casoActual);
    irAPaso('results');
    toast(`Procesadas ${fmtNum(records.length)} ventas`, 'success');
  } catch (e) {
    toast('Error al leer: ' + e.message, 'error');
  }
}

// ---------- Render de resultados ----------
function renderResultados(caso) {
  const records = Parser.parsearCaso(caso);
  const totalRevenue = records.reduce((s, r) => s + r.price * r.quantity, 0);
  const totalSales = records.length;

  const salida = calcularPedidos(caso);
  const lineas = salida.split('\n');
  const ranking = lineas.map(ln => {
    const m = ln.match(/^(\d+)\) (\S+) (\d+) (.+)$/);
    return m ? { pos: +m[1], name: m[2], totalSpent: +m[3], favoriteCategory: m[4] } : null;
  }).filter(Boolean);

  const transPorCliente = new Map();
  for (const r of records) transPorCliente.set(r.customer, (transPorCliente.get(r.customer) || 0) + 1);

  const porCat = new Map();
  for (const r of records) {
    const v = r.price * r.quantity;
    const e = porCat.get(r.category) || { revenue: 0, transactions: 0 };
    e.revenue += v; e.transactions += 1;
    porCat.set(r.category, e);
  }
  const cats = [...porCat.entries()].map(([n, e]) => ({ name: n, ...e })).sort((a, b) => b.revenue - a.revenue);

  document.getElementById('resultsSubtitle').textContent =
    `${fmtNum(totalSales)} ventas analizadas · ${fmtNum(ranking.length)} clientes únicos · ${cats.length} categorías`;

  renderBigNumbers(ranking, totalRevenue, totalSales, cats);
  renderTopCustomers(ranking, transPorCliente, totalRevenue);
  renderInsights(ranking, totalRevenue, totalSales, cats, transPorCliente);
  renderRecommendations(ranking, totalRevenue, transPorCliente);
  renderCharts(ranking, cats, totalRevenue);
}

// ---------- Big numbers ----------
function renderBigNumbers(ranking, totalRevenue, totalSales, cats) {
  const top1 = ranking[0];
  const top1Pct = top1 ? Math.round((top1.totalSpent / totalRevenue) * 100) : 0;
  const top3Revenue = ranking.slice(0, 3).reduce((s, c) => s + c.totalSpent, 0);
  const top3Pct = Math.round((top3Revenue / totalRevenue) * 100);
  const ticketMedio = totalSales ? totalRevenue / totalSales : 0;
  const catEstrella = cats[0];

  document.querySelector('.big-numbers').innerHTML = `
    <div class="bignum hero-card">
      <div class="label">${icon('dollar-sign', 14)} Ingresos totales</div>
      <div class="num tnum">${fmtMoney(totalRevenue)}</div>
      <div class="desc">${fmtNum(totalSales)} ventas analizadas</div>
    </div>
    <div class="bignum normal">
      <div class="label">${icon('crown', 14)} Cliente top</div>
      <div class="num">${escapeHtml(top1 ? top1.name : '—')}</div>
      <div class="desc">Aporta el <strong>${top1Pct}%</strong> de tus ingresos</div>
    </div>
    <div class="bignum normal">
      <div class="label">${icon('trending-up', 14)} Tus 3 mejores</div>
      <div class="num tnum">${top3Pct}%</div>
      <div class="desc">de tus ingresos vienen de 3 clientes</div>
    </div>
    <div class="bignum small">
      <div class="label">${icon('star', 14)} Categoría estrella</div>
      <div class="num">${escapeHtml(catEstrella ? catEstrella.name : '—')}</div>
      <div class="desc">${fmtMoney(catEstrella ? catEstrella.revenue : 0)}</div>
    </div>
    <div class="bignum small">
      <div class="label">${icon('credit-card', 14)} Ticket medio</div>
      <div class="num tnum">${fmtMoney(ticketMedio)}</div>
      <div class="desc">por cada venta</div>
    </div>
    <div class="bignum small">
      <div class="label">${icon('package', 14)} Total de ventas</div>
      <div class="num tnum">${fmtNum(totalSales)}</div>
      <div class="desc">transacciones</div>
    </div>
  `;
}

// ---------- Top customers (cards) ----------
function renderTopCustomers(ranking, transPorCliente, totalRevenue) {
  const top = ranking.slice(0, 6);
  const html = top.map((c, i) => {
    const trans = transPorCliente.get(c.name) || 0;
    const ticket = trans ? c.totalSpent / trans : 0;
    const pctRevenue = ((c.totalSpent / totalRevenue) * 100).toFixed(1);
    const podium = i < 3 ? `podium-${i + 1}` : '';
    return `
      <div class="customer-card ${podium}">
        <div class="pos"><span class="pos-badge">${c.pos}</span> Puesto</div>
        <div class="name">${escapeHtml(c.name)}</div>
        <div class="stats">
          <div class="stat-row"><span class="lbl">Total gastado</span><span class="val money tnum">${fmtMoney(c.totalSpent)}</span></div>
          <div class="stat-row"><span class="lbl">% de tus ingresos</span><span class="val tnum">${pctRevenue}%</span></div>
          <div class="stat-row"><span class="lbl">Transacciones</span><span class="val tnum">${fmtNum(trans)}</span></div>
          <div class="stat-row"><span class="lbl">Ticket promedio</span><span class="val tnum">${fmtMoney(ticket)}</span></div>
          <div class="stat-row"><span class="lbl">Categoría favorita</span><span class="val">${escapeHtml(c.favoriteCategory)}</span></div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('topCustomers').innerHTML = html;
}

// ---------- Insights en lenguaje natural ----------
function renderInsights(ranking, totalRevenue, totalSales, cats, transPorCliente) {
  const insights = [];

  let acumulado = 0, clientes20 = 0;
  const objetivo = totalRevenue * 0.8;
  for (const c of ranking) {
    acumulado += c.totalSpent; clientes20++;
    if (acumulado >= objetivo) break;
  }
  const pct = ((clientes20 / ranking.length) * 100).toFixed(0);
  insights.push({
    ico: 'trending-up',
    title: `El ${pct}% de tus clientes genera el 80% de tus ingresos`,
    body: `Solo <strong class="tnum">${fmtNum(clientes20)}</strong> de tus <strong class="tnum">${fmtNum(ranking.length)}</strong> clientes producen 4 de cada 5 unidades monetarias que entran. Cuídalos.`,
  });

  let masLeal = null, maxTrans = 0;
  for (const [name, t] of transPorCliente) if (t > maxTrans) { masLeal = name; maxTrans = t; }
  if (masLeal) {
    insights.push({
      ico: 'heart',
      title: `Tu cliente más leal es ${masLeal}`,
      body: `Ha hecho <strong class="tnum">${fmtNum(maxTrans)}</strong> compras. Es el que más confía en tu tienda — un descuento exclusivo lo va a fidelizar más.`,
    });
  }

  if (cats.length >= 2) {
    const masPop = [...cats].sort((a, b) => b.transactions - a.transactions)[0];
    const masRent = cats[0];
    if (masPop.name !== masRent.name) {
      insights.push({
        ico: 'theater-masks',
        title: `${masRent.name} te da más dinero, pero ${masPop.name} se vende más seguido`,
        body: `Tu categoría más rentable y la más popular no son la misma. Considera si <strong>${masPop.name}</strong> puede tener productos premium para subir el ticket.`,
      });
    }
  }

  if (cats.length >= 1) {
    const dom = cats[0];
    const pctDom = ((dom.revenue / totalRevenue) * 100).toFixed(0);
    if (+pctDom >= 40) {
      insights.push({
        ico: 'alert-triangle',
        title: `${dom.name} representa el ${pctDom}% de tus ingresos`,
        body: `Tienes una alta dependencia de una sola categoría. Si <strong>${dom.name}</strong> baja, tu negocio sufre. Diversifica.`,
      });
    }
  }

  if (ranking.length >= 5) {
    const promedio = totalRevenue / ranking.length;
    const top1 = ranking[0];
    const veces = (top1.totalSpent / promedio).toFixed(1);
    insights.push({
      ico: 'crown',
      title: `${top1.name} gasta ${veces}× más que tu cliente promedio`,
      body: `El cliente promedio aporta <strong class="tnum">${fmtMoney(promedio)}</strong>. <strong>${top1.name}</strong> aporta <strong class="tnum">${fmtMoney(top1.totalSpent)}</strong>. Trátalo como VIP.`,
    });
  }

  document.getElementById('insights').innerHTML = insights.map(i => `
    <div class="insight">
      <div class="ico">${icon(i.ico, 20)}</div>
      <div class="body">
        <strong>${i.title}</strong>
        <p>${i.body}</p>
      </div>
    </div>
  `).join('');
}

// ---------- Recomendaciones accionables ----------
function renderRecommendations(ranking, totalRevenue, transPorCliente) {
  const recos = [];
  const top3 = ranking.slice(0, 3).map(c => c.name);

  recos.push({
    tag: 'Prioridad alta', tagClass: 'hot', ico: 'gift',
    title: `Envía un agradecimiento personal a ${top3.join(', ')}`,
    body: 'Tus 3 mejores clientes merecen un email o WhatsApp manual con un descuento exclusivo. Costo cero, retención alta.',
  });

  const candidatos = ranking.slice(0, 10).filter(c => (transPorCliente.get(c.name) || 0) <= 2);
  if (candidatos.length) {
    recos.push({
      tag: 'Oportunidad', tagClass: 'warm', ico: 'rocket',
      title: `Recompra: ${candidatos[0].name} gastó mucho pero compró pocas veces`,
      body: `Sus tickets son altos pero la frecuencia baja. Una promo "compra de nuevo y obtén 10% de descuento" puede convertirlo en habitual.`,
    });
  }

  recos.push({
    tag: 'Cross-sell', tagClass: 'cool', ico: 'sparkles',
    title: 'Recomienda productos de la categoría favorita',
    body: 'Cada cliente tiene una categoría preferida. Los emails segmentados por categoría favorita convierten ~3× más que campañas genéricas.',
  });

  recos.push({
    tag: 'Análisis', tagClass: 'cool', ico: 'calendar',
    title: 'Repite este análisis cada mes',
    body: 'Compara los rankings mes a mes para ver quién subió, quién bajó y a quién recuperar antes de perderlo.',
  });

  document.getElementById('recommendations').innerHTML = recos.map(r => `
    <div class="reco ${r.tagClass}">
      <span class="label-tag">${r.tag}</span>
      <h4>${icon(r.ico, 18)} ${r.title}</h4>
      <p>${r.body}</p>
    </div>
  `).join('');
}

// ---------- Charts ----------
function getColors() {
  const tema = document.documentElement.dataset.theme;
  return {
    text: tema === 'dark' ? '#94a3b8' : '#475569',
    grid: tema === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
    bg: tema === 'dark' ? '#1F232D' : '#FFFFFF',
  };
}
function paletaSolida(n) {
  return Array.from({ length: n }, (_, i) => {
    const lightness = 50 + (i % 5) * 7;
    return `hsl(220, 80%, ${lightness}%)`;
  });
}

function renderCharts(ranking, cats, totalRevenue) {
  const c = getColors();

  if (catChartUser) catChartUser.destroy();
  catChartUser = new Chart(document.getElementById('catChartUser'), {
    type: 'doughnut',
    data: { labels: cats.map(c => c.name), datasets: [{ data: cats.map(c => c.revenue), backgroundColor: paletaSolida(cats.length), borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '64%',
      plugins: {
        legend: { position: 'right', labels: { color: c.text, font: { weight: '600' }, padding: 14, boxWidth: 12, boxHeight: 12 } },
        tooltip: { backgroundColor: c.bg, titleColor: '#0F172A', bodyColor: '#0F172A', padding: 12, cornerRadius: 8, callbacks: { label: ctx => '  ' + fmtMoney(ctx.parsed) } },
      },
    },
  });

  if (cats.length > 0) {
    const top = cats[0];
    const topPct = ((top.revenue / totalRevenue) * 100).toFixed(1);
    const ins = document.getElementById('insightCatsUser');
    if (ins) {
      ins.hidden = false;
      let extra = '';
      if (+topPct >= 60) extra = ' Tienes alta dependencia de una categoría — considera diversificar.';
      else if (+topPct < 25) extra = ' La distribución es equilibrada.';
      ins.innerHTML = `${icon('sparkles', 16)}<span><strong>${escapeHtml(top.name)}</strong> genera el <strong>${topPct}%</strong> de tus ingresos (${fmtMoney(top.revenue)} de ${fmtMoney(totalRevenue)}).${extra}</span>`;
    }
  }

  const top = ranking.slice(0, 10);
  if (topChartUser) topChartUser.destroy();
  topChartUser = new Chart(document.getElementById('topChartUser'), {
    type: 'bar',
    data: { labels: top.map(c => c.name), datasets: [{ label: 'Total gastado', data: top.map(c => c.totalSpent), backgroundColor: '#2563EB', borderRadius: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: c.bg, titleColor: '#0F172A', bodyColor: '#0F172A', padding: 12, cornerRadius: 8, callbacks: { label: ctx => '  ' + fmtMoney(ctx.parsed.y) } },
      },
      scales: {
        x: { ticks: { color: c.text, font: { weight: '600' } }, grid: { display: false } },
        y: { ticks: { color: c.text, callback: v => fmtMoney(v) }, grid: { color: c.grid } },
      },
    },
  });
}

// ---------- Exportar reporte ----------
function descargarReporte() {
  const fecha = new Date().toLocaleDateString('es-CO');
  const records = Parser.parsearCaso(casoActual);
  const totalRevenue = records.reduce((s, r) => s + r.price * r.quantity, 0);
  const salida = calcularPedidos(casoActual);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte ${fecha} — Clientela</title>
    <style>body{font-family:Inter,system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#0f172a;}
      h1{font-size:28px;margin-bottom:6px;} .meta{color:#64748b;margin-bottom:32px;}
      h2{font-size:18px;margin-top:32px;border-bottom:2px solid #2563EB;padding-bottom:6px;}
      pre{background:#f1f5f9;padding:14px;border-radius:8px;overflow-x:auto;font-family:Consolas,monospace;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th,td{text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;}
      th{background:#f8fafc;}
    </style></head><body>
    <h1>Reporte de tu tienda</h1>
    <p class="meta">Generado el ${fecha} · ${fmtNum(records.length)} ventas · ${fmtMoney(totalRevenue)} en ingresos</p>
    <h2>Ranking de clientes</h2>
    <pre>${escapeHtml(salida)}</pre>
    <h2>Categorías por ingresos</h2>
    <table><thead><tr><th>Categoría</th><th>Ingresos</th><th>Transacciones</th></tr></thead><tbody>
    ${(() => {
      const porCat = new Map();
      for (const r of records) {
        const e = porCat.get(r.category) || { revenue: 0, transactions: 0 };
        e.revenue += r.price * r.quantity; e.transactions += 1;
        porCat.set(r.category, e);
      }
      return [...porCat.entries()].sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([n, e]) => `<tr><td>${escapeHtml(n)}</td><td>${fmtMoney(e.revenue)}</td><td>${fmtNum(e.transactions)}</td></tr>`).join('');
    })()}
    </tbody></table>
    <p style="margin-top:40px;color:#94a3b8;font-size:12px;">Generado con Clientela — EDyA1 · UAO 2026-1</p>
    </body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `reporte_clientela_${Date.now()}.html`; a.click();
  URL.revokeObjectURL(url);
  toast('Reporte descargado. Ábrelo y usa "Imprimir → Guardar como PDF" si lo necesitas.', 'success');
}

function exportarCsv() {
  if (!casoActual) { toast('No hay datos', 'error'); return; }
  const salida = calcularPedidos(casoActual);
  const lineas = salida.split('\n');
  const csv = ['posicion,customer,totalSpent,favoriteCategory'];
  for (const ln of lineas) {
    const m = ln.match(/^(\d+)\) (\S+) (\d+) (.+)$/);
    if (m) csv.push(`${m[1]},${m[2]},${m[3]},${m[4]}`);
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `mis_clientes_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast('Lista de clientes exportada', 'success');
}

// ---------- Wire-up ----------
window.addEventListener('DOMContentLoaded', () => {
  aplicarTema(temaInicial());

  document.getElementById('btnTheme').addEventListener('click', () => {
    aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('ctaStart').addEventListener('click', () => irAPaso('upload'));
  document.getElementById('ctaDemo').addEventListener('click', usarDemo);

  document.getElementById('choiceDemo').addEventListener('click', usarDemo);
  document.getElementById('choiceUpload').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('choicePaste').addEventListener('click', () => {
    document.getElementById('pasteArea').hidden = false;
    document.getElementById('pasteInput').focus();
  });
  document.getElementById('btnUsePaste').addEventListener('click', usarPasted);
  document.getElementById('btnCancelPaste').addEventListener('click', () => document.getElementById('pasteArea').hidden = true);
  document.getElementById('fileInput').addEventListener('change', e => leerCsv(e.target.files[0]));

  document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => irAPaso(b.dataset.goto)));

  document.getElementById('btnNewAnalysis').addEventListener('click', () => irAPaso('upload'));
  document.getElementById('btnDownloadReport').addEventListener('click', descargarReporte);
  document.getElementById('exportCsvUser').addEventListener('click', exportarCsv);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
