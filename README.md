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

## 🚀 Características

- Registro de observaciones con cámara, telescopio, clima, etc.
- Visualización en tiempo real del reloj astronómico (usando Luxon).
- Catálogo de telescopios cargado dinámicamente desde JSON.
- Calculadora de aumentos, límite útil y pupila de salida con vista ilustrativa de Luna, Saturno y Júpiter. La vista escala con los aumentos, pero no representa el campo real ni las condiciones de observación.
- Clima astronómico actual vía API Open-Meteo.
- Autocompletado con hora local y una nueva consulta del clima de Buenos Aires; la fecha y los demás campos no se modifican.
- Indicador orientativo basado solo en el viento: óptimo hasta 15 km/h, moderado hasta 30 km/h y poco favorable por encima. No evalúa nubosidad ni otras condiciones.
- Fase e iluminación lunar aproximadas a partir de un ciclo sinódico medio, no de efemérides de precisión.
- Bienvenida con campo de estrellas en Canvas, paralaje y animaciones que respetan la preferencia de movimiento reducido.
- Modo visión nocturna que atenúa las imágenes y cambia la interfaz a rojo y negro. Se activa desde la navegación y dura hasta recargar la página.
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
- JSON estático para catálogo de telescopios


