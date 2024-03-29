pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/Access/Ownable.sol";

contract Wallet is Ownable {

    struct Token{
        bytes32 ticker;
        address tokenAddress;

    }

    mapping (bytes32 => Token) public tokenMapping;
    bytes32[] public tokenList;
    using SafeMath for uint256;

    mapping (address => mapping(bytes32 => uint256)) public balances;

    
    modifier tokenExists(bytes32 ticker) {
        require(tokenMapping[ticker].tokenAddress != address(0), "Token Does not Exist");
        _;
    }

    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }
    function deposit(uint amount, bytes32 ticker) external tokenExists(ticker) {
        
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);
    }
    function withdraw(uint amount, bytes32 ticker)  external tokenExists(ticker) {
        require(balances[msg.sender][ticker] >= amount,"Balance not Sufficient");
        
        balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }
}