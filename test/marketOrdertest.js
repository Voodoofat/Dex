
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Eth2 = artifacts.require("Eth2");
const truffleAssert = require('truffle-assertions');


//new contract to test out the Market Order Test functionality 
contract ("Market Order Functionality", accounts => {
    //when Creatng a SELL market Order, the seller needs to have enough tokens for the trade
    it("When creating a SELL market order, the seller needs to have enough tokens for the trade", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(
            dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),500)
        )
        await link.approve(dex.address,500)
        await dex.deposit(500, web3.utils.fromUtf8("Link"))
        await truffleAssert.passes(
            
            dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),500)
        )

    })
    //When Creating a BUY market Order, the buyer needs to have enough ETH for the trade
    it("When creating a BUY market order, the seller needs to have enough ETH for the trade", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let eth2= await Eth2.deployed();
        await truffleAssert.reverts(
            dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),500)
        )
        await eth2.approve(dex.address,500)
        await dex.deposit(500, web3.utils.fromUtf8("ETH2"))
        await truffleAssert.passes(
            
            dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),100)
        )

    })
    //Market Orders can be submitted even if the order book is empty
    it("Market Orders can be submitted even if the order book is empty", async() => {
        let dex = await Dex.deployed();
        //getting the buy side of the order book
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0) ;
        assert(orderBook.legnth == 0, "buy side of the order book should be empty");
        await truffleAssert.passes(
            dex.createMarketOrder(0, web3.utils.fromUtf8("Link"), 10)
        );       

    })
    //Market order should be filled until the orderbook is empty or the market order is 100% filled
    //this will be broken down into 2 tests which will check
    it("Market orders should be filled until 100% filled", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0);
        assert(orderBook.legnth == 0, "buy side of the order book should be empty");

        //adding Link token and minted 1000 Link per constructor
        await dex.addToken(web3.utils.fromUtf8("Link"), link.address);

        //sending Link from accounts 0 to 1,2,3
        await link.transfer(accounts[1],100);
        await link.transfer(accounts[2],100);
        await link.transfer(accounts[3],100);

        //approving dex contract from Link contract with accounts
        await link.approve(dex.address,100,{from: accounts[1]});
        await link.approve(dex.address,100,{from: accounts[2]});
        await link.approve(dex.address,100,{from: accounts[3]});

        //now to deposit link
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[1]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[2]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[3]});

        //now to create a sell market Orders with Link
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[1]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[2]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[3]});
        
        //now to create a buy market order with 250 Link from Accounts 0 
        await dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),250,{from: accounts[0]});

        assert(orderBook.legnth == 0,"All the filled orders should be removed from Orderbook");

    })
    //Market order should be filled until the orderbook is empty or the market order is 100% filled
    //this will be broken down into 2 tests which will check
    it("Market orders should be filled until The buy orderbook is empty", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0);
        assert(orderBook.legnth == 0, "buy side of the order book should be empty");

        //adding Link token and minted 1000 Link per constructor
        await dex.addToken(web3.utils.fromUtf8("Link"), link.address);

        //sending Link from accounts 0 to 1,2,3
        await link.transfer(accounts[1],100);
        await link.transfer(accounts[2],100);
        await link.transfer(accounts[3],100);

        //approving dex contract from Link contract with accounts
        await link.approve(dex.address,100,{from: accounts[1]});
        await link.approve(dex.address,100,{from: accounts[2]});
        await link.approve(dex.address,100,{from: accounts[3]});

        //now to deposit link
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[1]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[2]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[3]});

        //now to create a sell market Orders with Link
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[1]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[2]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[3]});
        
        //now to create a buy market order with 250 Link from Accounts 0 
        await dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),350,{from: accounts[0]});

        assert(orderBook.legnth != 0,"There should be more sell market orders available");

    })
    //the token balacnes of the sellers should decrease with the filled amounts
    it("the token balacnes of the sellers should decrease with the filled amounts", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        
        //adding Link token and minted 1000 Link per constructor
        await dex.addToken(web3.utils.fromUtf8("Link"), link.address);

        //sending Link from accounts 0 to 1,2,3
        await link.transfer(accounts[1],100);
        await link.transfer(accounts[2],100);
        await link.transfer(accounts[3],100);

        //approving dex contract from Link contract with accounts
        await link.approve(dex.address,100,{from: accounts[1]});
        await link.approve(dex.address,100,{from: accounts[2]});
        await link.approve(dex.address,100,{from: accounts[3]});

        //now to deposit link
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[1]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[2]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"),{from: accounts[3]});

        //creating a variable to store before Link balance
        let previousBalance1 = dex.balance[accounts[1]][web3.utils.fromUtf8("Link")]
        let previousBalance2 = dex.balance[accounts[2]][web3.utils.fromUtf8("Link")]
        let previousBalance3 = dex.balance[accounts[3]][web3.utils.fromUtf8("Link")]

        //now to create a sell market Orders with Link
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),100,{from: accounts[1]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),90,{from: accounts[2]});
        await dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),80,{from: accounts[3]});
        
        //now to create a buy market order with 250 Link from Accounts 0 
        await dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),270,{from: accounts[0]});

        //creating a variable to store after Link balance
        let afterBalance1 = dex.balance[accounts[1]][web3.utils.fromUtf8("Link")]
        let afterBalance2 = dex.balance[accounts[2]][web3.utils.fromUtf8("Link")]
        let afterBalance3 = dex.balance[accounts[3]][web3.utils.fromUtf8("Link")]

        assert(afterBalance1 == previousBalance1 - 100,"The Link balance for Account 1 is not correct");
        assert(afterBalance2 == previousBalance1 - 90,"The Link balance for Account 2 is not correct");
        assert(afterBalance3 == previousBalance1 - 80,"The Link balance for Account 3 is not correct");

    })


})