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

setInterval(() => {
  const now = luxon.DateTime.now().setLocale('es');
  document.getElementById("reloj").textContent = now.toFormat("HH:mm:ss - dd LLL yyyy");
}, 1000);

const guardar = () => localStorage.setItem("observaciones", JSON.stringify(observaciones));

const cargar = () => {
  const datos = JSON.parse(localStorage.getItem("observaciones"));
  if (datos) {
    observaciones = datos.map(o => new Observacion(...Object.values(o)));
  }
};

const crearObservacionHTML = (o) => {
  const div = document.createElement("div");
  div.className = "observacion";
  div.innerHTML = `
    <p><strong>Fecha:</strong> ${o.fecha}</p>
    <p><strong>Hora:</strong> ${o.hora}</p>
    <p><strong>Clima:</strong> ${o.clima}</p>
    <p><strong>Cámara:</strong> ${o.camara}</p>
    <p><strong>Telescopio:</strong> ${o.telescopio}</p>
    <p><strong>Ocular:</strong> ${o.ocular}</p>
    <p><strong>Datos Foto:</strong> ${o.datosFoto}</p>
    <button onclick="eliminarObservacion('${o.fecha}', '${o.hora}')">Eliminar</button>
  `;
  return div;
};

const mostrarTodas = () => {
  lista.innerHTML = "";
  if (observaciones.length === 0) {
    lista.innerHTML = "<p>No hay observaciones registradas.</p>";
    return;
  }
  observaciones.forEach(o => lista.appendChild(crearObservacionHTML(o)));
};

const mostrarAlerta = () => {
  setTimeout(() => {
    Swal.fire({
      icon: 'success',
      title: '¡Observación guardada!',
      text: 'Tu registro fue exitoso.',
      timer: 3000,
      showConfirmButton: false
    });
  }, 1000);
};

form.addEventListener("submit", e => {
  e.preventDefault();

  const o = new Observacion(
    form.hora.value, form.fecha.value, form.clima.value,
    form.camara.value, form.telescopio.value, form.ocular.value, form.datosFoto.value
  );

  observaciones.push(o);
  guardar();
  mostrarTodas();
  mostrarAlerta();
  form.reset();
});

formBusqueda.addEventListener("submit", e => {
  e.preventDefault();
  const fecha = inputFecha.value;
  const encontrados = observaciones.filter(o => o.fecha === fecha);

  resultadoBusqueda.innerHTML = "";

  if (encontrados.length === 0) {
    resultadoBusqueda.innerHTML = "<p>No se encontraron observaciones para esa fecha.</p>";
    return;
  }

  encontrados.forEach(o => resultadoBusqueda.appendChild(crearObservacionHTML(o)));
});

function eliminarObservacion(fecha, hora) {
  observaciones = observaciones.filter(o => !(o.fecha === fecha && o.hora === hora));
  guardar();
  mostrarTodas();
  Swal.fire("Observación eliminada", "", "info");
}


async function cargarTelescopios() {
  try {
    let res = await fetch("data/telescopios.json");
    if (!res.ok) throw new Error("Error al cargar telescopios");
    let data = await res.json();

    const contenedor = document.getElementById("listaTelescopios");
    contenedor.innerHTML = "";
    data.forEach(t => {
      const item = document.createElement("div");
      item.className = "telescopio";
      item.innerHTML = `<p><strong>${t.nombre}</strong> (${t.tipo})</p>`;
      contenedor.appendChild(item);
    });

    const selectTelescopio = document.getElementById("telescopio");
    data.forEach(t => {
      const option = document.createElement("option");
      option.value = t.nombre;
      option.textContent = `${t.nombre} (${t.tipo})`;
      selectTelescopio.appendChild(option);
    });

  } catch (error) {
    console.error("Error en fetch:", error);
    alert("No se pudieron cargar los telescopios");
  } finally {
    console.log("Finalizó la carga de telescopios");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  cargar();
  mostrarTodas();
  cargarTelescopios();
 


  setTimeout(() => {
    Swal.fire({
      title: 'BIENVENIDOS',
      text: 'Explorá el universo desde tu navegador ',
      icon: 'info',
      confirmButtonText: '¡Vamos!'
    });
  }, 3000);
});

