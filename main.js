
let observaciones = [];
let opcion = "";

while (opcion !== "4") {
  opcion = prompt(
    " Diario de Observación - Menú\n" +
    "1. Registrar una nueva observación\n" +
    "2. Ver todas las observaciones\n" +
    "3. Buscar observación por palabra clave\n" +
    "4. Salir\n\n" +
    "Escribe el número de la opción:"
  );

  if (opcion === "1") {
    let fecha = prompt(" Ingresa la fecha (ej: 2025-04-18):");
    let tipo = prompt(" Tipo de observación (Ej: Astronómica, Natural):");
    let descripcion = prompt(" Describe lo que observaste:");
    
    observaciones.push({ fecha, tipo, descripcion });
    alert(" Observación guardada.");

  } else if (opcion === "2") {
    if (observaciones.length === 0) {
      alert(" No hay observaciones registradas.");
    } else {
      let mensaje = " Observaciones registradas:\n\n";
      observaciones.forEach((obs, i) => {
        mensaje += `${i + 1}. [${obs.fecha}] (${obs.tipo}) - ${obs.descripcion}\n`;
      });
      alert(mensaje);
    }

  } else if (opcion === "3") {
    let palabraClave = prompt(" Escribe una palabra para buscar:");
    let resultados = observaciones.filter(obs =>
      obs.descripcion.toLowerCase().includes(palabraClave.toLowerCase())
    );

    if (resultados.length === 0) {
      alert(" No se encontraron coincidencias.");
    } else {
      let mensaje = "🔎 Resultados de búsqueda:\n\n";
      resultados.forEach((obs, i) => {
        mensaje += `${i + 1}. [${obs.fecha}] (${obs.tipo}) - ${obs.descripcion}\n`;
      });
      alert(mensaje);
    }

  } else if (opcion === "4") {
    alert(" ¡Hasta la próxima observación!");
  } else {
    alert(" Opción inválida. Intenta de nuevo.");
  }
}
