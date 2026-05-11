/*
 *  Comparadores
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Funciones de comparación independientes del API nativo. Se evita
 *  String.localeCompare para tener control total sobre el criterio
 *  (comparación por código de carácter, idéntico a la convención
 *  vista en clase con el operador relacional sobre strings).
 */

// Compara dos strings carácter a carácter por código UTF-16.
// Devuelve <0 si a<b, >0 si a>b, 0 si iguales.
// Complejidad: O(min(|a|, |b|)).
export function compararStrings(a, b) {
    const la = a.length;
    const lb = b.length;
    const min = la < lb ? la : lb;
    for (let i = 0; i < min; i++) {
        const ca = a.charCodeAt(i);
        const cb = b.charCodeAt(i);
        if (ca !== cb) return ca - cb;
    }
    return la - lb;
}

// Comparador multi-criterio para Cliente, según criterios del enunciado:
//   1) totalSpent          - DESCENDENTE
//   2) favoriteCategory    - DESCENDENTE
//   3) name (customer)     - ASCENDENTE
//
// Convención del retorno: <0 si 'a' debe ir ANTES que 'b', >0 si DESPUÉS,
// 0 si son equivalentes para el ordenamiento.
//
// Complejidad: O(k) donde k = longitud máxima de los campos string.
export function comparadorClientes(a, b) {
    if (a.totalSpent !== b.totalSpent) return b.totalSpent - a.totalSpent;
    const cFav = compararStrings(b.favoriteCategory, a.favoriteCategory);
    if (cFav !== 0) return cFav;
    return compararStrings(a.name, b.name);
}
