/*
 *  Busqueda
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Búsqueda binaria recursiva sobre un arreglo de Cliente ordenado
 *  alfabéticamente por nombre. Sigue exactamente la misma estructura
 *  recursiva del esquema busquedaBinaria_por_placa de la Práctica 6.
 *
 *  Caso de uso: tras calcular el ranking, permite consultar en O(log n)
 *  la posición de un cliente específico sin recorrer toda la lista.
 *  Por ejemplo, para responder "¿en qué puesto quedó CLIENTE_X?".
 *
 *  PARÁMETROS (convención de la Práctica 6):
 *    A    = secuencia ordenada
 *    p, q = posiciones inicio y fin del segmento de búsqueda
 *    name = clave (nombre del cliente) a buscar
 */
import { compararStrings } from './comparadores.js';

// Búsqueda binaria recursiva sobre A[p..q] por nombre de cliente.
// PRE: el arreglo está ordenado ascendentemente por A[i].name.
// Devuelve el índice del cliente si lo encuentra, -1 si no.
// Complejidad: O(log n) tiempo, O(log n) espacio (pila de recursión).
export function busquedaBinariaPorNombre(A, p, q, name) {
    if (p > q) return -1;
    const m = (p + q) >>> 1;
    const c = compararStrings(A[m].name, name);
    if (c === 0) return m;
    if (c > 0)   return busquedaBinariaPorNombre(A, p, m - 1, name);
    return busquedaBinariaPorNombre(A, m + 1, q, name);
}

// Wrapper de conveniencia: oculta los parámetros p y q.
// Devuelve un mensaje formateado al estilo Práctica 6.
export function consultarRanking(ranking, name) {
    // Para usar búsqueda binaria por nombre necesitaríamos el arreglo
    // re-ordenado por nombre. Aquí hacemos una pasada lineal sobre el
    // ranking (ya ordenado por totalSpent), porque normalmente sólo
    // se consulta UNA vez tras un cálculo, y O(n) es óptimo si se
    // hace una sola consulta. La búsqueda binaria queda disponible
    // arriba para casos donde se requieran consultas repetidas.
    for (let i = 0; i < ranking.length; i++) {
        if (ranking[i].name === name) {
            return (i + 1) + ') ' + ranking[i].toString();
        }
    }
    return 'No existe el cliente ' + name;
}
