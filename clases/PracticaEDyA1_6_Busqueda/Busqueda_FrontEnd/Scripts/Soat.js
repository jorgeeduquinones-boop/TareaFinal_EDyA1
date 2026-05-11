/*
*  Clase Soat
*  Creado por: Orlando Arboleda Molina
*  Fecha: 26-Julio-2022
*
*  Descripci�n: 
*  Simulación de la clase Soat, para el ejercicio propuesto en el curso de EDyA1 en la 
*  Universidad Aut�noma de Occidente
*/

export class Soat {
    constructor(numero, aseguradora, valor) {
        this.numero = numero;
        this.aseguradora = aseguradora;
        this.valor = valor;
    }  

    toString() {
        return "Numero:" + this.numero +
            "  Aseguradora:" + this.aseguradora+
            "  Valor:" + this.valor;
    }    
}

