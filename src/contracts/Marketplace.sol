// pragma solidity >=0.4.21;
pragma solidity ^0.5.0;
// pragma solidity ^0.8.2;
// // pragma solidity >0.6.0;

//following along with this tutorial: https://www.youtube.com/watch?v=VH9Q2lf2mNo&t=4s
contract Marketplace {
    string public name;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }

    uint256 public productCount = 0;

    mapping(uint256 => Product) public products;

    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

     event ProductPurchased(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProduct(string memory _name, uint256 _price) public {
        //require a valid name
        require(bytes(_name).length > 0);
        //Require a valid price
        require(_price > 0);
        // Increment product count
        productCount++;
        // Create the product
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            msg.sender,
            false
        );
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint256 _id) public payable {
        //Fetch product -- get it out of the mapping
        Product memory _product = products[_id];
        //Fetch owner
        address payable _seller = _product.owner; 
        //Make sure the product is valid
        require(_product.id > 0 && _product.id <= productCount);
        //Require that there is enough ether
        require(msg.value >= _product.price);
        //Require product to not be purchase
        require(!_product.purchased);
        //Require that the buyer is not the seller
        require(_seller != msg.sender);
        //Transfer ownership to the buyer
        _product.owner = msg.sender;
        //Purchase it
        _product.purchased = true;
        //Update the product
        products[_id] = _product;
        //Pay the seller 
        address(_seller).transfer(msg.value);
        //Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}
