'use strict';

let config = require('./config'),
    inMemoryCache = require('./lib/cache')(),
    dataFetcher = require('./lib/fetcher')(config.fetcher),
    dataParser = require('./lib/parser')(config.parser),
    dataProvider = require('./lib/provider')({
      cache: inMemoryCache,
      fetcher: dataFetcher,
      parser: dataParser
    });


module.exports = function(contract) {
  return dataProvider.getContractData(contract);
}