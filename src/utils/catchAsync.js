/**
 * Eine Wrapper-Funktion, die eine asynchrone Controller-Funktion entgegennimmt.
 * Sie sorgt dafür, dass jeder Fehler, der in der asynchronen Funktion auftritt,
 * an die zentrale Fehlerbehandlungs-Middleware von Express weitergeleitet wird.
 *
 * @param {Function} fn Die asynchrone Controller-Funktion, die gewrappt werden soll.
 * @returns {Function} Eine neue Funktion, die Express als Middleware verwenden kann.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
