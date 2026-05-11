/*
 *  Clase Pedido
 *  Tarea Final EDyA1 - Análisis de Pedidos en Comercio Electrónico
 *  Universidad Autónoma de Occidente - 2026-1
 *  Profesor: Orlando Arboleda Molina, Msc.
 *
 *  Modela un registro individual de compra. Sigue el mismo patrón de
 *  diseño que las clases Vehiculo y Soat de la Práctica 5: atributos
 *  inicializados en el constructor, método de cálculo (subtotal) y
 *  toString() para representación textual.
 *
 *  Atributos:
 *    customer   - identificador del cliente (string)
 *    product    - identificador del producto (string)
 *    category   - categoría del producto (string)
 *    price      - precio unitario (number)
 *    quantity   - cantidad comprada (integer)
 *    timestamp  - marca de tiempo (string)
 */
export class Pedido {
    constructor(customer, product, category, price, quantity, timestamp) {
        this.customer = customer;
        this.product = product;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.timestamp = timestamp;
    }

    // Subtotal de la transacción: precio * cantidad. O(1).
    subtotal() {
        return this.price * this.quantity;
    }

    toString() {
        return this.customer + ' ' + this.product + ' ' + this.category +
               ' ' + this.price + ' ' + this.quantity + ' ' + this.timestamp;
    }
}
