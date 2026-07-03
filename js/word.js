window.App = window.App || {};

window.App.Word = (function () {

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

  function descargarBlob(blob, nombreArchivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function generarWord(datos) {
    if (!window.docx) {
      alert('No se pudo cargar la librería de generación de Word. Verifique su conexión a internet e intente nuevamente.');
      return;
    }

    const { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = window.docx;

    const SIN_BORDE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const BORDE_FIRMA = { style: BorderStyle.SINGLE, size: 4, color: '000000' };

    const { encabezado, clausulas, firmas } = App.Contrato.generarTextoContrato(datos);

    const hijos = [];

    hijos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: 'CONTRATO DE ARRIENDO', bold: true, size: 32 })]
    }));

    hijos.push(new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: encabezado, size: 22 })]
    }));

    clausulas.forEach(cl => {
      hijos.push(new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: `${cl.numero}: ${cl.titulo}`, bold: true, size: 22 })]
      }));
      hijos.push(new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: cl.texto, size: 21 })]
      }));
    });

    function celdaFirma(nombre, rut, rol) {
      return new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        margins: { top: 100 },
        borders: { top: BORDE_FIRMA, bottom: SIN_BORDE, left: SIN_BORDE, right: SIN_BORDE },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: nombre, size: 20 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `RUT: ${rut}`, size: 20 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: rol, size: 20 })] })
        ]
      });
    }

    hijos.push(new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '' })] }));

    hijos.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: SIN_BORDE, bottom: SIN_BORDE, left: SIN_BORDE, right: SIN_BORDE, insideHorizontal: SIN_BORDE, insideVertical: SIN_BORDE },
      rows: [
        new TableRow({
          children: [
            celdaFirma(firmas.arrendadorNombre, firmas.arrendadorRut, 'ARRENDADOR'),
            celdaFirma(firmas.arrendatarioNombre, firmas.arrendatarioRut, 'ARRENDATARIO')
          ]
        })
      ]
    }));

    hijos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: `${firmas.lugar}, ${firmas.fecha}`, size: 20 })]
    }));

    const doc = new Document({ sections: [{ children: hijos }] });

    Packer.toBlob(doc).then(blob => {
      const nombreArchivo = `Contrato_Arriendo_${slug((datos.propiedad || {}).comuna)}_${fechaHoyISO()}.docx`;
      descargarBlob(blob, nombreArchivo);
      if (window.va) window.va('event', { name: 'descarga_word' });
    }).catch(() => {
      alert('Ocurrió un error al generar el archivo Word. Intente nuevamente.');
    });
  }

  return { generarWord };
})();
