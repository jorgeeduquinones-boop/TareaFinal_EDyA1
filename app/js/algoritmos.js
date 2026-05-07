// =============================================================================
// algoritmos.js — Implementaciones propias de ordenamientos
// =============================================================================
// Sin dependencias del Array.sort nativo. Cumple el requisito del enunciado:
// "uso de los algoritmos vistos en clase, especialmente ordenamientos".
//
// Notación: n = número de elementos a ordenar (clientes en el problema).
// =============================================================================

// -----------------------------------------------------------------------------
// Comparación lexicográfica de strings sin localeCompare.
// Compara código a código; O(min(|a|,|b|)).
// Devuelve: <0 si a<b, >0 si a>b, 0 si iguales.
// -----------------------------------------------------------------------------
function compararStrings(a, b) {
  const la = a.length, lb = b.length;
  const min = la < lb ? la : lb;
  for (let i = 0; i < min; i++) {
    const ca = a.charCodeAt(i), cb = b.charCodeAt(i);
    if (ca !== cb) return ca - cb;
  }
  return la - lb;
}

// -----------------------------------------------------------------------------
// Comparador multi-criterio para clientes según el enunciado:
//   1) totalSpent  — descendente
//   2) favoriteCategory — descendente
//   3) name (customer) — ascendente
// Devuelve <0 si a debe ir antes que b, >0 si después, 0 si equivalentes.
// -----------------------------------------------------------------------------
function comparadorClientes(a, b) {
  if (a.totalSpent !== b.totalSpent) return b.totalSpent - a.totalSpent;
  const cFav = compararStrings(b.favoriteCategory, a.favoriteCategory);
  if (cFav !== 0) return cFav;
  return compararStrings(a.name, b.name);
}

// -----------------------------------------------------------------------------
// MergeSort estable.
// Complejidad temporal: O(n log n) en el peor caso.
// Complejidad espacial: O(n) por el buffer auxiliar.
// La estabilidad se garantiza usando '<= 0' al elegir del lado izquierdo
// durante el merge: ante empates, el elemento de la mitad izquierda se
// coloca primero, preservando el orden relativo original.
// -----------------------------------------------------------------------------
function mergeSort(arr, cmp) {
  const n = arr.length;
  if (n <= 1) return arr;
  const aux = new Array(n);
  // Bottom-up para evitar overhead de recursión profunda en arreglos grandes.
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      merge(arr, aux, lo, mid, hi, cmp);
    }
  }
  return arr;
}

function merge(arr, aux, lo, mid, hi, cmp) {
  for (let k = lo; k < hi; k++) aux[k] = arr[k];
  let i = lo, j = mid;
  for (let k = lo; k < hi; k++) {
    if (i >= mid)                  arr[k] = aux[j++];
    else if (j >= hi)              arr[k] = aux[i++];
    else if (cmp(aux[i], aux[j]) <= 0) arr[k] = aux[i++]; // <= 0 → estable
    else                           arr[k] = aux[j++];
  }
}

// -----------------------------------------------------------------------------
// QuickSort 3-way (Dutch National Flag).
// Promedio O(n log n), peor O(n²) (mitigado por pivote aleatorio).
// In-place, no estable. Útil como baseline comparativo en el benchmark.
// -----------------------------------------------------------------------------
function quickSort3W(arr, cmp) {
  qs3w(arr, 0, arr.length - 1, cmp);
  return arr;
}

function qs3w(a, lo, hi, cmp) {
  if (hi <= lo) return;
  // Pivote aleatorio para evitar peor caso en datos casi ordenados.
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));
  [a[lo], a[r]] = [a[r], a[lo]];
  let lt = lo, gt = hi, i = lo + 1;
  const v = a[lo];
  while (i <= gt) {
    const c = cmp(a[i], v);
    if (c < 0)      [a[lt], a[i]] = [a[i], a[lt]], lt++, i++;
    else if (c > 0) [a[i], a[gt]] = [a[gt], a[i]], gt--;
    else            i++;
  }
  qs3w(a, lo, lt - 1, cmp);
  qs3w(a, gt + 1, hi, cmp);
}

// -----------------------------------------------------------------------------
// RadixSort LSD para enteros no negativos.
// Complejidad: O(d · (n + b)) con d = dígitos, b = base.
// Aquí ordenamos clientes por totalSpent (entero) en orden DESCENDENTE.
// Truco: ordenamos por (MAX - totalSpent) ascendente para usar radix LSD
// estándar. Es estable, lo que permite combinarlo con MergeSort para los
// criterios secundarios (en el benchmark hacemos esa demostración).
// -----------------------------------------------------------------------------
function radixSortPorTotalSpentDesc(arr) {
  if (arr.length <= 1) return arr;
  let max = 0;
  for (const c of arr) if (c.totalSpent > max) max = c.totalSpent;
  // Construimos clave invertida = max - totalSpent para ordenar asc.
  let claves = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) claves[i] = max - arr[i].totalSpent;
  // Determinar número de dígitos (base 256 para mejor rendimiento).
  const BASE = 256;
  let maxClave = 0;
  for (const k of claves) if (k > maxClave) maxClave = k;
  let aux = new Array(arr.length);
  let auxClaves = new Array(arr.length);
  for (let exp = 1; Math.floor(maxClave / exp) > 0; exp *= BASE) {
    const cuenta = new Array(BASE).fill(0);
    for (const k of claves) cuenta[Math.floor(k / exp) % BASE]++;
    for (let i = 1; i < BASE; i++) cuenta[i] += cuenta[i - 1];
    // Recorrido inverso para mantener estabilidad.
    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(claves[i] / exp) % BASE;
      const pos = --cuenta[d];
      aux[pos] = arr[i];
      auxClaves[pos] = claves[i];
    }
    [arr, aux] = [aux, arr];
    [claves, auxClaves] = [auxClaves, claves];
  }
  return arr;
}

// -----------------------------------------------------------------------------
// Insertion Sort (estable, in-place). O(n²) peor caso, O(n) si casi ordenado.
// Útil como baseline didáctico en el benchmark.
// -----------------------------------------------------------------------------
function insertionSort(arr, cmp) {
  for (let i = 1; i < arr.length; i++) {
    const x = arr[i];
    let j = i - 1;
    while (j >= 0 && cmp(arr[j], x) > 0) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = x;
  }
  return arr;
}

// Exportar al ámbito global para el navegador y a module.exports para tests Node.
const Algoritmos = {
  compararStrings,
  comparadorClientes,
  mergeSort,
  quickSort3W,
  radixSortPorTotalSpentDesc,
  insertionSort,
};

if (typeof module !== 'undefined' && module.exports) module.exports = Algoritmos;
if (typeof window !== 'undefined') window.Algoritmos = Algoritmos;
