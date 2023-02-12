const NodeCache = require("node-cache");

module.exports = {
  ClaimMintCache: new NodeCache({
    stdTTL: 0.1,
    checkperiod: 0.1,
  }),
  DegreeHeatsCache: new NodeCache({
    stdTTL: 0.1,
    checkperiod: 0.1,
  }),
};
