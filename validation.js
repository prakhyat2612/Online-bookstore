
function validateGetByFilter(queryParams) {
  const allowedParams = [
    'title',
    'author',
    'genre',
    'description',
    'maxPrice',
    'isbn',
    'publisher',
    'language',
  ];

  for (const param in queryParams) {
    if (!allowedParams.includes(param)) {
      return false;
    }
  }
  return true;
}

module.exports = { validateGetByFilter };
