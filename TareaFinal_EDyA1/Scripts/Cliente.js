/*
 *  Clase Cliente
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Agrega información de pedidos por cliente:
 *    - totalSpent       suma acumulada de subtotales (price * quantity)
 *    - categorias       conteo de transacciones por categoría
 *    - favoriteCategory categoría con mayor frecuencia (calculada al cierre)
 *
 *  Patrón de diseño: clase con estado interno + métodos de actualización
 *  + toString(), análogo a la clase Vehiculo de la Práctica 5.
 *
 *  Se usa Object.create(null) para el diccionario de categorías:
 *    - sin prototipo heredado → no hay colisiones con keys reservadas
 *      como 'constructor' o 'toString'.
 *    - acceso O(1) amortizado, igual que un Map pero con menor overhead.
 */
import { compararStrings } from './comparadores.js';

export class Cliente {
    constructor(name) {
        this.name = name;
        this.totalSpent = 0;
        this.categorias = Object.create(null);
        this.favoriteCategory = '';
    }

    // Registra un pedido: actualiza gasto total y conteo por categoría.
    // Complejidad: O(1) amortizado.
    registrarPedido(pedido) {
        this.totalSpent += pedido.subtotal();
        this.categorias[pedido.category] = (this.categorias[pedido.category] || 0) + 1;
    }

    // Recorre las categorias del cliente y elige la de MAYOR frecuencia.
    // En caso de empate gana la lexicográficamente MAYOR (consistente
    // con el criterio 2 del ranking: favoriteCategory descendente).
    // Complejidad: O(p) donde p = número de categorías distintas del cliente.
    calcularCategoriaFavorita() {
        let mejor = '';
        let max = -1;
        for (const cat in this.categorias) {
            const f = this.categorias[cat];
            if (f > max || (f === max && compararStrings(cat, mejor) > 0)) {
                mejor = cat;
                max = f;
            }
        }
        this.favoriteCategory = mejor;
    }

    // Formato de salida exigido por el enunciado:
    //   "customer totalSpent favoriteCategory"
    toString() {
        return this.name + ' ' + this.totalSpent + ' ' + this.favoriteCategory;
    }
}
