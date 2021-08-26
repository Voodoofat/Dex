const Link = artifacts.require("Link");
const Dex = artifacts.require("Dex");
const Eth2 = artifacts.require("Eth2");

module.exports =async function (deployer, network, accounts) {
  await deployer.deploy(Link);
  await deployer.deploy(Dex);
  await deployer.deploy(Eth2);
};
