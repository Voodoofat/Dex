pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Link is ERC20 {
    constructor() ERC20("Chainlink", "LINK") public {
        _mint(msg.sender,1000);
    }
}

contract Eth2 is ERC20 {
    constructor() ERC20("Ether2", "ETH2") public {
        _mint(msg.sender,1000);
    }
}
