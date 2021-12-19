/* eslint-disable no-undef */

const { assert } = require("chai");

//did the above b/c for some reason artifacts is not definded
const Marketplace = artifacts.require('./Marketplace.sol');

contract('Marketplace', ([deployer, buyer, seller]) => {
  let marketplace;

  //these are in our package.json file
  //needed for testing failure cases when creating product
  require('chai')
    .use(require('chai-as-promised'))
    .should()

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Dapp University Marketplace')
    })
  })

  describe('products', async () => {
    let productCount, result;

    before(async () => {
      result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller });
      productCount = await marketplace.productCount();
    })

    it('creates product', async () => {
      assert.equal(productCount, 1)
      const event = result.logs[0].args;
      // console.log(event);

      assert.equal(event.id.toNumber(), 1, 'id is correct');
      assert.equal(event.name, 'iPhone X', 'name is correct');
      assert.equal(event.price, '1000000000000000000', 'price is correct'); //this is 1000000000000000000 b/c 1 Ether = 1000000000000000000 Wei
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      //check for failures
      //FAILURE: product must have a name
      await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      //FAILURE: product must have a price
      await marketplace.createProduct('iPhone X', 0, { from: seller }).should.be.rejected;
    })

    it('lists product', async () => {
      const product = await marketplace.products(productCount);
      assert.equal(product.id.toNumber(), 1, 'id is correct');
      assert.equal(product.name, 'iPhone X', 'name is correct');
      assert.equal(product.price, '1000000000000000000', 'price is correct'); //this is 1000000000000000000 b/c 1 Ether = 1000000000000000000 Wei
      assert.equal(product.owner, seller, 'owner is correct')
      assert.equal(product.purchased, false, 'purchased is correct')
    })

    it('sells product', async () => {

      //track the seller balance before the purchase
      let oldSellerBalance;
      oldSellerBalance = await web3.eth.getBalance(seller); //get balance -- this is a string 
      oldSellerBalance = new web3.utils.BN(oldSellerBalance); //convert it to a big number -- so we can do addition

      result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') });

      //check logs
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), 1, 'id is correct');
      assert.equal(event.name, 'iPhone X', 'name is correct');
      assert.equal(event.price, '1000000000000000000', 'price is correct'); //this is 1000000000000000000 b/c 1 Ether = 1000000000000000000 Wei
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')

      //check to make sure seller received funds
      let newSellerBalance;
      newSellerBalance = await web3.eth.getBalance(seller);
      newSellerBalance = new web3.utils.BN(newSellerBalance);

      let price;
      price = web3.utils.toWei('1', 'Ether');
      price = new web3.utils.BN(price);

      const exepectedBalance = oldSellerBalance.add(price);

      //must convert back to string to compare
      assert.equal(newSellerBalance.toString(), exepectedBalance.toString());

      //check for failures
      //FAILURE: Buyer tries to buy a product that doesn't exist (AKA invalid id)
      await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      //FAILURE: Buyer tries to buy without enough ether
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      //FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice -- it's already been purchased based on above logic
      await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      //FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })

  })
})