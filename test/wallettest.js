const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    it("should only be possible for owner to add tokens", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("Link"),link.address,{from: accounts[0]})
        )
        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("AAVE"),link.address,{from: accounts[1]})
        )
    })

    it("It should handle faulty withdrawls correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(dex.withdraw(500, web3.utils.fromUtf8("Link")))
       
    })

    it("It should handle correct withdrawls correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address,500);
        await dex.deposit(500,web3.utils.fromUtf8("Link"))
        await truffleAssert.passes(dex.withdraw(500, web3.utils.fromUtf8("Link")))
       
    })
})