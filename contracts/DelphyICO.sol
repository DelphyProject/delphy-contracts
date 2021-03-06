/*

  Copyright 2017 Delphy Foundation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/

//   /$$$$$$$            /$$           /$$
//  | $$__  $$          | $$          | $$
//  | $$  \ $$  /$$$$$$ | $$  /$$$$$$ | $$$$$$$  /$$   /$$
//  | $$  | $$ /$$__  $$| $$ /$$__  $$| $$__  $$| $$  | $$
//  | $$  | $$| $$$$$$$$| $$| $$  \ $$| $$  \ $$| $$  | $$
//  | $$  | $$| $$_____/| $$| $$  | $$| $$  | $$| $$  | $$
//  | $$$$$$$/|  $$$$$$$| $$| $$$$$$$/| $$  | $$|  $$$$$$$
//  |_______/  \_______/|__/| $$____/ |__/  |__/ \____  $$
//                          | $$                 /$$  | $$
//                          | $$                |  $$$$$$/
//                          |__/                 \______/

pragma solidity ^0.4.11;
import "./Math.sol";
import "./Owned.sol";
import "./DelphyToken.sol";


/// @title DelphyICO Contribution contract
/// For Delphy ICO details: https://delphy.org/index.html#ICO
/// For Delphy Project: https://delphy.org
/// @author jsw@delphy.org
contract DelphyICO is Owned {
    using Math for uint;

    /*
     *  Events
     */

    event NewSale(address indexed destAddress, uint ethCost, uint gotTokens);

    /*
     *  Constants
     */

    /// - Delphy token distribution
    ///
    /// -        bonus (post-sale in 24 months)         -       public sale       -pre-ico- dev team   -foundation-
    /// -                       50%                     -        (18 + 8)%        -   5%  -    10%     -    9%    -
    ///
    uint public constant TOTAL_TOKENS = 100000000 * 10**18; // 1e
    uint public constant TOTAL_TOKENS_PERCENT = 1000000 * 10**18; // 1e / 100
    uint public constant ICO_DURATION = 5 days;

    /// bonus coin distribution 50%
    address public BONUS_HOLDER = 0x5421da24adE5e108F48b1b39f6Aa82a47aE49318;
    uint public constant BONUS_TOKENS = TOTAL_TOKENS_PERCENT * 50;

    /// first round ICO: 18%
    address public constant PUBLIC_FIRST_HOLDER = 0xD01024AFa5cA097f5BEA8A6ceeE8902014C45628;
    uint public constant PUBLIC_FIRST_TOKENS = TOTAL_TOKENS_PERCENT * 18;

    /// second round ICO: 8%
    /// address public constant PUBLIC_SECOND_HOLDER = 0x9F3A4BBeD4660F2DCCd6E980e2FaA6d6214E5Dc8;
    uint public constant PUBLIC_SECOND_TOKENS = TOTAL_TOKENS_PERCENT / 10 * 25;

    address public constant PUBLIC_SECOND_PRESOLD_HOLDER = 0xF27a5B6501C5d15D56BDBeeC5394008fe0a71382;
    uint public constant PUBLIC_SECOND_PRESOLD_TOKENS = TOTAL_TOKENS_PERCENT / 10 * 55;

    /// pre-ico 5%
    address public constant PRE_ICO_HOLDER = 0x2593afA39CeB0d0E0a6024D5Dc9365814b4fD379;
    uint public constant PRE_ICO_TOKENS = TOTAL_TOKENS_PERCENT * 5;

    /// dev team 10%
    address public constant DEV_TEAM_HOLDER = 0xB617e4070F8c22ED0E283268E038ea6E22ea685C;
    uint public constant DEV_TEAM_TOKENS = TOTAL_TOKENS_PERCENT * 10;

    /// Delphy Foundation 9%
    address public constant FOUNDATION_HOLDER = 0xF55aB9b3895bBA429f8c41DDa7415b21EcA02c22;
    uint public constant FOUNDATION_TOKENS = TOTAL_TOKENS_PERCENT * 9;

    /// maximum tokens to-be-sold
    uint public constant MAX_OPEN_SOLD = PUBLIC_SECOND_TOKENS;

    /*
     *  Storage
     */

    /// Fields that are only changed in constructor
    /// All deposited ETH will be instantly forwarded to this address.
    address public wallet;

    /// ICO start time
    uint public startTime;

    /// ICO end time
    uint public endTime;

    /// ERC20 compliant Delphy token contact instance
    DelphyToken public delphyToken;

    /// Fields that can be changed by functions
    /// Accumulator for tokens sold in ICO
    uint public openSoldTokens;

    /// In emergency, set this to true to halt the contribution
    bool public halted;

    /*
     *  Modifiers
     */

    modifier onlyWallet {
        require(msg.sender == wallet);
        _;
    }

    modifier notHalted() {
        require(!halted);
        _;
    }

    modifier initialized() {
        require(address(wallet) != 0x0);
        _;
    }

    modifier notEarlierThan(uint x) {
        require(getBlockTime() >= x);
        _;
    }

    modifier earlierThan(uint x) {
        require(getBlockTime() < x);
        _;
    }

    modifier ceilingNotReached() {
        require(openSoldTokens < MAX_OPEN_SOLD);
        _;
    }

    modifier isLaterThan (uint x) {
        assert(getBlockTime() > x);
        _;
    }

    modifier isNotContract(address _addr) {
        require(!isContract(_addr));
        _;
    }

    /*
     *  Public functions
     */

    /// @dev Contract constructor function set Delphy ICO contract
    /// @param _wallet The escrow account address, all ethers will be sent to this address.
    /// @param _startTime ICO start time
    function DelphyICO(address _wallet, uint _startTime) public {
        require (_wallet != 0);

        halted = false;
        wallet = _wallet;
        startTime = _startTime;
        endTime = startTime + ICO_DURATION;
        openSoldTokens = 0;

        address[] memory orgs = new address[](7);
        uint[] memory nums = new uint[](7);
        orgs[0] = BONUS_HOLDER;
        nums[0] = BONUS_TOKENS;

        orgs[1] = PUBLIC_FIRST_HOLDER;
        nums[1] = PUBLIC_FIRST_TOKENS;

        orgs[2] = this;
        nums[2] = PUBLIC_SECOND_TOKENS;

        orgs[3] = PUBLIC_SECOND_PRESOLD_HOLDER;
        nums[3] = PUBLIC_SECOND_PRESOLD_TOKENS;

        orgs[4] = PRE_ICO_HOLDER;
        nums[4] = PRE_ICO_TOKENS;

        orgs[5] = DEV_TEAM_HOLDER;
        nums[5] = DEV_TEAM_TOKENS;

        orgs[6] = FOUNDATION_HOLDER;
        nums[6] = FOUNDATION_TOKENS;
        delphyToken = new DelphyToken(orgs, nums);
    }

    /// @dev If Ethers are sent directly to this contract,
    //          then Delphy tokens are considered being purchased.
    function () public payable notHalted ceilingNotReached {
        buyDelphyToken(msg.sender);
    }

    /// @dev purchase Delphy Tokens with Ethers for receiver.
    /// @param receiver the address of Delphy tokens receiver
    function buyDelphyToken(address receiver)
        public
        payable
        notHalted
        initialized
        ceilingNotReached
        notEarlierThan(startTime)
        earlierThan(endTime)
        returns (bool)
    {
        require(msg.value >= 0.1 ether);
        require(msg.value <= 20 ether);

        if (receiver == 0x0)
            receiver = msg.sender;

        doBuyDelphyToken(receiver);

        return true;
    }

    /// @dev collect all left-over tokens when ICO ends
    function finishICO()
        public
        onlyWallet
        isLaterThan(endTime)
        returns (bool)
    {
        if (openSoldTokens < MAX_OPEN_SOLD) {
            uint tokenAvailable = MAX_OPEN_SOLD.sub(openSoldTokens);
            require(delphyToken.transfer(wallet, tokenAvailable));
            openSoldTokens = MAX_OPEN_SOLD;
        }
        return true;
    }

    /// @dev Stop contribution when in emergency.
    /// Contribution is not possible anymore.
    function halt() public onlyWallet {
        halted = true;
    }

    /// @dev Un-halt when emergency situation is resolved.
    /// Contribution becomes possible again
    function unHalt() public onlyWallet {
        halted = false;
    }

    /*
     *  Internal functions
     */

    /// @dev Buy Delphy token normally
    /// @param receiver is the receiving address of delphy tokens
    function doBuyDelphyToken(address receiver) internal {
        // Do not allow contracts to game the system
        require(!isContract(msg.sender));

        uint tokenAvailable = MAX_OPEN_SOLD.sub(openSoldTokens);
        require(tokenAvailable != 0);

        uint toFund;
        uint toCollect;
        (toFund, toCollect) = calcEtherAndToken(tokenAvailable);
        doBuy(receiver, toFund, toCollect);
    }

    /// @dev Utility function to buy Delphy tokens
    /// @param receiver is the receiving address of Delphy tokens
    /// @param toFund is the ether amount to be paid
    /// @param tokenCollect the number of delphy tokens purchased
    function doBuy(address receiver, uint toFund, uint tokenCollect) internal {
        require(msg.value >= toFund); // double check

        if(toFund > 0) {
            wallet.transfer(toFund);
            require(delphyToken.transfer(receiver, tokenCollect));
            openSoldTokens = openSoldTokens.add(tokenCollect);
            NewSale(receiver, toFund, tokenCollect);
        }

        uint toReturn = msg.value.sub(toFund);
        if(toReturn > 0) {
            msg.sender.transfer(toReturn);
        }
    }

    /// @dev Utility function to calculate available tokens and cost in ethers
    /// @param availableToken is the number of Delphy tokens that will be purchased
    function calcEtherAndToken(uint availableToken) constant internal returns (uint costValue, uint getTokens){
        // all conditions have been checked in the caller functions
        uint exchangeRate = getTokenTimes();
        getTokens = exchangeRate * msg.value;

        if(availableToken >= getTokens){
            costValue = msg.value;
        } else {
            costValue = availableToken / exchangeRate;
            getTokens = availableToken;
        }
    }

    /// @dev Internal function to determine if an address is a contract
    /// @param _addr The address to-be-verified
    /// @return True if `_addr` is a contract
    function isContract(address _addr) constant internal returns(bool) {
        uint size;

        if (_addr == 0)
          return false;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }

    /*
     *  Testing functions
     */
    /// @notice This function is overridden by the test Mocks.
    function getBlockTime() internal constant returns (uint256) {
        return block.timestamp;
    }

    /// @notice This function is overridden by the test Mocks.
    function getTokenTimes() internal constant returns (uint256) {
        return 250;
    }

}
