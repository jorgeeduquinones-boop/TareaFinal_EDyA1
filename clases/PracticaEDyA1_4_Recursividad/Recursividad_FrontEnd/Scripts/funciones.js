/*
*  Archivo funciones.js
*  Creado por: Orlando Arboleda Molina
*  Fecha: 29-Julio-2022
*
*  Descripción: 
*  Archivo con funciones recursivas/iterativas, para el ejercicio propuesto en el curso de EDyA1 en la 
*  Universidad Autónoma de Occidente
*/

function factorialRecursivo(n){
    if (n<=1) {
        return 1;
    }else{
        // si no estuviera dentro de una clase,no requiere this
        return n*factorialRecursivo(n-1);
    }
}

function factorialIterativo(n)
{
    let res = 1;
    for (let i = n; i >=1 ; i--) {
        res *= i;
    }
    return res;
} 

// funcion de fibonacci, porque la recursiva es costosa
function fiboIterativo(n){
    if (n<=1) {
        return 1;
    }else{
        let atras = 1;
        let adelante = 1;
        let res = 0;
        for (let i=2; i<=n; i++){
            res = atras + adelante;
            atras = adelante;
            adelante = res;
        }
        return res;
    }
}

// recurrencias operando con arreglos
function calculaSuma(A, i){
    // por fuera del arreglo
    if (i > A.length-1){
        return 0;
    }else{
        // si no estuviera dentro de una clase,no requiere this
        return A[i]+calculaSuma(A,i+1);
    }        
}  

export {factorialRecursivo, factorialIterativo, fiboIterativo, calculaSuma};



