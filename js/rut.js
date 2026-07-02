window.App = window.App || {};

window.App.Rut = (function () {

  function limpiarRut(rut) {
    return (rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
  }

  function calcularDV(cuerpo) {
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const resto = 11 - (suma % 11);
    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return String(resto);
  }

  function validarRut(rutCompleto) {
    const limpio = limpiarRut(rutCompleto);
    if (limpio.length < 2) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;
    return calcularDV(cuerpo) === dv;
  }

  function formatearRut(rutCompleto) {
    const limpio = limpiarRut(rutCompleto);
    if (limpio.length < 2) return rutCompleto || '';
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoConPuntos}-${dv}`;
  }

  return { limpiarRut, calcularDV, validarRut, formatearRut };
})();
