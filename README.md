# Generador de Contrato de Arriendo Chile

Aplicación web de una sola página, 100% client-side (sin backend, sin build step, sin frameworks), para generar y descargar en PDF un contrato de arriendo de predio urbano chileno, basado en la Ley N° 18.101, con vista previa en tiempo real.

## Cómo usarla

No requiere servidor ni instalación. Basta con abrir `index.html` directamente en el navegador (doble-click, o `file:///ruta/al/proyecto/contrato-arriendo-chile/index.html`), o servir la carpeta con cualquier servidor estático (GitHub Pages, Netlify, etc.).

## Estructura

```
index.html          Formulario, vista previa y contenido SEO
css/styles.css       Estilos y layout responsive
js/rut.js            Validación y formateo de RUT chileno (módulo 11)
js/formato.js        Formato de montos CLP, fechas y numeración ordinal de cláusulas
js/contrato.js       Redacción del contrato (fuente única usada por preview y PDF)
js/validacion.js     Validación de campos obligatorios
js/pdf.js            Generación del PDF con jsPDF (paginación automática)
js/main.js           Lectura del formulario, actualización de la vista previa, wiring de eventos
```

Los scripts se cargan como scripts clásicos (no ES Modules) para que la app funcione igual abierta con `file://` que hosteada. jsPDF se carga desde el CDN de cdnjs.cloudflare.com.

## Notas

- El texto legal es un modelo genérico basado en la Ley 18.101; no reemplaza asesoría legal profesional para casos complejos (ver aviso en el pie de la página).
- El PDF se genera en formato A4 con tipografía Helvetica, con salto de página automático cuando el contenido no cabe en la hoja actual.
