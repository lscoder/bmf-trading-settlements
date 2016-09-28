'use strict';

const q = require('q'),
      cheerio = require('cheerio');

class HtmlDataParser {

  constructor(options) {
    this.options = options;
  }

  parse(html) {
    const self = this,
          deferred = q.defer();

    process.nextTick(() => {
      try {
        deferred.resolve(this.parseSync(html));
      } catch(e) {
        deferred.reject(e);
      }
    });

    return deferred.promise;
  }

  parseSync(html) {
    const $ = cheerio.load(html),
          updatedAt = this.getUpdateDate($),
          $rows = $('#tblDadosAjustes').find('tbody tr');

    let commodities = {},
        commodityCode,
        commodityName;

    $rows.each((index, element) => {
      const $cols = $(element).find('td'),
            contractFullName = this.trim($($cols[0]).text()),
            contractMonth = this.trim($($cols[1]).text()),
            previousPrice = this.trim($($cols[2]).text()),
            currentPrice = this.trim($($cols[3]).text()),
            priceVariation = this.trim($($cols[4]).text()),
            valuePerContract = this.trim($($cols[5]).text());

      if(contractFullName) {
        const tokens = contractFullName.split('-');
        commodityCode = this.trim(tokens[0]),
        commodityName = this.trim(tokens[1]);
      }

      if(!commodities[commodityCode]) {
        commodities[commodityCode] = {
          name: commodityName,
          contracts: {}
        }
      }

      commodities[commodityCode].contracts[contractMonth] = {
        price: {
          previous: previousPrice,
          current: currentPrice,
          varitation: priceVariation,
          valuePerContract: valuePerContract
        }
      }
    });

    return {
      updatedAt: updatedAt,
      commodities: commodities
    };
  }

  trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  getUpdateDate($) {
    var gmt = this.options.date.gmt,
        dateRegex = /\d{2}\/\d{2}\/\d{4}/,
        elementText = $('form .legenda').text() || '';

    if(!dateRegex.test(elementText)) {
      return new Date(`1970-01-01`)
    }

    return new Date(elementText.match(dateRegex)[0] + 'GMT' + gmt);
  }
}

module.exports = function(options) {
  return new HtmlDataParser(options);
};