'use strict';

const q = require('q');

class DataCache {
  
  constructor() {
    this.cache = {};
  }

  get(key) {
    const deferred = q.defer();

    process.nextTick(() => {
      let cacheEntry = this.cache[key],
          now = new Date();

      if(cacheEntry && (cacheEntry.expiryDate < now)) {
        cacheEntry = null;
        delete this.cache[key];
      }

      if(cacheEntry) {
        deferred.resolve(cacheEntry.value);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  }

  set(key, value, expiryDate) {
    const deferred = q.defer();

    process.nextTick(() => {
      this.cache[key] = {
        expiryDate: expiryDate,
        value: value
      };

      deferred.resolve(value);
    });

    return deferred.promise;
  }

}

module.exports = function() {
  return new DataCache();
};