const notFound = async (req, res, next) => {
  return res.status(404).json({ msg: 'route not found' });
};
module.exports = notFound;
