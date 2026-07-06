window.App = window.App || {};

(function () {

  const form = document.getElementById('form-contrato');
  const preview = document.getElementById('preview');
  const grupoFechas = document.getElementById('grupo-fechas');
  const resumenErrores = document.getElementById('resumen-errores');
  const btnDescargarPdf = document.getElementById('btn-descargar-pdf');
  const btnDescargarWord = document.getElementById('btn-descargar-word');

  function leerMontoSegunMoneda(inputId, radioName) {
    const input = document.getElementById(inputId);
    const moneda = form.querySelector(`input[name="${radioName}"]:checked`).value;
    return moneda === 'uf' ? input.value : (Number(input.value) || 0);
  }

  function leerFormulario() {
    const duracionTipo = form.querySelector('input[name="condiciones-duracion-tipo"]:checked').value;
    const mascotas = form.querySelector('input[name="clausulas-mascotas"]:checked').value;

    return {
      arrendador: {
        nombre: document.getElementById('arrendador-nombre').value,
        rut: document.getElementById('arrendador-rut').value,
        domicilio: document.getElementById('arrendador-domicilio').value
      },
      arrendatario: {
        nombre: document.getElementById('arrendatario-nombre').value,
        rut: document.getElementById('arrendatario-rut').value,
        domicilio: document.getElementById('arrendatario-domicilio').value
      },
      propiedad: {
        direccion: document.getElementById('propiedad-direccion').value,
        comuna: document.getElementById('propiedad-comuna').value,
        tipo: document.getElementById('propiedad-tipo').value,
        rol: document.getElementById('propiedad-rol').value
      },
      condiciones: {
        rentaMensual: leerMontoSegunMoneda('condiciones-renta', 'condiciones-renta-moneda'),
        rentaMoneda: form.querySelector('input[name="condiciones-renta-moneda"]:checked').value,
        diaPago: Number(document.getElementById('condiciones-dia-pago').value) || 0,
        duracion: {
          tipo: duracionTipo,
          fechaInicio: document.getElementById('condiciones-fecha-inicio').value,
          fechaTermino: document.getElementById('condiciones-fecha-termino').value
        },
        garantia: leerMontoSegunMoneda('condiciones-garantia', 'condiciones-garantia-moneda'),
        garantiaMoneda: form.querySelector('input[name="condiciones-garantia-moneda"]:checked').value,
        formaPago: document.getElementById('condiciones-forma-pago').value,
        reajusteIPC: document.getElementById('condiciones-reajuste-ipc').checked
      },
      clausulasAdicionales: {
        prohibicionSubarriendo: document.getElementById('clausulas-prohibicion-subarriendo').checked,
        mascotas: mascotas,
        extra: document.getElementById('clausulas-extra').value
      }
    };
  }

  function actualizarVistaPrevia() {
    const datos = leerFormulario();
    const contratoGenerado = App.Contrato.generarTextoContrato(datos);
    preview.innerHTML = App.Contrato.renderPreviewHTML(contratoGenerado);
  }

  function actualizarVisibilidadFechas() {
    const tipo = form.querySelector('input[name="condiciones-duracion-tipo"]:checked').value;
    grupoFechas.style.display = tipo === 'indefinido' ? 'none' : '';
  }

  function actualizarInputSegunMoneda(inputId, radioName, placeholderClp) {
    const input = document.getElementById(inputId);
    const moneda = form.querySelector(`input[name="${radioName}"]:checked`).value;
    if (moneda === 'uf') {
      input.step = '0.01';
      input.placeholder = 'Ej: 15.5';
    } else {
      input.step = '1000';
      input.placeholder = placeholderClp;
    }
  }

  function actualizarInputsMoneda() {
    actualizarInputSegunMoneda('condiciones-renta', 'condiciones-renta-moneda', 'Ej: 350000');
    actualizarInputSegunMoneda('condiciones-garantia', 'condiciones-garantia-moneda', 'Normalmente 1 mes de renta');
  }

  function actualizarAdvertenciaIpcUf() {
    const rentaMoneda = form.querySelector('input[name="condiciones-renta-moneda"]:checked').value;
    const ipcMarcado = document.getElementById('condiciones-reajuste-ipc').checked;
    document.getElementById('aviso-ipc-uf').hidden = !(rentaMoneda === 'uf' && ipcMarcado);
  }

  function formatearYValidarRutCampo(input) {
    const valor = input.value.trim();
    if (!valor) {
      input.classList.remove('campo-invalido');
      return;
    }
    if (App.Rut.validarRut(valor)) {
      input.value = App.Rut.formatearRut(valor);
      input.classList.remove('campo-invalido');
    } else {
      input.classList.add('campo-invalido');
    }
  }

  function limpiarErrores() {
    document.querySelectorAll('.error-mensaje').forEach(el => { el.textContent = ''; });
    document.querySelectorAll('.campo-invalido').forEach(el => el.classList.remove('campo-invalido'));
    resumenErrores.hidden = true;
    resumenErrores.innerHTML = '';
  }

  function mostrarErrores(errores) {
    limpiarErrores();
    const ids = Object.keys(errores);

    ids.forEach(id => {
      const span = document.getElementById(`err-${id}`);
      if (span) span.textContent = errores[id];
      const input = document.getElementById(id);
      if (input) input.classList.add('campo-invalido');
    });

    const lista = ids.map(id =>
      `<li><a href="#${id}" data-campo="${id}">${App.Contrato.escaparHTML(App.Validacion.etiquetaCampo(id))}</a></li>`
    ).join('');
    resumenErrores.innerHTML = `<strong>Faltan ${ids.length} campo${ids.length === 1 ? '' : 's'} obligatorio${ids.length === 1 ? '' : 's'}:</strong><ul>${lista}</ul>`;
    resumenErrores.hidden = false;

    resumenErrores.querySelectorAll('a').forEach(enlace => {
      enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
        irACampo(enlace.dataset.campo);
      });
    });

    irACampo(ids[0]);
  }

  function irACampo(id) {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campo.focus();
  }

  btnDescargarPdf.addEventListener('click', () => {
    const datos = leerFormulario();
    const resultado = App.Validacion.validarFormulario(datos);
    if (!resultado.valido) {
      mostrarErrores(resultado.errores);
      return;
    }
    limpiarErrores();
    App.Pdf.generarPDF(datos);
  });

  btnDescargarWord.addEventListener('click', () => {
    const datos = leerFormulario();
    const resultado = App.Validacion.validarFormulario(datos);
    if (!resultado.valido) {
      mostrarErrores(resultado.errores);
      return;
    }
    limpiarErrores();
    App.Word.generarWord(datos);
  });

  form.addEventListener('input', actualizarVistaPrevia);
  form.addEventListener('change', () => {
    actualizarVisibilidadFechas();
    actualizarInputsMoneda();
    actualizarAdvertenciaIpcUf();
    actualizarVistaPrevia();
  });

  document.getElementById('arrendador-rut').addEventListener('blur', function () {
    formatearYValidarRutCampo(this);
    actualizarVistaPrevia();
  });
  document.getElementById('arrendatario-rut').addEventListener('blur', function () {
    formatearYValidarRutCampo(this);
    actualizarVistaPrevia();
  });

  actualizarVisibilidadFechas();
  actualizarInputsMoneda();
  actualizarAdvertenciaIpcUf();
  actualizarVistaPrevia();

  (async function inicializarValorUF() {
    const contenedor = document.getElementById('info-valor-uf');
    const spanMonto = document.getElementById('info-valor-uf-monto');
    const valor = await App.Uf.obtenerValorUF();
    if (valor === null) {
      contenedor.hidden = true;
      return;
    }
    spanMonto.textContent = App.Formato.formatCLP(valor);
    contenedor.hidden = false;
  })();

  window.App.leerFormulario = leerFormulario;
})();
