window.App = window.App || {};

window.App.Uf = (function () {

  const URL_UF = 'https://mindicador.cl/api/uf';
  const TIMEOUT_MS = 4000;

  async function obtenerValorUF() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const respuesta = await fetch(URL_UF, { signal: controller.signal });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();
      const serie = datos && datos.serie;
      if (!Array.isArray(serie) || !serie.length || typeof serie[0].valor !== 'number') {
        throw new Error('Respuesta inesperada de mindicador.cl');
      }
      return serie[0].valor;
    } catch (error) {
      console.warn('No se pudo obtener el valor de la UF:', error);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return { obtenerValorUF };
})();
