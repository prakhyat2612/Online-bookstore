
function validateGetByFilter(queryParams) {
  const allowedParams = [
    'title',
    'author',
    'genre',
    'description',
    'price',
    'isbn',
    'publicationDate',
    'publisher',
    'language',
    'imageUrl',
    'quantityAvailable',
    'ratings'
  ];

  for (const param in queryParams) {
    if (!allowedParams.includes(param)) {
      return false;
    }
  }
  return true;
}

module.exports = { validateGetByFilter };
