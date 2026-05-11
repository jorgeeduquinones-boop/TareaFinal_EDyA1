/*
*  archivo main.js
*  Creado por: Orlando Arboleda Molina
*  Fecha: 1-Agosto-2022
*
*  Descripción: 
*  Aplicativo que permite la busqueda binaria de vehiculos, 
*  para el curso de EDyA1 en la Universidad Autónoma de Occidente
*/

import {Soat} from './Soat.js';
import {Vehiculo} from './Vehiculo.js';
import {buscarVehiculo} from "./busqueda.js";

// obtiene botones
const btnIngresar = document.getElementById("ingresar");
const btnBuscar = document.getElementById("buscar");
const btnListar = document.getElementById("listar");
let salida = document.getElementById("salida");

let bdVehiculos = [
    new Vehiculo('PQR 345', 2018, new Soat(345, 'MAFRE', 800000)),
    new Vehiculo('LMN 890', 2022, new Soat(890, 'SURA', 1200000)),
    new Vehiculo('BCD 567', 2015, new Soat(567, 'ALLIANZ', 1400000)),
    new Vehiculo('FGH 234', 2021, new Soat(345, 'SOLIDARIA', 900000)),
    new Vehiculo('STU 789', 2016, new Soat(789, 'SURA', 1500000)),
    new Vehiculo('PQR 901', 2018, new Soat(901, 'ALLIANZ', 950000))
];

let ordenado = false;

// se asignan eventos
btnIngresar.addEventListener('click',ingresarNvoVehiculo);
btnBuscar.addEventListener('click',buscarUnVehiculo);
btnListar.addEventListener('click',listarVehiculos);


function ingresarNvoVehiculo(){
    // capturar cada componente
    let placa = document.getElementById("laPlaca").value;
    let modelo = document.getElementById("elModelo").value;
    let numeroSoat = document.getElementById("elNumero").value;
    let aseguradoraSoat = document.getElementById("laAseguradora").value;
    let valorSoat = document.getElementById("elValor").value;
    let suSoat= new Soat(numeroSoat,aseguradoraSoat,valorSoat);

    let obj = new Vehiculo(placa,modelo,suSoat);

    bdVehiculos.push(obj);
	ordenado = false;
	
    salida.value = obj.toString();
    console.log(obj.toString());
}

function listarVehiculos(){   
	// invocar a filtrarVehiculos  
    let res = desplegarVehiculos(bdVehiculos);

    salida.value = res;
    console.log(res);
}

function desplegarVehiculos(bd){    
    let res = 'los vehiculos buscados son:\n';

	// recorrer el arreglo y obtener lo solicitado
    for (let i=0; i<bd.length; i++){
        res += bd[i].toString() + '  Estado:'+bd[i].obtenerEstadoEsperado()+'\n\n';
    }
    return res;
}

function buscarUnVehiculo(){
	if (!ordenado){
		bdVehiculos.sort((a,b)=>{return a.placa.localeCompare(b.placa);})		
        ordenado = true;
    }    

    // Actualizar para leer campo con id laPlacaBuscada y soliciar busqueda del vehiculo
    let placa;	
    let res = "";

    salida.value = res;
    console.log(res);
}
