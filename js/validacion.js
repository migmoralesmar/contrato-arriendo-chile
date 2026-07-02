window.App = window.App || {};

window.App.Validacion = (function () {

  const ETIQUETAS = {
    'arrendador-nombre': 'Nombre del arrendador',
    'arrendador-rut': 'RUT del arrendador',
    'arrendador-domicilio': 'Domicilio del arrendador',
    'arrendatario-nombre': 'Nombre del arrendatario',
    'arrendatario-rut': 'RUT del arrendatario',
    'arrendatario-domicilio': 'Domicilio del arrendatario',
    'propiedad-direccion': 'Dirección de la propiedad',
    'propiedad-comuna': 'Comuna de la propiedad',
    'condiciones-renta': 'Renta mensual',
    'condiciones-dia-pago': 'Día de pago',
    'condiciones-fecha-inicio': 'Fecha de inicio',
    'condiciones-fecha-termino': 'Fecha de término',
    'condiciones-garantia': 'Monto de garantía'
  };

  function validarFormulario(datos) {
    const errores = {};

    if (!datos.arrendador.nombre.trim()) errores['arrendador-nombre'] = 'Ingrese el nombre del arrendador.';
    if (!App.Rut.validarRut(datos.arrendador.rut)) errores['arrendador-rut'] = 'Ingrese un RUT válido.';
    if (!datos.arrendador.domicilio.trim()) errores['arrendador-domicilio'] = 'Ingrese el domicilio del arrendador.';

    if (!datos.arrendatario.nombre.trim()) errores['arrendatario-nombre'] = 'Ingrese el nombre del arrendatario.';
    if (!App.Rut.validarRut(datos.arrendatario.rut)) errores['arrendatario-rut'] = 'Ingrese un RUT válido.';
    if (!datos.arrendatario.domicilio.trim()) errores['arrendatario-domicilio'] = 'Ingrese el domicilio del arrendatario.';

    if (!datos.propiedad.direccion.trim()) errores['propiedad-direccion'] = 'Ingrese la dirección de la propiedad.';
    if (!datos.propiedad.comuna.trim()) errores['propiedad-comuna'] = 'Ingrese la comuna.';

    if (!datos.condiciones.rentaMensual || datos.condiciones.rentaMensual <= 0) {
      errores['condiciones-renta'] = 'Ingrese un monto de renta mayor a cero.';
    }
    if (!datos.condiciones.diaPago || datos.condiciones.diaPago < 1 || datos.condiciones.diaPago > 31) {
      errores['condiciones-dia-pago'] = 'Ingrese un día de pago entre 1 y 31.';
    }

    if (datos.condiciones.duracion.tipo === 'plazo') {
      if (!datos.condiciones.duracion.fechaInicio) {
        errores['condiciones-fecha-inicio'] = 'Ingrese la fecha de inicio.';
      }
      if (!datos.condiciones.duracion.fechaTermino) {
        errores['condiciones-fecha-termino'] = 'Ingrese la fecha de término.';
      } else if (datos.condiciones.duracion.fechaInicio && datos.condiciones.duracion.fechaTermino <= datos.condiciones.duracion.fechaInicio) {
        errores['condiciones-fecha-termino'] = 'La fecha de término debe ser posterior a la de inicio.';
      }
    }

    if (datos.condiciones.garantia === null || datos.condiciones.garantia === undefined || isNaN(datos.condiciones.garantia) || datos.condiciones.garantia < 0) {
      errores['condiciones-garantia'] = 'Ingrese un monto de garantía válido (puede ser 0).';
    }

    return { valido: Object.keys(errores).length === 0, errores };
  }

  function etiquetaCampo(id) {
    return ETIQUETAS[id] || id;
  }

  return { validarFormulario, etiquetaCampo };
})();
