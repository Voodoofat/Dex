
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Eth2 = artifacts.require("Eth2");
const truffleAssert = require('truffle-assertions');


//new contract to test out the Market Order Test functionality 
contract ("Market Order Functionality", accounts => {
    //When Creating a BUY market Order, the buyer needs to have enough ETH for the trade
    it.skip("When Creating a BUY market Order, the buyer needs to have enough ETH for the trade", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let eth2 = await Eth2.deployed();

        //adding tokens to Dex
        dex.addToken(web3.utils.fromUtf8("Link"),link.address);
        dex.addToken(web3.utils.fromUtf8("ETH2"),eth2.address);

       

        //approve Dex to spend Eth2 accounts 1
        await eth2.approve(dex.address, 5000, {from: accounts[0]});
        await eth2.approve(dex.address, 1500, {from: accounts[1]});

        await link.approve(dex.address,200,{from: accounts[0]})
        await link.approve(dex.address,200,{from: accounts[1]})

        //Send Eth2 tokens to Accounts 1 from account 0
        await eth2.transfer(accounts[1],150);
        await link.transfer(accounts[1],150);

       
        
        await dex.deposit(200, web3.utils.fromUtf8("Link"),{from:accounts[0]});
        await dex.deposit(150, web3.utils.fromUtf8("Link"),{from:accounts[1]});

        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),100, 3,{from: accounts[0]});
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),150, 1,{from: accounts[1]});
        await truffleAssert.reverts(
            dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),500)
        )
         //deposit Eth2 into accounts 0 and 1 of Dex
         await dex.deposit(300, web3.utils.fromUtf8("ETH2"),{from:accounts[0]});
         await dex.deposit(150, web3.utils.fromUtf8("ETH2"),{from:accounts[1]});
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0);
        console.log(orderBook);
        let owner1Bal = await dex.balances(accounts[0],web3.utils.fromUtf8("ETH2"));
        console.log(owner1Bal);
        let owner2Bal = await dex.balances(accounts[1],web3.utils.fromUtf8("ETH2"));
        console.log(owner2Bal);
        await truffleAssert.passes(
            
            dex.createMarketOrder(0,web3.utils.fromUtf8("Link"),5,{from: accounts[1]})
       )
      
    })
    //when Creatng a SELL market Order, the seller needs to have enough tokens for the trade
     
    it("when Creatng a SELL market Order, the seller needs to have enough tokens for the trade", async() => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let eth2 = await Eth2.deployed();

        //adding tokens to the Dex
        dex.addToken(web3.utils.fromUtf8("Link"),link.address);
        dex.addToken(web3.utils.fromUtf8("ETH2"), eth2.address);
       
        //approving dex for Link token
        await link.approve(dex.address,100,{from:accounts[0]});
        
        let owner1Bal = await dex.balances(accounts[0],web3.utils.fromUtf8("Link"));
        console.log(owner1Bal);
        //should revert since there are no Link tokens in dex countract
       await truffleAssert.reverts(
            dex.createMarketOrder(1,web3.utils.fromUtf8("Link"),500)
        )
        //depositing link to dex contract
        await dex.deposit(100, web3.utils.fromUtf8("Link"),{from:accounts[0]});


        
        await truffleAssert.passes(
            
            dex.createMarketOrder(1, web3.utils.fromUtf8("Link"),5,{from: accounts[0]})
       )

    })
    
    //Market Orders can be submitted even if the order book is empty
    it.skip("Market Orders can be submitted even if the order book is empty", async() => {
        let dex = await Dex.deployed();
        //getting the buy side of the order book
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0) ;
        assert(orderBook.length == 0, "buy side of the order book should be empty");
        await truffleAssert.passes(
            dex.createMarketOrder(0, web3.utils.fromUtf8("Link"), 10)
        );       

    })
    
    //Market order should be filled until the orderbook is empty or the market order is 100% filled
    //this will be broken down into 2 tests which will check
    it.skip("Market orders should be filled until 100% filled", async() => {
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
    it.skip("Market orders should be filled until The buy orderbook is empty", async() => {
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
    it.skip("the token balacnes of the sellers should decrease with the filled amounts", async() => {
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