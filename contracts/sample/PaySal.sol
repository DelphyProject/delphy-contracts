pragma solidity ^0.4.15;

import "../DelphyToken.sol";
import "../Owned.sol";

/// @dev `PaySal` is a smart contract that pay salaries.
/// Salary can be paid right now or delayed and be withdrawed
/// atfer a pointed period(roughtly). Salay paid in Ether and
/// Delphy 
contract PaySal is Owned {

    /*
     *  How salary is composite 
     */
    struct Ratio {
        // salary in any units, could be usd or rmb
        uint salary;
        // nounce to prevent double pay, each transaction 
        // has a uniqe nounce, and always increase. .eg
        uint nounce;
        // Ether paid in wei
        uint paidEth;
        // Delphy paid in wei 
        uint paidDpy;
        // Marking the block number that money can be withdraw from
        // Since time is not strictly secure, we use block number and
        // timestamp combined to release money. Assume average block
        // mine consume 10 seconds.
        uint releaseBlockNum;
        // Timestamp that money can be withdraw 
        uint releaseTimestamp;
        // paid or not
        bool notFinished;
    }

    /*
     *  Sum of frozend Eth and Dpy in wei
     */
    uint frozenEth;
    uint frozenDpy;

    /*
     *  Average block minning time in seconds
     */
    uint constant private BLOCKTIME = 9;

    /*
     *  DelphyToken smart contract
     */
    DelphyToken private delphy;

    /*
     *  Array of employers to be paid
     */
    mapping(address => Ratio) vault;

    /*
     *  Fired when empoyers has been paid or withdrawed
     */
    event SalaryPaid(address payee, uint nounce, uint salary, uint ethPaid, uint dpyPaid);
    event SalaryWithdrawed(address payee, uint nounce, uint salary, uint ethPaid, uint dpyPaid);

    /// @dev Pay employers salary
    /// @return employer's address
    function PaySal(address delphyAddress) public {
        delphy = DelphyToken(delphyAddress); 
    }

    /// @dev Set delphy contract address
    /// @return employer's address
    function setDelphy(address delphyAddress) public onlyOwner returns (bool) {
        delphy = DelphyToken(delphyAddress); 
        return true;
    }

    /// @dev Pay employers salary
    /// @param payee to receive salary
    /// @param salary to be paid
    /// @param ethPaid salary paid in Eth.
    /// @param dpyPaid salary paid in Dpy.
    /// @param releaseTime timestamp after that release the funds 
    /// @return pay salary success?
    function paySalary(address payee, uint salary, uint nounce, uint ethPaid, uint dpyPaid, uint releaseTime ) 
        payable
        public 
        onlyOwner 
        returns(bool) 
    {
        require(vault[payee].nounce <= nounce);
        require(payee != 0x0);
        require(isContract(payee) == false);

        // Double pay not allowed
        if (vault[payee].nounce == nounce && vault[payee].notFinished == false) {
            revert();
        }

        // Pending withdraw
        if (vault[payee].nounce < nounce && vault[payee].notFinished == true) {
            revert();
        }

        if (releaseTime < block.timestamp) {
            releaseTime = block.timestamp;
        }
        uint numBlocks = (releaseTime - block.timestamp) / BLOCKTIME;
        require(block.number <= block.number + numBlocks);
        numBlocks = block.number + numBlocks;

        vault[payee].salary = salary;
        vault[payee].nounce = nounce;
        vault[payee].paidEth = ethPaid;
        vault[payee].paidDpy = dpyPaid;
        vault[payee].releaseBlockNum = numBlocks;
        vault[payee].releaseTimestamp = releaseTime;
        vault[payee].notFinished = false;

        // Send directly
        if (releaseTime <= block.timestamp) {
            payee.transfer(ethPaid);
            require(delphy.transfer(payee, dpyPaid));
        } else {
            require(frozenEth + vault[payee].paidEth > frozenEth);
            require(frozenDpy + vault[payee].paidDpy > frozenDpy);
            frozenEth += vault[payee].paidEth;
            frozenDpy += vault[payee].paidDpy;
            vault[payee].notFinished = true;
        }
        SalaryPaid(payee, nounce, salary, ethPaid, dpyPaid);

        return true;
    }

    /// @dev Query account balance 
    function getBalance() public view returns (uint balance, uint ethBalance , uint dpyBalance, uint releaseTime) {
        address holder = msg.sender;
        if (vault[msg.sender].notFinished == true) {
            balance = vault[holder].salary;
            ethBalance = vault[holder].paidEth;
            dpyBalance = vault[holder].paidDpy;
            releaseTime = vault[holder].releaseTimestamp;
        }
        
        return (balance, ethBalance, dpyBalance, releaseTime);
    }

    /// @dev Withdraw the salary
    function withdrawSalary() payable public returns (bool) {
        require(vault[msg.sender].notFinished == true);
        require(frozenEth >= vault[msg.sender].paidEth);
        require(frozenDpy >= vault[msg.sender].paidDpy);
        require(block.number >= vault[msg.sender].releaseBlockNum);
        require(block.timestamp >= vault[msg.sender].releaseTimestamp);

        vault[msg.sender].notFinished = false;
        frozenEth -= vault[msg.sender].paidEth;
        frozenDpy -= vault[msg.sender].paidDpy;
        msg.sender.transfer(vault[msg.sender].paidEth);
        require(delphy.transfer(msg.sender, vault[msg.sender].paidDpy));
        SalaryWithdrawed(msg.sender, vault[msg.sender].nounce, vault[msg.sender].salary, 
                            vault[msg.sender].paidEth, vault[msg.sender].paidDpy);

        return true;
    }


    /// @dev Owner reclaim the free funds
    function reClaim() 
        payable 
        public 
        onlyOwner 
        returns(bool) 
    {
        require(this.balance >= frozenEth);
        require(delphy.balanceOf(this) >= frozenDpy);

        uint ethReclaimed = this.balance - frozenEth;
        uint dpyReclaimed = delphy.balanceOf(this) - frozenDpy;

        if (ethReclaimed != 0) {
            msg.sender.transfer(ethReclaimed);
        }
        if (dpyReclaimed != 0) {
            require(delphy.transfer(owner, dpyReclaimed));
        }

        return true;
    }

    /// @dev Get frozenEth and frozenDpy
    function getFrozen() public view returns (uint, uint) {
        return (frozenEth, frozenDpy);
    }

    /// @dev Is a address is contract
    function isContract(address _addr) constant internal returns(bool) {
        uint size;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }

    /// @dev Payable default function to receive ether 
    function () payable public {
    }

    /// @dev Get delphy for test purpose
    function getDelphy() public view returns (address) {
        return address(delphy);
    }
}


