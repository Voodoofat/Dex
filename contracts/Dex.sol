pragma solidity ^0.8.0;
pragma abicoder v2;

import "../contracts/Wallet.sol";

contract Dex is Wallet {

    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint public nextOrderId = 0;

    mapping(bytes32 => mapping (uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) public view returns(Order[] memory) {
        return orderBook[ticker][uint(side)];

    }

    //function to buy a token with ticker and amount of tokens
    function createLimitOrder(Side side, bytes32 ticker,uint amount, uint price) public {
        if(side == Side.BUY) {
            require(balances[msg.sender]["ETH2"] >= amount.mul(price));

        }
        else if(side == Side.SELL) {
            require(balances[msg.sender][ticker] >= amount);
            
        }

        //[Order1,Order2]
        Order[] storage orders = orderBook[ticker][uint(side)];
        
        orders.push(
            Order(nextOrderId,msg.sender,side,ticker,amount,price)
        );

        
        //Bubble sort
        uint i = orders.length >0 ? orders.length -1 :0;

        if (side == Side.BUY) {
            
            while(i>0) {
                if (orders[i-1].price > orders[i].price) {
                    break;
                }
                Order memory tempOrder = orders[i-1];
                orders[i-1] = orders[i];
                orders[i]= tempOrder;
                i = i - 1;
            }
            
            
        }

        else if (side == Side.SELL) {
            while(i>0) {
                if (orders[i-1].price < orders[i].price) {
                    break;
                }
                Order memory tempOrder = orders[i-1];
                orders[i-1] = orders[i];
                orders[i]= tempOrder;
                i = i - 1;
            }

        }
        
        nextOrderId = nextOrderId+1;
    }

    //function to create Market Order
    function createMarketOrder(Side side, bytes32 ticker,uint amount) public {

    }
  
    

}