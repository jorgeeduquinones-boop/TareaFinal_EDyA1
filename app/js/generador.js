// =============================================================================
// generador.js — Generador de casos sintéticos parametrizados
// =============================================================================
// Permite crear entradas grandes para probar correctitud y medir rendimiento.
//   m = número de records, n = número de customers, p = número de categorías.
// Usa LCG determinístico (con semilla) para reproducibilidad.
// =============================================================================

(function (global) {
  // LCG (Numerical Recipes). Determinístico dado una semilla.
  function lcg(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  }

  function generarCaso({ m = 1000, n = 10, p = 5, seed = 42 } = {}) {
    const rnd = lcg(seed);
    const customers = Array.from({ length: n }, (_, i) => `Cliente${i + 1}`);
    const categorias = ['Technology', 'Clothing', 'Books', 'Food', 'Toys', 'Home', 'Sports', 'Beauty', 'Garden', 'Auto']
      .slice(0, p);
    const productos = ['Laptop', 'Phone', 'Shirt', 'Pants', 'Book', 'Pen', 'Cake', 'Bread', 'Toy', 'Ball', 'Lamp', 'Sofa'];

    const partes = new Array(m);
    for (let i = 0; i < m; i++) {
      const cust = customers[Math.floor(rnd() * n)];
      const cat = categorias[Math.floor(rnd() * p)];
      const prod = productos[Math.floor(rnd() * productos.length)];
      const price = Math.floor(rnd() * 5000) + 1;
      const quantity = Math.floor(rnd() * 5) + 1;
      const timestamp = i;
      partes[i] = `${cust} ${prod} ${cat} ${price} ${quantity} ${timestamp}`;
    }
    return partes.join(';');
  }

  const Generador = { generarCaso };
  if (typeof module !== 'undefined' && module.exports) module.exports = Generador;
  if (typeof window !== 'undefined') window.Generador = Generador;
})(typeof window !== 'undefined' ? window : globalThis);
