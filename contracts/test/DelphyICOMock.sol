pragma solidity ^0.4.11;

import '../DelphyICO.sol';

contract DelphyICOMock is DelphyICO {
    /*
     *  Storage
     */
    uint mock_blockTime = 0;
    uint mock_tokenTimes = 250;

    /*
     *  Public functions
     */
    /// @dev Contract constructor function
    /// @param _wallet Address of dutch auction contract.
    /// @param _startTime Array of addresses receiving preassigned tokens.
    function DelphyICOMock(address _wallet, uint _startTime) DelphyICO(_wallet,_startTime) {
        mock_blockTime = now;
    }

    /*
     *  Testing functions
     */
    function getBlockTime() internal constant returns (uint256) {
        return mock_blockTime;
    }

    function setMockedBlockTime(uint _b) public {
        mock_blockTime = _b;
    }

    function getTokenTimes() internal constant returns (uint256) {
        return mock_tokenTimes;
    }

    function setMockedTokenTimes(uint _t) public {
        mock_tokenTimes = _t;
    }
}