'use strict';

module.exports = {
  fetcher: {
    url: process.env.BMF_FETCHER_URL || 'http://www2.bmf.com.br/pages/portal/bmfbovespa/lumis/lum-ajustes-do-pregao-enUS.asp'
  },
  parser: {
    date: {
      gmt: process.env.BMF_GMT || -3
    },
    tableSelector: process.env.BMF_PARSER_TABLE_SELECTOR || '#tblDadosAjustes'
  }
}