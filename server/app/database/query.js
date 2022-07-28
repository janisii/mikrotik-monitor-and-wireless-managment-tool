const q = require("q");
const connection = require("./connection.js");

exports.myQuery = (queryString, queryVar) => {
  const deferred = q.defer();

  const query = connection.query(queryString, queryVar, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(rows);
    }
  });

  return deferred.promise;
};
