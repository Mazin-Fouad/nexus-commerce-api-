/**
 * Berechnet Limit und Offset für die Paginierung basierend auf den Query-Parametern.
 * @param {object} query - Das req.query Objekt von Express.
 * @returns {{limit: number, offset: number, page: number}} Ein Objekt mit Limit, Offset und der aktuellen Seite.
 */
const getPagination = (query) => {
  const page = Math.abs(parseInt(query.page, 10)) || 1;
  const limit = Math.abs(parseInt(query.limit, 10)) || 20;
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

/**
 * Formatiert die paginierten Daten in eine standardisierte Antwort.
 * @param {object} data - Das Ergebnis von Sequelize's findAndCountAll (enthält count und rows).
 * @param {number} page - Die aktuelle Seitenzahl.
 * @param {number} limit - Die Anzahl der Elemente pro Seite.
 * @returns {{totalItems: number, data: Array, totalPages: number, currentPage: number}} Das formatierte Antwortobjekt.
 */
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, data: rows, totalPages, currentPage };
};

module.exports = {
  getPagination,
  getPagingData,
};