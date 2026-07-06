window.App = window.App || {};

window.App.Formato = (function () {

  const ORDINALES = [
    'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO',
    'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO', 'UNDÉCIMO', 'DUODÉCIMO'
  ];

  const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const ESPECIALES_10_29 = {
    10: 'diez', 11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince',
    16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve',
    20: 'veinte', 21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro',
    25: 'veinticinco', 26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve'
  };
  const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

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

  function convertirDosDigitos(n, apocopado) {
    if (n < 10) return apocopado && n === 1 ? 'un' : UNIDADES[n];
    if (n <= 29) return n === 21 ? (apocopado ? 'veintiún' : 'veintiuno') : ESPECIALES_10_29[n];
    const d = Math.floor(n / 10), u = n % 10;
    if (u === 0) return DECENAS[d];
    if (u === 1 && apocopado) return `${DECENAS[d]} y un`;
    return `${DECENAS[d]} y ${UNIDADES[u]}`;
  }

  function convertirGrupoDeTres(n, apocopado) {
    if (n === 0) return '';
    if (n === 100) return 'cien';
    const c = Math.floor(n / 100), resto = n % 100;
    const partes = [];
    if (c > 0) partes.push(CENTENAS[c]);
    if (resto > 0) partes.push(convertirDosDigitos(resto, apocopado));
    return partes.join(' ');
  }

  function numeroALetras(numero) {
    let n = Math.floor(Math.abs(Number(numero)) || 0);
    if (n === 0) return 'cero';
    if (n > 999999999) n = 999999999;
    const millones = Math.floor(n / 1000000);
    const miles = Math.floor((n % 1000000) / 1000);
    const resto = n % 1000;
    const partes = [];
    if (millones > 0) partes.push(millones === 1 ? 'un millón' : `${convertirGrupoDeTres(millones, true)} millones`);
    if (miles > 0) partes.push(miles === 1 ? 'mil' : `${convertirGrupoDeTres(miles, true)} mil`);
    if (resto > 0) partes.push(convertirGrupoDeTres(resto, false));
    return partes.join(' ').replace(/\s+/g, ' ').trim();
  }

  function aplicarApocopeFinal(letras, entero, genero) {
    if (entero === 1) return genero === 'f' ? 'una' : 'un';
    if (/veintiuno$/.test(letras)) return letras.replace(/veintiuno$/, genero === 'f' ? 'veintiuna' : 'veintiún');
    if (/(^|\s)uno$/.test(letras)) return letras.replace(/uno$/, genero === 'f' ? 'una' : 'un');
    return letras;
  }

  function extraerDecimales(valorOriginal) {
    const partes = String(valorOriginal).split('.');
    if (partes.length < 2) return '';
    return partes[1] === '0' ? '' : partes[1];
  }

  function decimalesALetras(decimalesStr) {
    if (!decimalesStr) return '';
    if (decimalesStr.length > 1 && decimalesStr[0] === '0') {
      return decimalesStr.split('').map(d => numeroALetras(Number(d))).join(' ');
    }
    return numeroALetras(Number(decimalesStr));
  }

  function formatMonto(valorOriginal, moneda) {
    const valorNum = Number(valorOriginal) || 0;
    if (moneda === 'uf') {
      const enteroParte = Math.floor(valorNum);
      const decimales = extraerDecimales(valorOriginal);
      const cifra = `${enteroParte.toLocaleString('es-CL')}${decimales ? ',' + decimales : ''} UF`;
      let letras = aplicarApocopeFinal(numeroALetras(enteroParte), enteroParte, 'f');
      if (decimales) letras += ` coma ${decimalesALetras(decimales)}`;
      const singular = enteroParte === 1 && !decimales;
      return `${cifra} (${letras} ${singular ? 'Unidad de Fomento' : 'Unidades de Fomento'})`;
    }
    const entero = Math.round(valorNum);
    const letras = aplicarApocopeFinal(numeroALetras(entero), entero, 'm');
    return `${formatCLP(entero)} (${letras} ${entero === 1 ? 'peso chileno' : 'pesos chilenos'})`;
  }

  return { numeroOrdinalLetras, formatCLP, formatFecha, numeroALetras, formatMonto };
})();
