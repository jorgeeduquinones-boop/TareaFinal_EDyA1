// =============================================================================
// parser.js — Parsing del caso de entrada
// =============================================================================
// Formato base (enunciado):
//   record1;record2;...;recordm
// Cada record:
//   customer product category price quantity timestamp
//
// Formato extendido (casos del profesor):
//   'Cat1,Cat2,...,CatN--record1;record2;...;recordm'
//   - comillas simples externas opcionales,
//   - lista de categorías antes del separador "--".
//
// Implementación: scan manual carácter a carácter sobre el cuerpo del caso.
// Evita crear strings intermedios masivos que dispararía split(';') seguido
// de split(' ') en cada record. Bajamos asignaciones y presión de GC.
//
// Notación:  m = #records,  k = longitud media de un record,  L = m·k.
// Complejidad temporal:  O(L)  — un solo recorrido del string.
// Complejidad espacial:  O(m)  — sólo el array de records resultantes.
// =============================================================================

// Normaliza el caso de entrada: tolera comillas externas y el formato
// extendido del profesor con lista de categorías + separador "--".
// Devuelve { caso, categorias } donde categorias es null si no aparecen.
function normalizarCaso(caso) {
  if (typeof caso !== 'string') return { caso: '', categorias: null };
  let s = caso.trim();
  if ((s.startsWith("'") && s.endsWith("'")) ||
      (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  let categorias = null;
  const idx = s.indexOf('--');
  if (idx > 0) {
    const header = s.substring(0, idx);
    // Sólo tratamos como header de categorías si parece lista CSV
    // (lleva comas y no contiene separador ';' de records).
    if (header.indexOf(';') === -1 && header.indexOf(',') !== -1) {
      categorias = header.split(',').map(c => c.trim()).filter(Boolean);
      s = s.substring(idx + 2);
    }
  }
  return { caso: s, categorias };
}

function parsearCaso(caso) {
  const norm = normalizarCaso(caso);
  caso = norm.caso;
  const records = [];
  const n = caso.length;
  let i = 0;
  while (i < n) {
    // Saltar separadores y espacios al inicio del record.
    while (i < n && (caso.charCodeAt(i) === 59 /* ; */ || caso.charCodeAt(i) === 32 /* sp */)) i++;
    if (i >= n) break;

    // Leer 6 campos delimitados por espacio; el 6º termina en ';' o fin.
    const campos = new Array(6);
    let campo = 0;
    let inicio = i;
    while (i < n && campo < 6) {
      const c = caso.charCodeAt(i);
      const esSep = (c === 32 /* sp */) || (c === 9 /* tab */) || (c === 10 /* \n */) || (c === 13 /* \r */);
      const esFinRec = (c === 59 /* ; */);
      if (esSep || esFinRec) {
        if (i > inicio) {
          campos[campo++] = caso.substring(inicio, i);
        }
        if (esFinRec) { i++; break; }
        i++;
        inicio = i;
        continue;
      }
      i++;
    }
    // Capturar el último campo si el record termina en EOF sin separador.
    if (campo < 6 && i > inicio) campos[campo++] = caso.substring(inicio, i);

    if (campo < 5) continue; // record mal formado: necesitamos al menos 5 campos útiles
    const [customer, product, category, priceStr, quantityStr, timestampStr] = campos;
    const price = +priceStr;       // unario + es ~2× más rápido que parseFloat
    const quantity = +quantityStr;
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) continue;

    records.push({
      customer,
      product,
      category,
      price,
      quantity,
      timestamp: timestampStr !== undefined ? +timestampStr : 0,
    });
  }
  return records;
}

const Parser = { parsearCaso, normalizarCaso };
if (typeof module !== 'undefined' && module.exports) module.exports = Parser;
if (typeof window !== 'undefined') window.Parser = Parser;
