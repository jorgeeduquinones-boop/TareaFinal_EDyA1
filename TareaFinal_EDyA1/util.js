/*
 *  util.js - Función calcularPedidos
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  ENTRADA  (string):
 *    record1;record2;...;recordm
 *    Cada record:  customer product category price quantity timestamp
 *
 *  SALIDA   (string, n líneas):
 *    [pos]) customer totalSpent favoriteCategory
 *
 *  CRITERIOS DE ORDEN DEL RANKING:
 *    1) totalSpent          - DESCENDENTE
 *    2) favoriteCategory    - DESCENDENTE
 *    3) customer            - ASCENDENTE
 *
 *  ─────────────────────────────────────────────────────────────────────
 *  ANÁLISIS DE COMPLEJIDAD COMPUESTA
 *  ─────────────────────────────────────────────────────────────────────
 *    m = #records      n = #clientes
 *    p = #categorías promedio por cliente   k = longitud media de campo
 *
 *    Parseo (parser.js)               →  O(m · k)
 *    Acumulación por cliente          →  O(m)        [hash O(1) amortiz.]
 *    Cálculo categoría favorita       →  O(n · p)
 *    QuickSort propio (ordenamientos.js) →  O(n log n) promedio
 *    Formateo de salida               →  O(n · k)
 *    ────────────────────────────────────────────
 *    TOTAL                            →  O(m + n·p + n log n)
 *
 *  ─────────────────────────────────────────────────────────────────────
 *  CONCEPTOS DEL CURSO APLICADOS
 *  ─────────────────────────────────────────────────────────────────────
 *    Práctica 4 (Recursividad):
 *      → Funciones recursivas auxiliares en recursividad.js
 *        (suma total, conteo premium, top cliente).
 *      → Estructura recursiva del propio QuickSort.
 *
 *    Práctica 5 (Ordenamiento):
 *      → QuickSort recursivo basado en el esquema particion_por_Nombre /
 *        quickSort_por_Nombre, con tres mejoras profesionales:
 *          - mediana de tres como pivote (evita peor caso O(n²))
 *          - insertion sort en particiones pequeñas
 *          - recursión optimizada en cola (pila O(log n) garantizada)
 *      → Patrón clase con toString() (estilo Vehiculo / Soat) aplicado
 *        a Pedido y Cliente.
 *
 *    Práctica 6 (Búsqueda):
 *      → Búsqueda binaria recursiva por nombre en busqueda.js, útil
 *        para consultar la posición de un cliente en el ranking.
 */

import { parsearCaso } from './Scripts/parser.js';
import { Cliente } from './Scripts/Cliente.js';
import { quickSort } from './Scripts/ordenamientos.js';
import { comparadorClientes, compararStrings } from './Scripts/comparadores.js';
import { busquedaBinariaPorNombre, consultarRanking } from './Scripts/busqueda.js';
import { sumaTotalRecursiva, contarClientesPremium, topClienteRecursivo } from './Scripts/recursividad.js';

export function calcularPedidos(caso) {
    if (typeof caso !== 'string' || caso.length === 0) return '';

    // 1) Parseo: string → Pedido[]                                  O(m·k)
    const pedidos = parsearCaso(caso);
    if (pedidos.length === 0) return '';

    // 2) Acumulación por cliente.                                   O(m)
    //    Hash directo (Object.create(null)) para inserción y lookup
    //    O(1) amortizado. 'clientes' guarda el orden de aparición
    //    para iterar sin recorrer el hash dos veces.
    const indice = Object.create(null);
    const clientes = [];
    for (let i = 0; i < pedidos.length; i++) {
        const ped = pedidos[i];
        let cli = indice[ped.customer];
        if (cli === undefined) {
            cli = new Cliente(ped.customer);
            indice[ped.customer] = cli;
            clientes.push(cli);
        }
        cli.registrarPedido(ped);
    }

    // 3) Cálculo de categoría favorita por cliente.                 O(n·p)
    for (let i = 0; i < clientes.length; i++) {
        clientes[i].calcularCategoriaFavorita();
    }

    // 4) Ordenamiento con QuickSort propio + comparador multi-criterio.
    //                                                               O(n log n)
    quickSort(clientes, 0, clientes.length - 1, comparadorClientes);

    // 5) Formateo de salida según especificación del enunciado.     O(n·k)
    let salida = '';
    for (let i = 0; i < clientes.length; i++) {
        salida += (i + 1) + ') ' + clientes[i].toString();
        if (i < clientes.length - 1) salida += '\n';
    }
    return salida;
}

// -----------------------------------------------------------------------------
// rankingPorNombre(ranking)
//   Re-ordena el ranking alfabéticamente por nombre (precondición para
//   poder aplicar la búsqueda binaria recursiva de la Práctica 6).
//   Reusa el mismo QuickSort recursivo + un comparador por nombre.
//   Complejidad: O(n log n).
// -----------------------------------------------------------------------------
export function rankingPorNombre(ranking) {
    const copia = ranking.slice();
    quickSort(copia, 0, copia.length - 1, (a, b) => compararStrings(a.name, b.name));
    return copia;
}

// -----------------------------------------------------------------------------
// posicionDeCliente(ranking, name)
//   Búsqueda binaria recursiva (Práctica 6) para localizar un cliente
//   dentro del ranking ya calculado. Devuelve la posición 1-indexada en
//   el ranking original (no en el arreglo ordenado por nombre).
//   Complejidad: O(n log n) reordenando + O(log n) buscando.
// -----------------------------------------------------------------------------
export function posicionDeCliente(ranking, name) {
    if (!ranking || ranking.length === 0) return -1;
    const porNombre = rankingPorNombre(ranking);
    const i = busquedaBinariaPorNombre(porNombre, 0, porNombre.length - 1, name);
    if (i < 0) return -1;
    const cliente = porNombre[i];
    for (let j = 0; j < ranking.length; j++) {
        if (ranking[j] === cliente) return j + 1;
    }
    return -1;
}

// -----------------------------------------------------------------------------
// resumenAgregado(ranking, umbralPremium = 0)
//   Aplica las tres funciones recursivas de la Práctica 4 sobre el
//   ranking ya calculado: suma total, conteo de clientes premium y
//   búsqueda del cliente top. Se ofrece como utilidad de verificación.
//   Complejidad: O(n) tiempo, O(n) espacio (pila de recursión).
// -----------------------------------------------------------------------------
export function resumenAgregado(ranking, umbralPremium) {
    if (!ranking || ranking.length === 0) {
        return { totalGastado: 0, clientesPremium: 0, topCliente: null };
    }
    const umbral = typeof umbralPremium === 'number' ? umbralPremium : 0;
    return {
        totalGastado: sumaTotalRecursiva(ranking, 0),
        clientesPremium: contarClientesPremium(ranking, 0, umbral),
        topCliente: topClienteRecursivo(ranking, 0, null),
    };
}

// -----------------------------------------------------------------------------
// Exposición global para entornos navegador y enganche del botón "Calcular".
// Permite que index.html invoque calcularPedidos sin reimportar el módulo
// y mantiene compatibilidad con cualquier test runner que cargue util.js
// como módulo y consuma window.calcularPedidos.
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
    window.calcularPedidos = calcularPedidos;
    window.posicionDeCliente = posicionDeCliente;
    window.resumenAgregado = resumenAgregado;
    window.consultarRanking = consultarRanking;
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('btnCalcular');
        const input = document.getElementById('inputCaso');
        const output = document.getElementById('output');
        if (btn && input && output) {
            btn.addEventListener('click', () => {
                output.innerText = calcularPedidos(input.value);
            });
        }
    });
}
