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
        uint filled;
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
            Order(nextOrderId,msg.sender,side,ticker,amount,price,uint(side))
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

        if (side == Side.SELL) {
            require(balances[msg.sender]["Link"] >= amount);
        }
        uint orderBookSide;

        if(side == Side.BUY) {
            orderBookSide = 1;
        }

        else if(side == Side.SELL) {
            
            orderBookSide = 0;
        }

        Order[] storage orders = orderBook[ticker][orderBookSide];
        uint totalFilled = 0;

        
        for (uint256 i = 0 ; i < orders.length && totalFilled < amount; i++) {
            uint leftToFill = amount.sub(totalFilled);
            uint availableToFill = orders[i].amount.sub(orders[i].filled);
            uint filled = 0;

            if(availableToFill >= leftToFill) { //fill the entire market order
                filled = leftToFill;

            }
            else  { //availableToFill <= leftToFill fill as much as available on orders[i]
                filled = availableToFill;

            }

            totalFilled = totalFilled.add(filled);
            orders[i].filled = orders[i].filled.add(filled);
            uint cost = filled.mul(orders[i].price);
            
            if (side == Side.BUY) {
                //verify the buyer has enough ETH to cover the purchase
                require(balances[msg.sender]["ETH2"] >= cost);
                //execute the trade
                //transfer ETH from Buyer to Seller
                //Tranfer tokens from Seller to Buyer
                balances[msg.sender]["Link"] = balances[msg.sender]["Link"].add(totalFilled);
                balances[orders[i].trader]["Link"] = balances[msg.sender]["Link"].sub(totalFilled);
                balances[msg.sender]["ETH2"] = balances[msg.sender]["ETH2"].sub(cost);
                balances[orders[i].trader]["ETH2"] = balances[msg.sender]["ETH2"].add(cost);
                
            }

            else if(side == Side.SELL) {
                //execute trade
                
                balances[msg.sender]["Link"] = balances[msg.sender]["Link"].sub(totalFilled);
                balances[orders[i].trader]["Link"] = balances[msg.sender]["Link"].add(totalFilled);
                balances[msg.sender]["ETH2"] = balances[msg.sender]["ETH2"].add(cost);
                balances[orders[i].trader]["ETH2"] = balances[msg.sender]["ETH2"].sub(cost);
                //transfer ETH from Buyer to Seller
                //Tranfer tokens from Seller to Buyer
            }
            

            //execute the trade & Shift balances between buyer and selling
            //verify that the buyer has enough ETH to cover the trade
           

        } 
        
        
        //Loop through orderbook and remove 100% filled orders
        for (uint256 i = 0 ; i < orders.length; i++) {
            //if an order if completely filled then it should be removed
            if (orders[i].filled == orders[i].amount) {
                //loop to push all elements in the array forward and pop the last one
                    orders[i] = orders[i+1];
                //poping the last one
                orders.pop();
            }

        }
        
    }

       
    

}