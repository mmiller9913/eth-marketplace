// const { artifacts } = require("truffle");
/* eslint-disable no-undef */
//did the above b/c for some reason artifacts is not definded

const Migrations = artifacts.require("../src/contracts/Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
