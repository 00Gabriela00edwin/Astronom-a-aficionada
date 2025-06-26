
function Observacion(hora, fecha, clima, camara, telescopio, ocular, datosFoto) {
  this.id = Date.now().toString();
  this.hora = hora;
  this.fecha = fecha;
  this.clima = clima;
  this.camara = camara;
  this.telescopio = telescopio;
  this.ocular = ocular;
  this.datosFoto = datosFoto;
}

let observaciones = [];

const formObservacion = document.getElementById("formObservacion");
const listaObservaciones = document.getElementById("listaObservaciones");
const formBusqueda = document.getElementById("formBusqueda");
const inputFechaBusqueda = document.getElementById("fechaBusqueda");
const resultadoBusqueda = document.getElementById("resultadoBusqueda");
const selectTelescopio = document.getElementById("telescopio");
const listaTelescopios = document.getElementById("listaTelescopios");
function guardarObservaciones() {
  localStorage.setItem("observaciones", JSON.stringify(observaciones));
}

function cargarObservaciones() {
  const datos = JSON.parse(localStorage.getItem("observaciones"));
  if (datos) {
    observaciones = datos.map(o => Object.assign(new Observacion(), o));
  }
}
function crearElementoObservacion(obs) {
  const div = document.createElement("div");
  div.className = "observacion";
  div.innerHTML = `
    <p><strong>Fecha:</strong> ${obs.fecha}</p>
    <p><strong>Hora:</strong> ${obs.hora}</p>
    <p><strong>Clima:</strong> ${obs.clima}</p>
    <p><strong>Cámara:</strong> ${obs.camara}</p>
    <p><strong>Telescopio:</strong> ${obs.telescopio}</p>
    <p><strong>Ocular:</strong> ${obs.ocular}</p>
    <p><strong>Datos Foto:</strong> ${obs.datosFoto}</p>
    <button type="button" onclick="eliminarObservacion('${obs.id}')">Eliminar</button>
  `;
  return div;
}

function mostrarObservaciones() {
  listaObservaciones.innerHTML = "";
  if (observaciones.length === 0) {
    listaObservaciones.innerHTML = "<p>No hay observaciones registradas.</p>";
    return;
  }
  observaciones.forEach(obs => listaObservaciones.appendChild(crearElementoObservacion(obs)));
}
function mostrarAlerta(icon, title, text, timer = 3000) {
  Swal.fire({
    icon,
    title,
    text,
    timer,
    showConfirmButton: false,
  });
}

function eliminarObservacion(id) {
  observaciones = observaciones.filter(obs => obs.id !== id);
  guardarObservaciones();
  mostrarObservaciones();
  mostrarAlerta("info", "Observación eliminada", "El registro fue eliminado correctamente.");
}

async function cargarTelescopios() {
  try {
    const response = await fetch("data/telescopios.json");
    if (!response.ok) throw new Error("Error al cargar telescopios");
    const telescopios = await response.json();

  
    listaTelescopios.innerHTML = "";
    telescopios.forEach(tel => {
      const div = document.createElement("div");
      div.className = "observacion";
      div.innerHTML = `<p><strong>${tel.nombre}</strong> (${tel.tipo})</p>`;
      listaTelescopios.appendChild(div);
    });

    selectTelescopio.innerHTML = '<option value="">Selecciona un telescopio</option>';
    telescopios.forEach(tel => {
      const option = document.createElement("option");
      option.value = tel.nombre;
      option.textContent = `${tel.nombre} (${tel.tipo})`;
      selectTelescopio.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los telescopios.");
  }
}

// Luxon
function iniciarReloj() {
  setInterval(() => {
    const now = luxon.DateTime.now().setLocale("es");
    document.getElementById("reloj").textContent = now.toFormat("HH:mm:ss - dd LLL yyyy");
  }, 1000);
}

formObservacion.addEventListener("submit", (e) => {
  e.preventDefault();

  const hora = formObservacion.hora.value;
  const fecha = formObservacion.fecha.value;
  if (observaciones.some(o => o.fecha === fecha && o.hora === hora)) {
    mostrarAlerta("error", "Duplicado", "Ya existe una observación para esa fecha y hora.");
    return;
  }

  const nuevaObs = new Observacion(
    hora,
    fecha,
    formObservacion.clima.value,
    formObservacion.camara.value,
    formObservacion.telescopio.value,
    formObservacion.ocular.value,
    formObservacion.datosFoto.value
  );

  observaciones.push(nuevaObs);
  guardarObservaciones();
  mostrarObservaciones();
  mostrarAlerta("success", "¡Observación guardada!", "Tu registro fue exitoso.");
  formObservacion.reset();
});

formBusqueda.addEventListener("submit", (e) => {
  e.preventDefault();

  const fechaBusqueda = inputFechaBusqueda.value.trim();
  if (!fechaBusqueda) {
    resultadoBusqueda.innerHTML = "<p>Por favor selecciona una fecha para buscar.</p>";
    return;
  }

  const resultados = observaciones.filter(o => o.fecha === fechaBusqueda);
  resultadoBusqueda.innerHTML = "";

  if (resultados.length === 0) {
    resultadoBusqueda.innerHTML = "<p>No se encontraron observaciones para esa fecha.</p>";
    return;
  }

  resultados.forEach(o => resultadoBusqueda.appendChild(crearElementoObservacion(o)));
});


window.addEventListener("DOMContentLoaded", () => {
  cargarObservaciones();
  mostrarObservaciones();
  cargarTelescopios();
  iniciarReloj();

  setTimeout(() => {
    Swal.fire({
      title: "¡Bienvenidos!",
      text: "Explorá el universo desde tu navegador",
      background: "#121212",
      color: "#e0e0e0",
      confirmButtonColor: "#f7c948",
      confirmButtonText: "¡Vamos!",
      customClass: { popup: "mi-alerta" }
    });
  }, 3000);
});

window.eliminarObservacion = eliminarObservacion;

async function obtenerClima(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=cloudcover`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener el clima");
  const data = await res.json();
  return data.current_weather; 
}

async function mostrarClima(lat, lon) {
  const contenedor = document.getElementById("datosClima");
  try {
    const clima = await obtenerClima(lat, lon);
    contenedor.innerHTML = `
      <p><strong>Temperatura:</strong> ${clima.temperature} °C</p>
      <p><strong>Velocidad del viento:</strong> ${clima.windspeed} km/h</p>
      <p><strong>Dirección del viento:</strong> ${clima.winddirection}°</p>
      <p><strong>Hora de la medición:</strong> ${clima.time}</p>
    `;
  } catch (error) {
    contenedor.textContent = "Error al obtener datos del clima.";
    console.error(error);
  }
}

window.addEventListener("DOMContentLoaded", () => {

  mostrarClima(-34.6, -58.4);
});


