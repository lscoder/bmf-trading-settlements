'use strict';

const q = require('q'),
      url = require('url'),
      http = require('http');

class DataFecther {

  constructor(options) {
    this.options = options;
    this.deferred = null;
    this.fetching = false;
  }

  get requestOptions() {
    const dataUrl = url.parse(this.options.url);

    return {
      hostname: dataUrl.hostname,
      port: dataUrl.port || 80,
      path: dataUrl.path,
      method: 'GET',
      headers: {}
    };
  }

  fetch() {
    const options = this.requestOptions;

    if(this.deferred) {
      return this.deferred.promise;
    }

    this.deferred = q.defer();

    let html = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        this.deferred.resolve(html);
        this.deferred = null;
      });

      req.on('error', (e) => {
        this.deferred.reject(e);
        this.deferred = null;
      });
    });

    req.end();
    return this.deferred.promise;
  }
}

module.exports = function(options) {
  return new DataFecther(options);
};