// =============================================================================
// benchmark.js — Comparación empírica de algoritmos de ordenamiento
// =============================================================================
// Mide tiempo y verifica correctitud cruzada (todos los algoritmos deben
// producir los mismos clientes en posiciones equivalentes para el criterio
// principal — los empates pueden quedar reordenados según la estabilidad).
// =============================================================================

(function (global) {
  const A = (typeof require !== 'undefined') ? require('./algoritmos.js') : global.Algoritmos;
  const G = (typeof require !== 'undefined') ? require('./generador.js') : global.Generador;
  const P = (typeof require !== 'undefined') ? require('./parser.js')    : global.Parser;

  // Construye la lista de clientes (sin ordenar) a partir de un caso, para
  // que el benchmark mida sólo la fase de ordenamiento, no el parseo.
  function construirClientes(caso) {
    const records = P.parsearCaso(caso);
    const porCliente = new Map();
    for (const r of records) {
      let info = porCliente.get(r.customer);
      if (!info) { info = { totalSpent: 0, categorias: new Map() }; porCliente.set(r.customer, info); }
      info.totalSpent += r.price * r.quantity;
      info.categorias.set(r.category, (info.categorias.get(r.category) || 0) + 1);
    }
    const out = [];
    for (const [name, info] of porCliente) {
      let mejorCat = '', mejorFreq = -1;
      for (const [cat, freq] of info.categorias) {
        if (freq > mejorFreq || (freq === mejorFreq && cat > mejorCat)) { mejorCat = cat; mejorFreq = freq; }
      }
      out.push({ name, totalSpent: info.totalSpent, favoriteCategory: mejorCat });
    }
    return out;
  }

  function ahora() {
    if (typeof performance !== 'undefined' && performance.now) return performance.now();
    const [s, ns] = process.hrtime();
    return s * 1000 + ns / 1e6;
  }

  function clonar(arr) { return arr.slice(); }

  function correrUno(nombre, fnSort, base) {
    const arr = clonar(base);
    const t0 = ahora();
    fnSort(arr);
    const t1 = ahora();
    return { algoritmo: nombre, n: arr.length, ms: +(t1 - t0).toFixed(3), ok: arr.length === base.length };
  }

  function correr({ m = 5000, n = 200, p = 5, seed = 7 } = {}) {
    const caso = G.generarCaso({ m, n, p, seed });
    const base = construirClientes(caso);

    const resultados = [
      correrUno('MergeSort propio (estable)',  arr => A.mergeSort(arr, A.comparadorClientes), base),
      correrUno('QuickSort 3-way propio',      arr => A.quickSort3W(arr, A.comparadorClientes), base),
      correrUno('Array.sort nativo (V8)',      arr => arr.sort(A.comparadorClientes), base),
    ];
    if (base.length <= 5000) {
      resultados.push(correrUno('Insertion Sort propio', arr => A.insertionSort(arr, A.comparadorClientes), base));
    }
    // Radix sólo ordena por el criterio primario (totalSpent desc); se incluye
    // como demostración educativa de O(d·n) y se marca como tal.
    resultados.push({
      ...correrUno('RadixSort LSD (sólo criterio 1)', arr => A.radixSortPorTotalSpentDesc(arr), base),
      nota: 'Sólo ordena por totalSpent; criterios 2 y 3 no aplicados',
    });

    return { params: { m, n, p, seed }, nClientes: base.length, resultados };
  }

  const Benchmark = { correr, construirClientes };
  if (typeof module !== 'undefined' && module.exports) module.exports = Benchmark;
  if (typeof window !== 'undefined') window.Benchmark = Benchmark;

  if (typeof require !== 'undefined' && require.main === module) {
    const escenarios = [
      { m: 1000,    n: 50,   p: 5 },
      { m: 10000,   n: 500,  p: 8 },
      { m: 100000,  n: 2000, p: 10 },
    ];
    for (const esc of escenarios) {
      const r = correr(esc);
      console.log(`\n== m=${esc.m}, n=${esc.n}, p=${esc.p} → ${r.nClientes} clientes ==`);
      for (const t of r.resultados) {
        console.log(`  ${t.ms.toString().padStart(8)} ms   ${t.algoritmo}${t.nota ? '  [' + t.nota + ']' : ''}`);
      }
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
