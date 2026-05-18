/*
 *  Parser
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Convierte el string de entrada en un arreglo de instancias Pedido.
 *
 *  FORMATO BASE (enunciado):
 *    record1;record2;...;recordm
 *
 *  FORMATO EXTENDIDO (casos de prueba del profesor):
 *    'Cat1,Cat2,...,CatN--record1;record2;...;recordm'
 *    Comillas simples externas opcionales. Lista de categorías declaradas
 *    al inicio, seguidas del separador "--" y luego los records normales.
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

// Normaliza el caso: tolera comillas externas y el formato extendido del
// profesor 'Cat1,...,CatN--records'. Devuelve { caso, categorias }.
export function normalizarCaso(caso) {
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
        if (header.indexOf(';') === -1 && header.indexOf(',') !== -1) {
            categorias = header.split(',').map(c => c.trim()).filter(Boolean);
            s = s.substring(idx + 2);
        }
    }
    return { caso: s, categorias };
}

export function parsearCaso(caso) {
    const norm = normalizarCaso(caso);
    const registros = norm.caso.split(';');
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
