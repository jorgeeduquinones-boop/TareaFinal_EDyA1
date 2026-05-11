/*
*  Archivo ordenamientos.js
*  Creado por: Orlando Arboleda Molina
*  Fecha: 1-Agosto-2022
*
*  Descripción: 
*  Archivo con implementaciones de los algoritmos de ordenamiento, 
*  para el curso de EDyA1 en la Universidad Autónoma de Occidente
*/

// los parametros son A que es la secuencia; p y r que son las posiciones
function particion_por_Nombre(A, p, r){
    let x = A[r];
    let i = p-1;
    let aux;

    for (let j = p; j <= r-1; j++)
    {
        // Completar la lógica basada en el algoritmo visto.
        // las Strings se pueden comparar con localeCompare o el operdaor relacional
        if (A[j]<x){
            i = i+1;
            // incluir intercambio usando a aux

        }
    }
    // realizar intercambio usando a aux


    return i+1;
}

// los parametros son A que es la secuencia; p y r que son las posiciones
function quickSort_por_Nombre(A, p, r){
    if (p < r)
    {
        // actualizar la lógica usando a q
        // let q = 0
        
        
    }
} 

export {quickSort_por_Nombre};