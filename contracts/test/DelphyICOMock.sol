pragma solidity ^0.4.11;

import '../DelphyICO.sol';

contract DelphyICOMock is DelphyICO {

  function DelphyICOMock(address _wallet, uint _startTime) DelphyICO(_wallet,_startTime) {}

  function getBlockNumber() internal constant returns (uint) {
    return mock_blockNumber;
  }

  function setMockedBlockNumber(uint _b) public {
    mock_blockNumber = _b;
  }

  uint mock_blockNumber = 1;
}