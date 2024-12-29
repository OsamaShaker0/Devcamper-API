const advancedResults = (model, populate) => async (req, res, next) => {
  //copy req.query
  const reqQuery = { ...req.query };
  // create fildes to exculude
  const removeFileds = ['select', 'sort', 'page', 'limit'];

  // loop over remove fields and delete them from reqQuery
  removeFileds.forEach((param) => delete reqQuery[param]);
  // create query string
  let queryStr = JSON.stringify(reqQuery);
  // create operators (gt and gte ...etc)
  queryStr = queryStr.replace(
    /\b(lt|lte|gt|gte|in)\b/g,
    (match) => `$${match}`
  );
  // find resource
  let query = model.find(JSON.parse(queryStr));

  // select fields
  if (req.query.select) {
    let fields = req.query.select.replaceAll(',', ' ');
    query = query.select(fields);
  }
  // SORT
  if (req.query.sort) {
    const sortBy = req.query.sort.replaceAll(',', ' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // pagenation
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);
  // populate
  if (populate) {
    query = query.populate(populate);
  }
  //excuting our query
  const result = await query;
  // pagenation result ;
  let pagenation = {};
  if (endIndex < total) {
    pagenation.next = {
      page: page + 1,
      limit,
    };
  }
  if (page != 1) {
    pagenation.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: result.length,
    pagenation,
    data: result,
  };
  next()
};
module.exports = advancedResults