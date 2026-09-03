    'use strict';

    const marketsTrade = Object.freeze({
  "antiDeception": true,
  "antiFraud": true,
  "flow": [
    "SOURCE",
    "OFFER",
    "MARKET",
    "CONTRACT",
    "FINANCE",
    "LOGISTICS",
    "COMMERCIAL_JOURNEY",
    "BORDER_OR_PORT",
    "WAREHOUSE",
    "DELIVERY",
    "ACCEPTANCE",
    "SETTLEMENT",
    "AUDIT"
  ],
  "marketTypes": [
    "B2B",
    "B2C",
    "B2G",
    "C2C",
    "WHOLESALE",
    "RETAIL",
    "AUCTION",
    "PROCUREMENT",
    "COMMODITY",
    "SERVICES",
    "DIGITAL"
  ],
  "noArtificialScarcity": true,
  "noMonopoly": true,
  "noRiba": true,
  "provenanceRequired": true,
  "weightsAndMeasuresJustice": true
});



    module.exports = { marketsTrade };
