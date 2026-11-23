# 🌌 Proyecto: Astronomía Aficionada

Aplicación web para registrar observaciones astronómicas, consultar el clima y explorar telescopios.

## Instalación y ejecución

Se necesita Node.js 20.19+ (rama 20) o 22.12+ y npm. Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite en el navegador. Para generar la versión de producción, ejecuta `npm run build`; puedes probarla con `npm run preview`.
Para ejecutar las pruebas de los cálculos astronómicos y del viento, usa `npm test`.

Las observaciones siguen guardándose en `localStorage` con el mismo formato anterior. El navegador solo comparte esos datos si la página se sirve desde el mismo origen (protocolo, dominio y puerto); cambiarlo no traslada los registros automáticamente.

En **Observaciones Registradas**, usa **Exportar respaldo** para descargar todas las observaciones en JSON, incluso si hay un filtro activo. **Importar respaldo** combina los registros sin reemplazar los existentes: omite duplicados y rechaza el archivo completo si encuentra un conflicto de identificador o de fecha y hora. Guarda el archivo en un lugar seguro: contiene tus registros personales.

La ubicación inicial es Buenos Aires. Puedes buscar una ciudad o solicitar la ubicación al navegador; la selección dura hasta recargar. Buscar una ciudad envía el texto a Open-Meteo. Usar la ubicación requiere permiso y envía las coordenadas a Open-Meteo para consultar el clima; normalmente requiere HTTPS o localhost.

## 🚀 Características

- Registro de observaciones con cámara, telescopio, clima, etc.
- Visualización en tiempo real del reloj astronómico (usando Luxon).
- Catálogo de telescopios cargado dinámicamente desde JSON.
- Calculadora de aumentos, límite útil y pupila de salida con vista ilustrativa de Luna, Saturno y Júpiter. La vista escala con los aumentos, pero no representa el campo real ni las condiciones de observación.
- Clima actual y pronóstico para las próximas seis horas vía Open-Meteo, con viento, nubosidad y precipitación.
- Autocompletado con hora local del dispositivo y una nueva consulta del clima de la ubicación seleccionada; la fecha y los demás campos no se modifican.
- Indicador orientativo: óptimo con viento de hasta 15 km/h, nubosidad de hasta 25 % y sin precipitación; moderado hasta 30 km/h y 60 % de nubosidad; poco favorable por encima de esos límites o si hay precipitación. No evalúa turbulencia atmosférica ni garantiza visibilidad.
- Planificador bajo demanda con salidas y puestas del Sol, la Luna y los planetas en la fecha y zona horaria seleccionadas. Usa Astronomy Engine, supone horizonte despejado y observador al nivel del mar; un astro puede no salir o ponerse durante una fecha determinada.
- Fase e iluminación lunar aproximadas a partir de un ciclo sinódico medio, no de efemérides de precisión.
- Bienvenida con campo de estrellas en Canvas, paralaje y animaciones que respetan la preferencia de movimiento reducido.
- Modo visión nocturna que atenúa las imágenes y cambia la interfaz a rojo y negro. Se activa desde la navegación y su preferencia se guarda en `localStorage`.
- Campo de estrellas con menos partículas y resolución en pantallas pequeñas, animación limitada a 30 fps y pausa al salir de la vista. Las efemérides y alertas se cargan bajo demanda.
- Estilo oscuro inspirado en el espacio + alertas personalizadas con SweetAlert.

El modo nocturno no modifica el brillo del dispositivo ni las ventanas nativas del navegador o del sistema; ajusta también el brillo de la pantalla para observar.

## 📦 Tecnologías utilizadas

- React y React DOM con componentes funcionales y hooks
- Vite para desarrollo y compilación
- Tailwind CSS y CSS con diseño responsive y efectos
- Framer Motion para animaciones y Lucide React para iconos
- [Luxon](https://moment.github.io/luxon/)
- [SweetAlert2](https://sweetalert2.github.io/)
- [Open-Meteo API](https://open-meteo.com/)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy)
- JSON estático para catálogo de telescopios


