
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


const form = document.getElementById("formObservacion");
const lista = document.getElementById("listaObservaciones");
const formBusqueda = document.getElementById("formBusqueda");
const inputFecha = document.getElementById("fechaBusqueda");
const resultadoBusqueda = document.getElementById("resultadoBusqueda");


const guardarObservaciones = () => {
  localStorage.setItem("observaciones", JSON.stringify(observaciones));
};


const cargarObservaciones = () => {
  const datos = JSON.parse(localStorage.getItem("observaciones"));
  if (datos) {
    observaciones = datos.map(
      obs => new Observacion(
        obs.hora, obs.fecha, obs.clima,
        obs.camara, obs.telescopio, obs.ocular, obs.datosFoto
      )
    );
  }
};


const crearElementoObservacion = (obs) => {
  const div = document.createElement("div");
  div.classList.add("observacion");
  div.innerHTML = `
    <p><strong>Fecha:</strong> ${obs.fecha}</p>
    <p><strong>Hora:</strong> ${obs.hora}</p>
    <p><strong>Clima:</strong> ${obs.clima}</p>
    <p><strong>Cámara:</strong> ${obs.camara}</p>
    <p><strong>Telescopio:</strong> ${obs.telescopio}</p>
    <p><strong>Ocular:</strong> ${obs.ocular}</p>
    <p><strong>Datos Foto:</strong> ${obs.datosFoto}</p>
  `;
  return div;
};


const mostrarObservaciones = () => {
  lista.innerHTML = "";

  if (observaciones.length === 0) {
    lista.innerHTML = "<p>No hay observaciones registradas.</p>";
    return;
  }

  observaciones.forEach(obs => {
    const elemento = crearElementoObservacion(obs);
    lista.insertAdjacentElement("beforeend", elemento);
  });
};


form.addEventListener("submit", e => {
  e.preventDefault();

  const nuevaObs = new Observacion(
    form.hora.value,
    form.fecha.value,
    form.clima.value,
    form.camara.value,
    form.telescopio.value,
    form.ocular.value,
    form.datosFoto.value
  );

  observaciones.push(nuevaObs);
  guardarObservaciones();
  mostrarObservaciones();
  form.reset();
});


formBusqueda.addEventListener("submit", e => {
  e.preventDefault();
  const fecha = inputFecha.value;
  const encontrados = observaciones.filter(obs => obs.fecha === fecha);

  resultadoBusqueda.innerHTML = "";

  if (encontrados.length === 0) {
    resultadoBusqueda.innerHTML = "<p>No se encontraron observaciones para esa fecha.</p>";
    return;
  }

  encontrados.forEach(obs => {
    const elemento = crearElementoObservacion(obs);
    resultadoBusqueda.insertAdjacentElement("beforeend", elemento);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  cargarObservaciones();
  mostrarObservaciones();
});
