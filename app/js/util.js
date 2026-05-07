// =============================================================================
// util.js — Función calcularPedidos exigida por el enunciado
// =============================================================================
// Tarea Final EDyA1 — Análisis de Pedidos en Comercio Electrónico — UAO 2026-1
//
// Entrada (string):  record1;record2;...;recordm
// Cada record:       customer product category price quantity timestamp
//
// Salida (string, n líneas):
//   [a]) customer [totalSpent] [favoriteCategory]
//
// Criterios de orden:
//   1) totalSpent          — descendente
//   2) favoriteCategory    — descendente
//   3) customer            — ascendente
//
// Notación de complejidad:
//   m = #records,  n = #customers,  p = #categorías,  k = long. media de campo.
//
// Complejidad por fragmento:
//   Parseo del caso         → O(m·k)            (parser.js, scan O(L))
//   Acumulación por cliente → O(m)              (Map: O(1) amortizado)
//   Cálculo favoriteCategory → O(n·p)           (recorre categorías por cliente)
//   Ordenamiento (MergeSort) → O(n log n)       (estable, propio)
//   Formateo de salida       → O(n·k)
// -----------------------------------------------------------------------------
//   TOTAL  →  O(m·k + n·p + n log n + n·k)
//          ≈  O(m + n·p + n log n)   asumiendo k constante.
// =============================================================================

(function (global) {
  // En Node tomamos los módulos por require; en navegador desde window.
  const { parsearCaso } = (typeof require !== 'undefined')
    ? require('./parser.js')
    : global.Parser;
  const { mergeSort, comparadorClientes } = (typeof require !== 'undefined')
    ? require('./algoritmos.js')
    : global.Algoritmos;

  function calcularPedidos(caso) {
    if (typeof caso !== 'string' || caso.length === 0) return '';

    // 1) Parseo del caso → array de records.        O(m·k)
    const records = parsearCaso(caso);
    if (records.length === 0) return '';

    // 2) Acumular por cliente:                       O(m)
    //    - totalSpent = Σ price·quantity
    //    - categorias = Map<categoria, frecuencia>   (frecuencia = #transacciones)
    //
    //    Decisión de diseño: "categoría en la que más compras realizó" se
    //    interpreta como el número de transacciones (records) en cada
    //    categoría. Justificación: una compra = una transacción. Si dos
    //    categorías empatan, se desempata por orden lexicográfico DESCENDENTE
    //    (consistente con el criterio 2 del enunciado).
    const porCliente = new Map();
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      let info = porCliente.get(r.customer);
      if (info === undefined) {
        info = { totalSpent: 0, categorias: new Map() };
        porCliente.set(r.customer, info);
      }
      info.totalSpent += r.price * r.quantity;
      info.categorias.set(r.category, (info.categorias.get(r.category) || 0) + 1);
    }

    // 3) Construir lista de clientes con favoriteCategory.   O(n·p)
    const clientes = new Array(porCliente.size);
    let idx = 0;
    for (const [name, info] of porCliente) {
      let mejorCat = '';
      let mejorFreq = -1;
      for (const [cat, freq] of info.categorias) {
        // Empate por frecuencia → ganamos por categoría lexicográficamente
        // mayor (consistente con criterio 2: favoriteCategory descendente).
        if (freq > mejorFreq || (freq === mejorFreq && cat > mejorCat)) {
          mejorCat = cat;
          mejorFreq = freq;
        }
      }
      clientes[idx++] = {
        name,
        totalSpent: info.totalSpent,
        favoriteCategory: mejorCat,
      };
    }

    // 4) Ordenar con MergeSort propio + comparador multi-criterio.  O(n log n)
    mergeSort(clientes, comparadorClientes);

    // 5) Formatear salida.                                            O(n·k)
    const partes = new Array(clientes.length);
    for (let i = 0; i < clientes.length; i++) {
      const c = clientes[i];
      // totalSpent puede ser entero o decimal; mantenemos formato del enunciado
      // (ejemplo del PDF muestra enteros). Si es entero, lo emitimos sin decimales.
      const ts = Number.isInteger(c.totalSpent) ? c.totalSpent : c.totalSpent;
      partes[i] = `${i + 1}) ${c.name} ${ts} ${c.favoriteCategory}`;
    }
    return partes.join('\n');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calcularPedidos };
  }
  if (typeof window !== 'undefined') {
    window.calcularPedidos = calcularPedidos;
  }
})(typeof window !== 'undefined' ? window : globalThis);
