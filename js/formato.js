window.App = window.App || {};

window.App.Formato = (function () {

  const ORDINALES = [
    'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO',
    'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO', 'UNDÉCIMO', 'DUODÉCIMO'
  ];

  function numeroOrdinalLetras(n) {
    return ORDINALES[n - 1] || `CLÁUSULA ${n}`;
  }

  function formatCLP(numero) {
    const valor = Number(numero) || 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor);
  }

  function formatFecha(fechaISO) {
    if (!fechaISO) return '';
    const [anio, mes, dia] = fechaISO.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(fecha);
  }

  return { numeroOrdinalLetras, formatCLP, formatFecha };
})();
