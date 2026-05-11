/*
*  archivo main.js
*  Creado por: Orlando Arboleda Molina
*  Fecha: 29-Julio-2022
*
*  Descripción: 
*  Aplicativo que permite la manipulación de funciones recursivas, 
*  para el curso de EDyA1 en la Universidad Autónoma de Occidente
*/

import {factorialRecursivo, factorialIterativo, fiboIterativo, calculaSuma} from './funciones.js';

// obtiene botones y combos
const btnComputar = document.getElementById("computar");
let salida = document.getElementById("salida");

// se asignan eventos
btnComputar.addEventListener('click',atenderSolicitud);

// actualizar para nuevos casos
function atenderSolicitud(){
    const calculo = document.getElementById("laFuncion").value;
    let limite1 = document.getElementById("elParam1").value;
    let limite2 = document.getElementById("elParam2").value;

    //console.log(calculo+'  '+limite1+'  '+limite2);
    let res='';
    switch(calculo){
        case 'FactR':           	
            for (let i = limite1; i <= limite2; i++) {
                res +='fact('+i+')= '+factorialRecursivo(i)+'\n';            
            } 
            break;
        case 'FactR_I':   
            // completar logica para que despliegue tambien factorial iterativo        	
            for (let i = limite1; i <= limite2; i++) {
                res +='fact('+i+')= '+factorialRecursivo(i)+'\n';            
            } 
            break;  
        case 'SumaA': 
            let aux = limite1.trim();
            let data = aux.split(',');  
            console.log(aux+'\n'+data);
            // completar logica para que despliegue tambien factorial iterativo        	
            for (let i = 0; i < data.length; i++) {
                res += data[i]+'\n';            
            } 
            break;    
        
        // completar lógica restante          
        default:
            res +='Sin implementar aún';
    }

    salida.value = res;
}
