/*
 *  Recursividad
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Funciones recursivas sobre arreglos al estilo del calculaSuma de la
 *  Práctica 4. Se incluyen como utilidades de verificación y consulta
 *  agregada sobre el ranking final.
 *
 *  CONVENCIÓN (Práctica 4):
 *    Caso base : índice fuera del arreglo (i > A.length - 1) → valor neutro.
 *    Recursión : combinar A[i] con el resultado sobre el resto (i + 1).
 *
 *  IMPORTANTE: en JavaScript la recursividad NO es eliminada por el
 *  intérprete (no hay tail-call optimization en V8). Para arreglos
 *  muy grandes (> 10⁴) la pila puede desbordar; estas funciones se
 *  ofrecen con propósito didáctico y de verificación.
 */

// Suma recursiva de totalSpent en todo el arreglo de clientes.
// Sirve como invariante de verificación: la suma sobre el ranking
// debe coincidir con la suma de subtotales sobre los pedidos
// originales (price * quantity).
// Complejidad: O(n) tiempo, O(n) espacio (pila de recursión).
export function sumaTotalRecursiva(A, i) {
    if (i > A.length - 1) return 0;
    return A[i].totalSpent + sumaTotalRecursiva(A, i + 1);
}

// Conteo recursivo de clientes con totalSpent >= umbral.
// Útil para reportes tipo "cuántos clientes premium hay".
// Complejidad: O(n) tiempo, O(n) espacio (pila).
export function contarClientesPremium(A, i, umbral) {
    if (i > A.length - 1) return 0;
    const e = A[i].totalSpent >= umbral ? 1 : 0;
    return e + contarClientesPremium(A, i + 1, umbral);
}

// Búsqueda recursiva del cliente con MAYOR gasto total.
// Equivalente al primer puesto del ranking, calculado sin ordenar.
// Útil cuando sólo interesa el TOP 1 (puede saltarse el ordenamiento).
// Complejidad: O(n) tiempo, O(n) espacio (pila).
export function topClienteRecursivo(A, i, mejor) {
    if (i > A.length - 1) return mejor;
    if (mejor === null || A[i].totalSpent > mejor.totalSpent) {
        return topClienteRecursivo(A, i + 1, A[i]);
    }
    return topClienteRecursivo(A, i + 1, mejor);
}
