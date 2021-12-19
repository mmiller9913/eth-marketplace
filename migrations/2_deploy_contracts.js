/* eslint-disable no-undef */
//did the above b/c for some reason artifacts is not definded

const Marketplace = artifacts.require("../src/contracts/Marketplace.sol");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
};