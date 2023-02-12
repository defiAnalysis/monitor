const ethers = require("ethers");
const { FTMPROVIDER } = require("./conf");
let endpoint = FTMPROVIDER;
const provider = new ethers.providers.JsonRpcProvider(endpoint);
console.log("endpoint:", endpoint);

module.exports = {
  provider,
};
