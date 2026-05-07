// =============================================================================
// tests.js — Suite de tests para calcularPedidos
// =============================================================================
// Corre tanto en Node (`node app/js/tests.js`) como en el navegador (la UI
// llama a TestRunner.correr() para mostrar resultados en pantalla).
// =============================================================================

(function (global) {
  const { calcularPedidos } = (typeof require !== 'undefined')
    ? require('./util.js')
    : global;

  const tests = [];
  function test(nombre, fn) { tests.push({ nombre, fn }); }
  function assertEq(actual, esperado, msg) {
    if (actual !== esperado) {
      throw new Error(`${msg || 'assertEq'}\n  esperado: ${JSON.stringify(esperado)}\n  actual:   ${JSON.stringify(actual)}`);
    }
  }

  // ------- Caso del PDF (debe coincidir exactamente con el ejemplo) -------
  test('Ejemplo del enunciado', () => {
    const caso = 'Customer1 Laptop Technology 3000 1 10;Customer2 Shirt Clothing 50 2 12;Customer1 Mouse Technology 100 1 15;Customer2 Shoes Clothing 200 1 20;Customer3 TV Technology 2500 1 25';
    const esperado = '1) Customer1 3100 Technology\n2) Customer3 2500 Technology\n3) Customer2 300 Clothing';
    assertEq(calcularPedidos(caso), esperado);
  });

  // ------- Empate en totalSpent → desempata por favoriteCategory desc -------
  test('Empate totalSpent → favoriteCategory desc', () => {
    // Ana y Beto gastan ambos 500. Ana favorita "Books" (B), Beto favorita "Toys" (T).
    // Toys > Books lexicográficamente → Beto va primero.
    const caso = 'Ana Pen Books 500 1 1;Beto Car Toys 500 1 2';
    const esperado = '1) Beto 500 Toys\n2) Ana 500 Books';
    assertEq(calcularPedidos(caso), esperado);
  });

  // ------- Empate en totalSpent y favoriteCategory → customer asc -------
  test('Empate doble → customer asc', () => {
    const caso = 'Zoe Pen Books 500 1 1;Ana Pen Books 500 1 2';
    const esperado = '1) Ana 500 Books\n2) Zoe 500 Books';
    assertEq(calcularPedidos(caso), esperado);
  });

  // ------- price·quantity acumulado correcto -------
  test('Acumulación price*quantity', () => {
    const caso = 'Pepe Item Cat 10 5 1;Pepe Item Cat 20 3 2'; // 50 + 60 = 110
    assertEq(calcularPedidos(caso), '1) Pepe 110 Cat');
  });

  // ------- favoriteCategory por #transacciones -------
  test('favoriteCategory = categoría con más transacciones', () => {
    // Books: 2 records, Toys: 1 record → Books es favorita.
    const caso = 'Lu Pen Books 1 1 1;Lu Pad Books 1 1 2;Lu Car Toys 1 1 3';
    assertEq(calcularPedidos(caso), '1) Lu 3 Books');
  });

  // ------- Robustez: separadores y espacios extra -------
  test('Tolerancia a espacios extra y ; al final', () => {
    const caso = '  Ana Pen Books 100 1 1 ;  Ana Pen Books 100 1 2;';
    assertEq(calcularPedidos(caso), '1) Ana 200 Books');
  });

  // ------- Records mal formados se ignoran -------
  test('Ignora records mal formados', () => {
    const caso = 'malformado;Ana Pen Books 100 1 1';
    assertEq(calcularPedidos(caso), '1) Ana 100 Books');
  });

  // ------- Caso vacío -------
  test('String vacío → salida vacía', () => {
    assertEq(calcularPedidos(''), '');
  });

  // ------- Volumen: 10000 records, 100 customers, 5 categorías -------
  test('Volumen 10k records sin errores', () => {
    const cats = ['Tech', 'Books', 'Food', 'Toys', 'Clothing'];
    const partes = [];
    for (let i = 0; i < 10000; i++) {
      const cust = 'C' + (i % 100);
      const cat = cats[i % cats.length];
      partes.push(`${cust} P Cat${cat} 10 1 ${i}`);
    }
    const out = calcularPedidos(partes.join(';'));
    const lineas = out.split('\n');
    assertEq(lineas.length, 100, 'debe haber 100 clientes');
    // Primera línea debe empezar con "1)" y tener un totalSpent positivo.
    if (!/^1\) C\d+ \d+ /.test(lineas[0])) {
      throw new Error('Formato de primera línea inesperado: ' + lineas[0]);
    }
  });

  // ------- Estabilidad del MergeSort en empates triples -------
  test('Estabilidad: orden determinístico ante empates', () => {
    const caso = 'C Pen Books 10 1 1;A Pen Books 10 1 2;B Pen Books 10 1 3';
    assertEq(calcularPedidos(caso), '1) A 10 Books\n2) B 10 Books\n3) C 10 Books');
  });

  function correr(log) {
    log = log || ((...a) => console.log(...a));
    let ok = 0, fail = 0;
    const fallos = [];
    for (const t of tests) {
      try { t.fn(); ok++; log('  OK  ' + t.nombre); }
      catch (e) { fail++; fallos.push({ nombre: t.nombre, err: e.message }); log('FAIL  ' + t.nombre + '\n      ' + e.message); }
    }
    log(`\n${ok}/${tests.length} pasaron, ${fail} fallaron.`);
    return { ok, fail, total: tests.length, fallos };
  }

  const TestRunner = { correr, tests };
  if (typeof module !== 'undefined' && module.exports) module.exports = TestRunner;
  if (typeof window !== 'undefined') window.TestRunner = TestRunner;

  // Si se ejecuta directamente con Node, correr y salir con código apropiado.
  if (typeof require !== 'undefined' && require.main === module) {
    const r = correr();
    process.exit(r.fail === 0 ? 0 : 1);
  }
})(typeof window !== 'undefined' ? window : globalThis);
