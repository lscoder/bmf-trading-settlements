'use strict';

const q = require('q');

class DataProvider {

  constructor(options) {
    this.cacheKey = 'tradingSettlements';
    this.parser = options.parser;
    this.fetcher = options.fetcher;
    this.cache = options.cache;
  }

  static getDeferred() {
    let deferred = DataProvider.deferred;

    if(!deferred) {
      deferred = DataProvider.deferred = q.defer();
      deferred.promise.then(() => {
        delete DataProvider.deferred;
      })
    }

    return deferred;
  }

  getContractData(contractCode) {
    const commodityCode = contractCode.substr(0, 3).toUpperCase(),
          contractMonth = contractCode.substr(3).toUpperCase();

    return this.get()
      .then(data => {
        const contract = (data.commodities[commodityCode] || {}).contracts[contractMonth] || {};

        return {
          code: commodityCode + contractMonth,
          price: contract.price
        };
      });
  }

  get() {
    let deferred = DataProvider.deferred;

    if(deferred) {
      return deferred.promise;
    }

    deferred = DataProvider.getDeferred();

    this.cache.get(this.cacheKey)
      .then(data => deferred.resolve(data))
      .catch(err => {
        this.fetchData()
          .then(data => this.cacheData(data))
          .then(data => deferred.resolve(data))
          .catch(err => {
            deferred.reject(err);
          });
      });

    return deferred.promise;
  }

  fetchData() {
    return this.fetcher.fetch()
      .then(html => this.parser.parse(html));
  }

  cacheData(data) {
    return this.cache.set(this.cacheKey, data, this.getExpiryDate());
  }

  getExpiryDate() {
    // const hourInMillis = 60 * 60 * 1000,
    const hourInMillis = 3 * 1000,
          expiryDate = new Date();

    expiryDate.setTime(expiryDate.getTime() + hourInMillis);
    return expiryDate;
  }
}

module.exports = function(options) {
  return new DataProvider(options);
};