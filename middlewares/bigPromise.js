// use try catch and async-await || use proise everywhere

module.exports = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
