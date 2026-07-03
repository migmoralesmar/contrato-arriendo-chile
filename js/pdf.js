window.App = window.App || {};

window.App.Pdf = (function () {

  const MARGEN = 20;
  const LINE_HEIGHT = 5.2;

  const MAPA_ACENTOS = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N' };

  function slug(texto) {
    const sinAcentos = (texto || 'contrato').toString()
      .split('').map(c => MAPA_ACENTOS[c] || c).join('');
    return sinAcentos
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'contrato';
  }

  function fechaHoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  function generarPDF(datos) {
    if (!window.jspdf) {
      alert('No se pudo cargar la librería de generación de PDF. Verifique su conexión a internet e intente nuevamente.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const anchoUtil = anchoPagina - MARGEN * 2;

    let y = MARGEN;

    function salto(alturaNecesaria) {
      if (y + alturaNecesaria > altoPagina - MARGEN) {
        doc.addPage();
        y = MARGEN;
      }
    }

    function escribirParrafo(texto, opciones) {
      const tamano = (opciones && opciones.tamano) || 10.5;
      const estilo = (opciones && opciones.estilo) || 'normal';
      doc.setFont('helvetica', estilo);
      doc.setFontSize(tamano);
      const lineas = doc.splitTextToSize(texto, anchoUtil);
      lineas.forEach(linea => {
        salto(LINE_HEIGHT);
        doc.text(linea, MARGEN, y);
        y += LINE_HEIGHT;
      });
    }

    const contratoGenerado = App.Contrato.generarTextoContrato(datos);
    const { encabezado, clausulas, firmas } = contratoGenerado;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CONTRATO DE ARRIENDO', anchoPagina / 2, y, { align: 'center' });
    y += 10;

    escribirParrafo(encabezado, { tamano: 11, estilo: 'normal' });
    y += 4;

    clausulas.forEach(cl => {
      salto(LINE_HEIGHT + 2);
      escribirParrafo(`${cl.numero}: ${cl.titulo}`, { tamano: 11, estilo: 'bold' });
      y += 1;
      escribirParrafo(cl.texto, { tamano: 10.5, estilo: 'normal' });
      y += 4;
    });

    salto(40);
    y += 15;
    doc.setLineWidth(0.2);
    doc.line(MARGEN, y, MARGEN + 70, y);
    doc.line(anchoUtil + MARGEN - 70, y, anchoUtil + MARGEN, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${firmas.arrendadorNombre}`, MARGEN, y);
    doc.text(`${firmas.arrendatarioNombre}`, anchoUtil + MARGEN - 70, y);
    y += 4.5;
    doc.text(`RUT: ${firmas.arrendadorRut}`, MARGEN, y);
    doc.text(`RUT: ${firmas.arrendatarioRut}`, anchoUtil + MARGEN - 70, y);
    y += 4.5;
    doc.text('ARRENDADOR', MARGEN, y);
    doc.text('ARRENDATARIO', anchoUtil + MARGEN - 70, y);

    y += 12;
    salto(LINE_HEIGHT);
    doc.setFontSize(10);
    doc.text(`${firmas.lugar}, ${firmas.fecha}`, anchoPagina / 2, y, { align: 'center' });

    const nombreArchivo = `Contrato_Arriendo_${slug((datos.propiedad || {}).comuna)}_${fechaHoyISO()}.pdf`;
    doc.save(nombreArchivo);

    if (window.va) window.va('event', { name: 'descarga_pdf' });
  }

  return { generarPDF };
})();
