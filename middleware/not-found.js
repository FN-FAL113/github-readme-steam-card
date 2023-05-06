const notFound = (req, res) => res.status(404).send('Invalid resource endpoint!')

module.exports = notFound