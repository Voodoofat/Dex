//the user must have ETH deposted such that deposted eth >= buy order value
// the user must have enough tokens deposited such that token balance >= sell order amount
// the BUY order book should be ordred on pirce from highest to lowest starting at index 0

const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Eth2 = artifacts.require("Eth2");
const truffleAssert = require('truffle-assertions');

contract.skip ("Dex", accounts => {
    it("ETH balance should be >= order buy value", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let eth2 = await Eth2.deployed();
        await link.approve(dex.address,500);
        await eth2.approve(dex.address,500);
        dex.addToken(web3.utils.fromUtf8("Link"),link.address,{from: accounts[0]});
        dex.addToken(web3.utils.fromUtf8("ETH2"),eth2.address,{from: accounts[0]});
        await truffleAssert.reverts(
            dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,1)
        )
        await dex.deposit(100,web3.utils.fromUtf8("ETH2"));
        await truffleAssert.passes(
            dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,1)
        )
    })
    it("User should have enough tokens to sell", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        dex.addToken(web3.utils.fromUtf8("Link"),link.address,{from: accounts[0]});
        await truffleAssert.reverts(
            dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,1)
        )
        await dex.deposit(100,web3.utils.fromUtf8("Link"));
        await truffleAssert.passes(
            dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,1)
        )
    })
    
    
    it("the BUY order book should be ordred on pirce from highest to lowest starting at index 0", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        dex.addToken(web3.utils.fromUtf8("Link"),link.address,{from: accounts[0]});
        await dex.deposit(100,web3.utils.fromUtf8("Link"));
        
        await dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,10);
        await dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,100);
        await dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,30);
        await dex.createLimitOrder(0,web3.utils.fromUtf8("Link"),1,50);
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0);
        console.log(orderBook);
        for (i = 0; i < orderBook.length -1;i++) {
            assert(orderBook[i].price >= orderBook[i+1].price, "not the right BUY Book order");
        }
    })
    

    
    it("the SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        await dex.deposit(100,web3.utils.fromUtf8("Link"));
        dex.addToken(web3.utils.fromUtf8("Link"),link.address,{from: accounts[0]});
        
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,10);
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,50);
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,40);
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,100);
        await dex.createLimitOrder(1,web3.utils.fromUtf8("Link"),1,20);
        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("Link"),1);
        
        
        console.log(orderBook);
        for (i = 0; i < orderBook.length -1;i++) {
            assert(orderBook[i].price <= orderBook[i+1].price,"not the right SELL book order");
        }
    })   
})



