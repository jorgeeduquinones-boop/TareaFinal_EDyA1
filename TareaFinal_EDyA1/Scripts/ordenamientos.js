/*
 *  Ordenamientos
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Implementación propia de QuickSort recursivo basada en el esquema
 *  particion_por_Nombre / quickSort_por_Nombre de la Práctica 5,
 *  extendida con tres mejoras profesionales:
 *
 *    1) PIVOTE POR MEDIANA DE TRES.
 *       Selecciona la mediana entre A[p], A[medio], A[r] como pivote.
 *       Evita el peor caso O(n²) sobre datos ya ordenados o casi
 *       ordenados (situación común al re-ordenar rankings).
 *
 *    2) INSERTION SORT EN PARTICIONES PEQUEÑAS (UMBRAL = 16).
 *       Insertion Sort tiene constante muy baja y es más rápido que
 *       QuickSort en arreglos pequeños. Es la misma técnica que usan
 *       implementaciones reales (Java Dual-Pivot Quicksort, V8,
 *       libstdc++, .NET Array.Sort).
 *
 *    3) RECURSIÓN OPTIMIZADA EN COLA.
 *       Tras particionar, se recursa SÓLO sobre la mitad MENOR y se
 *       itera sobre la mayor (técnica conocida como "tail-call
 *       elimination manual"). Garantiza profundidad de pila O(log n)
 *       incluso en el peor caso, evitando stack overflow.
 *
 *  Complejidad temporal: O(n log n) en promedio, O(n²) peor caso
 *    teórico (mitigado por mediana de tres).
 *  Complejidad espacial: O(log n) por la recursión limitada.
 *
 *  PARÁMETROS (igual a la convención de la Práctica 5):
 *    A = secuencia    p = inicio    r = final    q = pivote
 *    cmp = función comparadora (a,b) → number
 */

// Tamaño bajo el cual conviene cambiar a Insertion Sort.
// Valor típico en literatura: entre 7 y 16. 16 va bien para JS V8.
const UMBRAL_INSERTION = 16;

// Insertion Sort sobre el segmento A[p..r].
// Estable, in-place. Complejidad: O((r-p)²) peor caso, O(r-p) si casi ordenado.
export function insertionSort(A, p, r, cmp) {
    for (let i = p + 1; i <= r; i++) {
        const x = A[i];
        let j = i - 1;
        while (j >= p && cmp(A[j], x) > 0) {
            A[j + 1] = A[j];
            j--;
        }
        A[j + 1] = x;
    }
}

// Mediana de tres: ordena A[p], A[medio], A[r] entre sí y deja la
// mediana en posición r para usarla como pivote en la partición Lomuto.
// Complejidad: O(1) (3 comparaciones, hasta 3 intercambios).
function medianaDeTres(A, p, r, cmp) {
    const m = (p + r) >>> 1; // división entera rápida
    let aux;
    if (cmp(A[p], A[m]) > 0) { aux = A[p]; A[p] = A[m]; A[m] = aux; }
    if (cmp(A[p], A[r]) > 0) { aux = A[p]; A[p] = A[r]; A[r] = aux; }
    if (cmp(A[m], A[r]) > 0) { aux = A[m]; A[m] = A[r]; A[r] = aux; }
    // mediana queda en m → la movemos a r para usarla como pivote
    aux = A[m]; A[m] = A[r]; A[r] = aux;
}

// Partición Lomuto sobre A[p..r] usando A[r] como pivote.
// Misma estructura que particion_por_Nombre (Práctica 5), generalizada
// con un comparador 'cmp' arbitrario para soportar criterio multi-campo.
//
// Devuelve la posición final del pivote (q): tras la partición se
// cumple que A[p..q-1] < pivote ≤ A[q..r].
// Complejidad: O(r - p).
export function particion(A, p, r, cmp) {
    medianaDeTres(A, p, r, cmp);
    const x = A[r];
    let i = p - 1;
    let aux;
    for (let j = p; j <= r - 1; j++) {
        if (cmp(A[j], x) < 0) {
            i = i + 1;
            aux = A[i]; A[i] = A[j]; A[j] = aux;
        }
    }
    aux = A[i + 1]; A[i + 1] = A[r]; A[r] = aux;
    return i + 1;
}

// QuickSort recursivo sobre A[p..r] con el comparador 'cmp'.
// Misma estructura conceptual que quickSort_por_Nombre (Práctica 5),
// con las tres mejoras descritas en la cabecera del módulo.
//
// El bucle while + recursión sólo sobre la mitad menor implementa la
// optimización de cola: la profundidad de la pila queda acotada por
// log₂(n) en lugar del peor caso n.
export function quickSort(A, p, r, cmp) {
    while (p < r) {
        if (r - p < UMBRAL_INSERTION) {
            insertionSort(A, p, r, cmp);
            return;
        }
        const q = particion(A, p, r, cmp);
        if (q - p < r - q) {
            quickSort(A, p, q - 1, cmp);
            p = q + 1;
        } else {
            quickSort(A, q + 1, r, cmp);
            r = q - 1;
        }
    }
}
