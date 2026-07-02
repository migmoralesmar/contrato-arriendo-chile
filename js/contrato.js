window.App = window.App || {};

window.App.Contrato = (function () {

  const TIPO_TEXTO = {
    casa: 'una casa',
    departamento: 'un departamento',
    pieza: 'una pieza',
    local_comercial: 'un local comercial'
  };

  const DESTINO_TEXTO = {
    casa: 'habitación del Arrendatario y su familia',
    departamento: 'habitación del Arrendatario y su familia',
    pieza: 'habitación del Arrendatario',
    local_comercial: 'el funcionamiento de actividades comerciales lícitas'
  };

  function v(valor, placeholder) {
    const texto = (valor || '').toString().trim();
    return texto ? texto : `[${placeholder}]`;
  }

  function rutTexto(rut, placeholder) {
    const limpio = (rut || '').trim();
    if (!limpio) return `[${placeholder}]`;
    return App.Rut.validarRut(limpio) ? App.Rut.formatearRut(limpio) : limpio;
  }

  function fechaHoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  function escaparHTML(texto) {
    return (texto || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function clausulaIndividualizacionPartes(datos) {
    const a = datos.arrendador || {};
    const b = datos.arrendatario || {};
    return {
      titulo: 'Individualización de las partes',
      texto: `Por una parte, ${v(a.nombre, 'NOMBRE ARRENDADOR')}, RUT N° ${rutTexto(a.rut, 'RUT ARRENDADOR')}, con domicilio en ${v(a.domicilio, 'DOMICILIO ARRENDADOR')}, en adelante "el Arrendador"; y por otra parte, ${v(b.nombre, 'NOMBRE ARRENDATARIO')}, RUT N° ${rutTexto(b.rut, 'RUT ARRENDATARIO')}, con domicilio en ${v(b.domicilio, 'DOMICILIO ARRENDATARIO')}, en adelante "el Arrendatario".`
    };
  }

  function clausulaInmueble(datos) {
    const p = datos.propiedad || {};
    const tipoTexto = TIPO_TEXTO[p.tipo] || 'un inmueble';
    const rol = (p.rol || '').trim();
    const rolTexto = rol ? `, con Rol de Avalúo N° ${rol}` : '';
    return {
      titulo: 'Individualización del inmueble',
      texto: `El Arrendador da en arriendo al Arrendatario ${tipoTexto} ubicado en ${v(p.direccion, 'DIRECCIÓN DEL INMUEBLE')}, comuna de ${v(p.comuna, 'COMUNA')}${rolTexto}, en adelante "el Inmueble".`
    };
  }

  function clausulaRenta(datos) {
    const c = datos.condiciones || {};
    const formaPagoTexto = c.formaPago === 'efectivo' ? 'en dinero efectivo' : 'mediante transferencia electrónica a la cuenta que indique el Arrendador';
    const diaPago = c.diaPago ? `el día ${c.diaPago} de cada mes` : '[DÍA DE PAGO] de cada mes';
    const reajuste = c.reajusteIPC
      ? ' La renta se reajustará anualmente de acuerdo con la variación del Índice de Precios al Consumidor (IPC) determinado por el Instituto Nacional de Estadísticas (INE).'
      : '';
    return {
      titulo: 'Renta de arrendamiento',
      texto: `El Arrendatario pagará al Arrendador, por concepto de renta de arrendamiento, la suma de ${App.Formato.formatCLP(c.rentaMensual)} mensuales, pagadera ${formaPagoTexto}, ${diaPago}.${reajuste}`
    };
  }

  function clausulaDuracion(datos) {
    const d = (datos.condiciones || {}).duracion || {};
    if (d.tipo === 'indefinido') {
      const inicioTexto = d.fechaInicio ? App.Formato.formatFecha(d.fechaInicio) : '[FECHA DE INICIO]';
      return {
        titulo: 'Duración del contrato',
        texto: `El presente contrato tendrá una duración indefinida, comenzando a regir el ${inicioTexto}. Cualquiera de las partes podrá poner término al contrato mediante desahucio dado a la otra con a lo menos dos (2) meses de anticipación, conforme a lo dispuesto en la Ley N° 18.101, pudiendo el Arrendatario permanecer en el Inmueble hasta el vencimiento de dicho plazo pagando la renta correspondiente.`
      };
    }
    const inicioTexto = d.fechaInicio ? App.Formato.formatFecha(d.fechaInicio) : '[FECHA DE INICIO]';
    const terminoTexto = d.fechaTermino ? App.Formato.formatFecha(d.fechaTermino) : '[FECHA DE TÉRMINO]';
    return {
      titulo: 'Duración del contrato',
      texto: `El presente contrato tendrá una duración de plazo fijo, comenzando a regir el ${inicioTexto} y terminando el ${terminoTexto}. Si ninguna de las partes manifestare su voluntad de no perseverar en el contrato mediante aviso escrito dado a la otra con a lo menos treinta (30) días de anticipación al vencimiento del plazo, este se entenderá renovado tácitamente por períodos iguales y sucesivos.`
    };
  }

  function clausulaGarantia(datos) {
    const c = datos.condiciones || {};
    return {
      titulo: 'Garantía',
      texto: `Para garantizar el fiel cumplimiento de las obligaciones que impone el presente contrato, el Arrendatario entrega en este acto al Arrendador la suma de ${App.Formato.formatCLP(c.garantia)} por concepto de garantía. Dicha suma será devuelta al Arrendatario dentro de los sesenta (60) días siguientes a la restitución del Inmueble, previa verificación de que este se encuentre en el mismo estado en que fue recibido, salvo el desgaste natural derivado del uso legítimo, y descontando los montos que correspondan a rentas insolutas, servicios impagos o daños no imputables al desgaste normal.`
    };
  }

  function clausulaDestino(datos) {
    const p = datos.propiedad || {};
    const destinoTexto = DESTINO_TEXTO[p.tipo] || 'el uso convenido por las partes';
    return {
      titulo: 'Destino del inmueble',
      texto: `El Inmueble se destinará exclusivamente a ${destinoTexto}, no pudiendo el Arrendatario darle un destino diverso sin autorización previa y escrita del Arrendador.`
    };
  }

  function clausulaMantencion() {
    return {
      titulo: 'Obligaciones de mantención y reparaciones',
      texto: `El Arrendatario se obliga a mantener el Inmueble en buen estado de conservación y limpieza, siendo de su exclusivo cargo las reparaciones locativas, entendiéndose por tales aquellas que provienen del uso ordinario del Inmueble. Las reparaciones o deterioros mayores, no imputables al Arrendatario, serán de cargo del Arrendador.`
    };
  }

  function clausulaSubarriendo(datos) {
    const prohibido = !!(datos.clausulasAdicionales || {}).prohibicionSubarriendo;
    const texto = prohibido
      ? 'Queda absolutamente prohibido al Arrendatario subarrendar, cesar o traspasar a cualquier título el uso del Inmueble a terceros, total o parcialmente.'
      : 'El Arrendatario no podrá subarrendar, ceder o traspasar el uso del Inmueble a terceros, total o parcialmente, sin contar previamente con la autorización expresa y por escrito del Arrendador.';
    return { titulo: 'Subarriendo', texto };
  }

  function clausulaMascotas(datos) {
    const permitidas = (datos.clausulasAdicionales || {}).mascotas !== 'no_permitidas';
    const texto = permitidas
      ? 'Se autoriza al Arrendatario la tenencia de mascotas domésticas al interior del Inmueble, debiendo este responder por cualquier daño que estas ocasionen al Inmueble o a terceros.'
      : 'No se autoriza al Arrendatario la tenencia de mascotas o animales de ningún tipo al interior del Inmueble.';
    return { titulo: 'Mascotas', texto };
  }

  function clausulaTerminoAnticipado() {
    return {
      titulo: 'Causales de término anticipado',
      texto: `Sin perjuicio de las causales establecidas en la ley, el presente contrato podrá terminarse anticipadamente por las siguientes causales: (a) no pago de dos o más rentas consecutivas; (b) incumplimiento grave de las obligaciones establecidas en este contrato; (c) destinar el Inmueble a un fin distinto del pactado; (d) subarrendar, ceder o traspasar el Inmueble sin la autorización correspondiente; y (e) causar daños graves al Inmueble no derivados del uso normal.`
    };
  }

  function clausulaAdicionalLibre(datos) {
    const extra = ((datos.clausulasAdicionales || {}).extra || '').trim();
    if (!extra) return null;
    return { titulo: 'Cláusulas adicionales', texto: extra };
  }

  function clausulaDomicilioCompetencia(datos) {
    const comuna = v((datos.propiedad || {}).comuna, 'COMUNA');
    return {
      titulo: 'Domicilio y competencia',
      texto: `Para todos los efectos legales derivados del presente contrato, las partes fijan su domicilio en la comuna de ${comuna} y se someten a la competencia de sus tribunales de justicia.`
    };
  }

  function generarTextoContrato(datos) {
    const comuna = v((datos.propiedad || {}).comuna, 'COMUNA');
    const fechaHoyTexto = App.Formato.formatFecha(fechaHoyISO());

    const encabezado = `En la comuna de ${comuna}, a ${fechaHoyTexto}, se celebra el presente contrato de arriendo entre las partes que se individualizan a continuación, el que se regirá por las cláusulas siguientes y, en lo no previsto en ellas, por las disposiciones de la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos y, en subsidio, por el Código Civil.`;

    const clausulasSinNumerar = [
      clausulaIndividualizacionPartes(datos),
      clausulaInmueble(datos),
      clausulaRenta(datos),
      clausulaDuracion(datos),
      clausulaGarantia(datos),
      clausulaDestino(datos),
      clausulaMantencion(),
      clausulaSubarriendo(datos),
      clausulaMascotas(datos),
      clausulaTerminoAnticipado(),
      clausulaAdicionalLibre(datos),
      clausulaDomicilioCompetencia(datos)
    ].filter(Boolean);

    const clausulas = clausulasSinNumerar.map((cl, i) => ({
      numero: App.Formato.numeroOrdinalLetras(i + 1),
      titulo: cl.titulo,
      texto: cl.texto
    }));

    return {
      encabezado,
      clausulas,
      firmas: {
        arrendadorNombre: v((datos.arrendador || {}).nombre, 'NOMBRE ARRENDADOR'),
        arrendadorRut: rutTexto((datos.arrendador || {}).rut, 'RUT ARRENDADOR'),
        arrendatarioNombre: v((datos.arrendatario || {}).nombre, 'NOMBRE ARRENDATARIO'),
        arrendatarioRut: rutTexto((datos.arrendatario || {}).rut, 'RUT ARRENDATARIO'),
        lugar: comuna,
        fecha: fechaHoyTexto
      }
    };
  }

  function renderPreviewHTML(contratoGenerado) {
    const { encabezado, clausulas, firmas } = contratoGenerado;

    const clausulasHTML = clausulas.map(cl => `
      <p class="clausula-titulo">${escaparHTML(cl.numero)}: ${escaparHTML(cl.titulo)}</p>
      <p>${escaparHTML(cl.texto)}</p>
    `).join('');

    return `
      <h3>CONTRATO DE ARRIENDO</h3>
      <p>${escaparHTML(encabezado)}</p>
      ${clausulasHTML}
      <div class="firmas">
        <div class="firma-linea">${escaparHTML(firmas.arrendadorNombre)}<br>RUT: ${escaparHTML(firmas.arrendadorRut)}<br>ARRENDADOR</div>
        <div class="firma-linea">${escaparHTML(firmas.arrendatarioNombre)}<br>RUT: ${escaparHTML(firmas.arrendatarioRut)}<br>ARRENDATARIO</div>
      </div>
      <p style="text-align:center; margin-top:1.5rem;">${escaparHTML(firmas.lugar)}, ${escaparHTML(firmas.fecha)}</p>
    `;
  }

  return { generarTextoContrato, renderPreviewHTML, escaparHTML };
})();
