const InstaChain = artifacts.require("InstaChain");

module.exports = function (_deployer) {
  _deployer.deploy(InstaChain);
};

