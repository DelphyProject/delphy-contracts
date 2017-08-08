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

/// @title DelphyICO token contract
/// @author jsw
contract DelphyICO is Owned {
    using Math for uint;

    /*
     *  Events
     */
    event NewSale(address indexed destAddress, uint ethCost, uint gotTokens);

    /*
     *  Constants
     */
    /// -        intrest (presail in 24 months)         -       public sail       -pre-ico- dev team   -foundation-
    /// -                       50%                     -        (18 + 8)%        -   5%  -    10%     -    9%    -
    uint public constant TOTAL_TOKENS = 100000000 * 10**18; // 1e
    uint public constant TOTAL_TOKENS_PERCENT = 1000000 * 10**18; // 1e / 100
    uint public constant ICO_DURATION = 5 days;
    /// interest 50%
    address public INTEREST_HOLDER = 0xad854341e7989F5542189bB52265337E2993B7bc;
    uint public constant INTEREST_TOKENS = TOTAL_TOKENS_PERCENT * 50;
    /// first 18%
    address public constant PUBLIC_FIRST_HOLDER = 0x431Cf2c7310d15Ec9316510dAF6BbC48557ecB2C;
    uint public constant PUBLIC_FIRST_TOKENS = TOTAL_TOKENS_PERCENT * 18;
    /// second 8%
    // address public constant PUBLIC_SECOND_HOLDER = 0x4a75c0bD3e9B71A99fC9A5CAA92fcdb9Bc62a374;
    uint public constant PUBLIC_SECOND_TOKENS = TOTAL_TOKENS_PERCENT * 8;
    /// pre-ico 5%
    address public constant PRE_ICO_HOLDER = 0x32d192A05030F3Cf34DDb017b1306fB0E1378E1E;
    uint public constant PRE_ICO_TOKENS = TOTAL_TOKENS_PERCENT * 5;
    /// dev team 10%
    address public constant DEV_TEAM_HOLDER = 0x24b7c7800a3636844898832463FB6934337D8518;
    uint public constant DEV_TEAM_TOKENS = TOTAL_TOKENS_PERCENT * 10;
    /// foundation 9%
    address public constant FOUNDATION_HOLDER = 0xD6355e36b4715D7Ef80432ED0F7063FEbe0806A5;
    uint public constant FOUNDATION_TOKENS = TOTAL_TOKENS_PERCENT * 9;
    /// will sold
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
    /// ERC20 compilant Delphy token contact instance
    DelphyToken public delphyToken;

    /// Fields that can be changed by functions
    /// Accumulator for open sold tokens
    uint public openSoldTokens;
    /// Due to an emergency, set this to true to halt the contribution
    bool public halted;
    /// token bought by addr
    mapping (address => uint256) public lockedBalances;

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

    modifier isValidPayload() {
        require (msg.data.length == 4 || msg.data.length == 36);
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

        address[] memory orgs = new address[](6);
        uint[] memory nums = new uint[](6);
        orgs[0] = INTEREST_HOLDER;
        nums[0] = INTEREST_TOKENS;

        orgs[1] = PUBLIC_FIRST_HOLDER;
        nums[1] = PUBLIC_FIRST_TOKENS;

        orgs[2] = this;
        nums[2] = PUBLIC_SECOND_TOKENS;

        orgs[3] = PRE_ICO_HOLDER;
        nums[3] = PRE_ICO_TOKENS;

        orgs[4] = DEV_TEAM_HOLDER;
        nums[4] = DEV_TEAM_TOKENS;

        orgs[5] = FOUNDATION_HOLDER;
        nums[5] = FOUNDATION_TOKENS;
        delphyToken = new DelphyToken(orgs, nums);
    }

    /// @dev If anybody sends Ether directly to this  contract, consider he is getting delphy token
    function () public payable notHalted ceilingNotReached {
        buyDelphyToken(msg.sender);
    }

    /// @dev Exchange msg.value ether to Delphy for account receiver
    /// @param receiver Delphy tokens receiver
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

        if (receiver == 0x0)
            receiver = msg.sender;

        doBuyDelphyToken(receiver);

        return true;
    }

    /// @dev retrieve tokens if not sold out
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

    /// @dev Locking period has passed - Locked tokens have turned into tradeable
    ///      All tokens owned by receiver will be tradeable
    function claimTokens(address receiver)
        public
        isLaterThan(endTime)
        isValidPayload
    {
        if (receiver == 0x0)
            receiver = msg.sender;

        uint tokenCount = lockedBalances[receiver] ;
        require(tokenCount != 0x0);

        require(delphyToken.transfer(receiver, tokenCount));
        lockedBalances[receiver] = 0;
    }

    /// @dev Emergency situation that requires contribution period to stop.
    /// Contributing not possible anymore.
    function halt() public onlyWallet {
        halted = true;
    }

    /// @dev Emergency situation resolved.
    /// Contributing becomes possible again withing the outlined restrictions.
    function unHalt() public onlyWallet {
        halted = false;
    }

    /*
     *  Internal functions
     */
    /// @dev Buy Delphy token normally
    /// @param receiver is the receiver of delphy tokens
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

    /// @dev Utility function for buy delphy token
    /// @param receiver is the receiver of delphy tokens
    /// @param toFund is the ether amount to charge
    /// @param tokenCollect the amount of delphy tokens that will receive
    function doBuy(address receiver, uint toFund, uint tokenCollect) internal {
        require(msg.value >= toFund); // double check

        if(toFund > 0) {
            lockedBalances[receiver] += tokenCollect;
            wallet.transfer(toFund);
            openSoldTokens = openSoldTokens.add(tokenCollect);
            NewSale(receiver, toFund, tokenCollect);
        }

        uint toReturn = msg.value.sub(toFund);
        if(toReturn > 0) {
            msg.sender.transfer(toReturn);
        }
    }

    /// @dev Utility function for calculate available tokens and cost ethers
    /// @param availableToken is the amount of delphy tokens that will be send
    function calcEtherAndToken(uint availableToken) constant internal returns (uint costValue, uint getTokens){
        // all conditions has checked in the caller functions
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
    /// @param _addr The address being queried
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
