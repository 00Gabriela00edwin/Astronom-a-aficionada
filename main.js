

function Observacion(hora, fecha, clima, camara, telescopio, ocular, datosFoto) {
  this.hora = hora;
  this.fecha = fecha;
  this.clima = clima;
  this.camara = camara;
  this.telescopio = telescopio;
  this.ocular = ocular;
  this.datosFoto = datosFoto;
}




let observaciones = [];


                       function guardarObservaciones() {
  localStorage.setItem("observaciones", JSON.stringify(observaciones));
}
function cargarObservaciones() {
  const datos = localStorage.getItem("observaciones");
  if (datos) {
    const datosParseados = JSON.parse(datos);
    observaciones = datosParseados.map(
      obs => new Observacion(
        obs.hora,
        obs.fecha,
        obs.clima,
        obs.camara,
        obs.telescopio,
        obs.ocular,
        obs.datosFoto
      )
    );
  }
}

function registrar() {
  const hora = prompt("Hora:");
  const fecha = prompt("Fecha:");
  const clima = prompt("Clima:");
  const camara = prompt("Cámara usada:");
  const telescopio = prompt("Telescopio usado:");
  const ocular = prompt("Ocular usado:");
  const datosFoto = prompt("Datos fotográficos:");

  const nuevaObs = new Observacion(hora, fecha, clima, camara, telescopio, ocular, datosFoto);
  observaciones.push(nuevaObs);
  guardarObservaciones();
  console.log("Observación registrada.");
}


function mostrar() {
  if (observaciones.length === 0) {
    console.log("No hay observaciones registradas.");
    return;
  }

  observaciones.forEach((obs, index) => {
    console.log(`Observación ${index + 1}:`);
    console.log(obs);
  });
}


function buscar() {
  const termino = prompt("Ingrese término de búsqueda para el telescopio:");
  const resultados = observaciones.filter(obs => obs.telescopio.includes(termino));

  if (resultados.length === 0) {
    console.log("No se encontraron coincidencias.");
  } else {
    resultados.forEach((obs, index) => {
      console.log(`Coincidencia ${index + 1}:`);
      console.log(obs);
    });
  }
}


function menu() {
  cargarObservaciones();
  let salir = false;

  while (!salir) {
    const opcion = prompt(
      "Menú de Observación:\n1. Registrar\n2. Ver\n3. Buscar\n4. Salir"
    );

    switch (opcion) {
      case "1":
        registrar();
        break;
      case "2":
        mostrar();
        break;
      case "3":
        buscar();
        break;
      case "4":
        salir = true;
        console.log("BUENOS CIELOS HASTA LA PRÓXIMA OBSERVACIÓN.");
        break;
      default:
        console.log("Opción no válida.");
    }
  }
}


menu();
