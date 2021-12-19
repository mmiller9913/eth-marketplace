import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'; //installed in package.json 
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // await window.ethereum.enable() //not sure if this is needed
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    // console.log(accounts);

    //store account to the react state object
    this.setState({ account: accounts[0] });

    //get smart contract
    const abi = Marketplace.abi;

    //get address of where contract is deployed 
    //method 1 
    //note: 5777 is in the abi file, it's the network ID for Ganache
    //5777 is the networkID that determines which network we're connected to with Metamask
    // const address = Marketplace.networks[5777].address; 
    // const marketplace = web3.eth.Contract(abi, address);

    //method 2 - don't want to hard code the network ID 
    // const networkId = await web3.eth.net.getId();
    // const address = Marketplace.networks[networkId].address; 
    // const marketplace = web3.eth.Contract(abi, address);

    //method 3 -- for cases when Marketplace.networks[networkId] is undefined
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const marketplace = web3.eth.Contract(abi, networkData.address)
      console.log(marketplace);

      //store marketplace inside the state
      this.setState({ marketplace });

      //get product count and set it to the state
      //.call() just reads data
      const productCount = await marketplace.methods.productCount().call()
      this.setState({ productCount })

      //add products to state
      for (var i = 1; i <= this.state.productCount; i++) {
        const product = await this.state.marketplace.methods.products(i).call();
        //below, adding the product to the existing products arry
        //spread operator takes existing array, adds to it 
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false });

    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }

  }

  //this is needed when setting state?
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    //binding these function to the component 
    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);

  }

  createProduct(name, price) {
    this.setState({ loading: true });
    //methods, seen below, exposes the smart contract's methods
    //.send() sends transactions 
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  //notes on the below
  //account={this.state.account} - this.state.account has to do w/ the constructor abpve
  //{this.createProduct} - this says "the createProduct function in the Main component = this.createProdudct in the constructor"
  //products={this.state.products} - passing along the products 
  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
