/*
 *  Parser
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Convierte el string de entrada en un arreglo de instancias Pedido.
 *
 *  FORMATO DE ENTRADA:
 *    record1;record2;...;recordm
 *
 *  Cada record contiene 6 campos separados por espacios:
 *    customer product category price quantity timestamp
 *
 *  Records vacíos o malformados se descartan silenciosamente, lo que
 *  da tolerancia a entradas con espacios extra o el separador final
 *  ';' que algunas representaciones añaden.
 *
 *  Complejidad: O(m · k) donde m = #records, k = longitud media de campo.
 *  Sólo se hace una pasada por la cadena (split) + una pasada por record.
 */
import { Pedido } from './Pedido.js';

export function parsearCaso(caso) {
    const registros = caso.split(';');
    const pedidos = [];
    for (let i = 0; i < registros.length; i++) {
        const linea = registros[i].trim();
        if (linea.length === 0) continue;
        const t = linea.split(/\s+/);
        if (t.length < 6) continue;
        pedidos.push(new Pedido(
            t[0],                  // customer
            t[1],                  // product
            t[2],                  // category
            parseFloat(t[3]),      // price
            parseInt(t[4], 10),    // quantity
            t[5]                   // timestamp
        ));
    }
    return pedidos;
}
