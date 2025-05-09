

const observaciones = [];


function registrar() {
    const hora = prompt("Hora:");
    const fecha = prompt("Fecha:");
    const clima = prompt("Clima:");
    const camara = prompt("Cámara usada:");
    const telescopio = prompt("Telescopio usado:");
    const ocular = prompt("Ocular usado:");
    const datosFoto = prompt("Datos fotográficos:");

    const nuevaObs = {
        hora,
        fecha,
        clima,
        camara,
        telescopio,
        ocular,
        datosFoto
    };

    observaciones.push(nuevaObs);
    console.log(" Observación registrada.");
}


function mostrar() {
    if (observaciones.length === 0) {
        console.log(" No hay observaciones.");
        return;
    }

    for (let i = 0; i < observaciones.length; i++) {
        console.log(` Observación ${i + 1}:`);
        console.log(observaciones[i]);
    }
}

function buscar() {
    const tipo = prompt("Buscar por telescopio:");
    let encontrado = false;

    for (let i = 0; i < observaciones.length; i++) {
        if (observaciones[i].telescopio.includes(tipo)) {
            console.log(` Coincidencia:`, observaciones[i]);
            encontrado = true;
        }
    }

    if (!encontrado) {
        console.log("No se encontraron coincidencias.");
    }
}


function menu() {
    let salir = false;

    while (!salir) {
        const opcion = prompt(
            "Menú de Observación:\n1. Registrar\n2. Ver\n3. Buscar\n4. Salir"
        );

        if (opcion === "1") {
            registrar();
        } else if (opcion === "2") {
            mostrar();
        } else if (opcion === "3") {
            buscar();
        } else if (opcion === "4") {
            salir = true;
            console.log(" BUENOS CIELOS HASTA LA PROXIMA OBSERVACION.");
        } else {
            console.log(" Opción no válida.");
        }
    }
}

menu();

        
      
      
      

      

      
  


